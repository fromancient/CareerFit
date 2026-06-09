import { NextResponse } from "next/server";
import { z } from "zod";
import type { UIMessage } from "ai";
import { streamGroundedAnswer } from "@/lib/ai/generate-answer";
import { formatApiError } from "@/lib/api/errors";
import {
  chunksToEvidenceItems,
  encodeEvidenceHeader,
} from "@/lib/api/evidence";
import { getSessionId } from "@/lib/session";

export const maxDuration = 60;

const chatSchema = z.object({
  messages: z.array(z.any()),
  documentIds: z.array(z.string()).optional(),
  jobName: z.string().optional(),
});

function getTextFromMessage(message: UIMessage): string {
  if (message.parts?.length) {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  // Fallback for legacy message shape
  const legacy = message as UIMessage & { content?: string };
  return legacy.content ?? "";
}

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionId();
    const body = await request.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const messages = parsed.data.messages as UIMessage[];
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUser ? getTextFromMessage(lastUser).trim() : "";

    if (!question) {
      return NextResponse.json({ error: "No question provided." }, { status: 400 });
    }

    const { result, chunks, confidence } = await streamGroundedAnswer({
      sessionId,
      question,
      documentIds: parsed.data.documentIds,
      jobName: parsed.data.jobName,
    });

    const evidenceHeader = encodeEvidenceHeader(chunksToEvidenceItems(chunks));

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Retrieved-Chunks-B64": evidenceHeader,
        "X-Confidence": confidence.label,
      },
    });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      { error: formatApiError(error, "Chat request failed.") },
      { status: 500 },
    );
  }
}
