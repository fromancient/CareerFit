import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFitAnalysis } from "@/lib/ai/generate-answer";
import { saveAnalysis } from "@/lib/db/queries";
import { getSessionId } from "@/lib/session";

const analyzeSchema = z.object({
  preferences: z
    .object({
      roleLevel: z.string().optional(),
      location: z.string().optional(),
      salary: z.string().optional(),
      industry: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionId();
    const body = await request.json().catch(() => ({}));
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const results = await generateFitAnalysis({
      sessionId,
      preferences: parsed.data.preferences,
    });

    await saveAnalysis(sessionId, results as unknown as Record<string, unknown>);

    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed.";
    console.error("[analyze]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
