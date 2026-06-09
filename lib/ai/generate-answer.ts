import { openai } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";
import {
  buildChatUserPrompt,
  buildContextBlock,
  buildFitAnalysisUserPrompt,
  FIT_ANALYSIS_PROMPT,
  SYSTEM_PROMPT,
} from "./prompts";
import { retrieveContext } from "./retrieve-context";
import type {
  AnalysisResults,
  FitAnalysisResult,
  RetrievedChunk,
  SessionPreferences,
} from "@/lib/types";
import { CHAT_MODEL } from "@/lib/constants";
import { canRunAnalysis } from "@/lib/documents/indexed";
import { getSessionDocuments } from "@/lib/db/queries";

const fitSchema = z.object({
  overall_fit_score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  evidence: z.array(
    z.object({
      source: z.string(),
      excerpt: z.string(),
      chunkId: z.string(),
    }),
  ),
  interview_risks: z.array(z.string()),
  recommended_positioning: z.string(),
});

function preferencesToString(prefs?: SessionPreferences): string | undefined {
  if (!prefs) return undefined;
  const parts: string[] = [];
  if (prefs.roleLevel) parts.push(`role level: ${prefs.roleLevel}`);
  if (prefs.location) parts.push(`location: ${prefs.location}`);
  if (prefs.salary) parts.push(`salary: ${prefs.salary}`);
  if (prefs.industry) parts.push(`industry: ${prefs.industry}`);
  return parts.length ? parts.join(", ") : undefined;
}

export async function generateFitAnalysis(params: {
  sessionId: string;
  preferences?: SessionPreferences;
}): Promise<AnalysisResults> {
  const documents = await getSessionDocuments(params.sessionId);
  const indexed = documents.filter((d) => d._count.chunks > 0);

  if (!canRunAnalysis(indexed.map((d) => ({ ...d, chunkCount: d._count.chunks })))) {
    throw new Error(
      "Upload an indexed resume and at least one job description first.",
    );
  }

  const resume = indexed.find((d) => d.type === "RESUME")!;
  const jobs = indexed.filter((d) => d.type === "JOB_DESCRIPTION");

  const prefStr = preferencesToString(params.preferences);
  const jobResults: FitAnalysisResult[] = [];

  for (const job of jobs) {
    const chunks = await retrieveContext({
      sessionId: params.sessionId,
      query: `skills experience requirements fit for ${job.name}`,
      documentIds: [resume.id, job.id],
      limit: 16,
    });

    const context = buildContextBlock(chunks);
    const { object } = await generateObject({
      model: openai(CHAT_MODEL),
      system: FIT_ANALYSIS_PROMPT,
      prompt: buildFitAnalysisUserPrompt({
        jobName: job.name,
        jobDocumentId: job.id,
        context,
        preferences: prefStr,
      }),
      schema: fitSchema,
    });

    jobResults.push({
      jobDocumentId: job.id,
      jobName: job.name,
      ...object,
    });
  }

  jobResults.sort((a, b) => b.overall_fit_score - a.overall_fit_score);

  return {
    jobs: jobResults,
    generatedAt: new Date().toISOString(),
  };
}

export async function streamGroundedAnswer(params: {
  sessionId: string;
  question: string;
  documentIds?: string[];
  jobName?: string;
}) {
  const chunks = await retrieveContext({
    sessionId: params.sessionId,
    query: params.question,
    documentIds: params.documentIds,
    limit: 12,
  });

  const context = buildContextBlock(chunks);
  const confidence = estimateConfidence(chunks);

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: `${SYSTEM_PROMPT}\n\nRetrieval confidence: ${confidence.label}. ${confidence.note}`,
    prompt: buildChatUserPrompt(
      params.question,
      context,
      params.jobName,
    ),
  });

  return { result, chunks, confidence };
}

function estimateConfidence(chunks: RetrievedChunk[]): {
  label: "high" | "medium" | "low";
  note: string;
} {
  if (chunks.length === 0) {
    return {
      label: "low",
      note: "No relevant chunks retrieved — answer carefully and note missing evidence.",
    };
  }
  const avgScore =
    chunks.reduce((sum, c) => sum + c.score, 0) / chunks.length;
  if (avgScore >= 0.65) {
    return { label: "high", note: "Strong retrieval overlap with the question." };
  }
  if (avgScore >= 0.45) {
    return {
      label: "medium",
      note: "Partial retrieval overlap — flag uncertain claims.",
    };
  }
  return {
    label: "low",
    note: "Weak retrieval overlap — emphasize missing evidence.",
  };
}
