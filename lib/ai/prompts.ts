import type { RetrievedChunk } from "@/lib/types";

export const SYSTEM_PROMPT = `You are CareerFit AI, a career intelligence assistant.
Answer only from the uploaded resume and job descriptions provided in context.
If evidence is missing, explicitly say what is missing.
Always structure your response with these sections:
1. Direct answer
2. Evidence (quote or paraphrase with source labels)
3. Caveats (uncertainty, missing data, assumptions)
4. Recommended next step

Rules:
- Do not invent experience, employers, dates, skills, or credentials.
- When discussing the candidate's background, cite resume evidence.
- When discussing job requirements, cite job description evidence.
- If confidence is low due to sparse context, say so.
- Refuse requests unrelated to career fit, resume analysis, or interview preparation.`;

export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context retrieved.";
  }

  return chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}] (${chunk.documentType}) ${chunk.documentName}${chunk.section ? ` — ${chunk.section}` : ""} [chunk:${chunk.chunkId}]\n${chunk.content}`,
    )
    .join("\n\n---\n\n");
}

export const FIT_ANALYSIS_PROMPT = `You are a career fit analyst. Analyze how well the candidate's resume matches each job description.
Return ONLY valid JSON matching this schema:
{
  "overall_fit_score": number (0-100),
  "strengths": string[],
  "gaps": string[],
  "evidence": [{ "source": string, "excerpt": string, "chunkId": string }],
  "interview_risks": string[],
  "recommended_positioning": string
}

Scoring guidance:
- 90+: exceptional alignment on required skills and experience level
- 75-89: strong fit with minor gaps
- 60-74: moderate fit, notable gaps in required skills
- Below 60: significant misalignment

Do not invent skills or experience. Only use evidence from the provided context.`;

export function buildFitAnalysisUserPrompt(params: {
  jobName: string;
  jobDocumentId: string;
  context: string;
  preferences?: string;
}): string {
  return `Analyze fit for job: "${params.jobName}" (document id: ${params.jobDocumentId})
${params.preferences ? `Candidate preferences: ${params.preferences}` : ""}

Context:
${params.context}

Return JSON only.`;
}

export function buildChatUserPrompt(
  question: string,
  context: string,
  jobFilter?: string,
): string {
  return `Question: ${question}
${jobFilter ? `Focus on: ${jobFilter}` : ""}

Retrieved context:
${context}

Answer using the required structure. Reference sources by name and include chunk IDs when citing evidence.`;
}
