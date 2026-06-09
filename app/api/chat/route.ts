import { NextResponse } from "next/server";
import { z } from "zod";
import type { UIMessage } from "ai";
import { streamGroundedAnswer } from "@/lib/ai/generate-answer";
import { getSessionIdFromRequest } from "@/lib/session";

export const maxDuration = 60;

const chatSchema = z.object({
  messages: z.array(z.any()),
  documentIds: z.array(z.string()).optional(),
  jobName: z.string().optional(),
});

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionIdFromRequest(request);
    if (!sessionId) {
      return NextResponse.json({ error: "No session." }, { status: 401 });
    }

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

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Retrieved-Chunks": JSON.stringify(
          chunks.map((c) => ({
            chunkId: c.chunkId,
            documentName: c.documentName,
            section: c.section,
            excerpt: c.content.slice(0, 200),
            score: c.score,
          })),
        ),
        "X-Confidence": confidence.label,
      },
    });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      { error: "Chat request failed." },
      { status: 500 },
    );
  }
}
