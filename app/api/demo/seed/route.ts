import { NextResponse } from "next/server";
import { DEMO_DOCUMENTS, loadFixtureText } from "@/lib/fixtures/demo-data";
import { ingestTextDocument } from "@/lib/ingestion";
import { getSessionDocuments } from "@/lib/db/queries";
import { getSessionId } from "@/lib/session";

export const maxDuration = 120;

export async function POST() {
  try {
    const sessionId = await getSessionId();
    const existing = await getSessionDocuments(sessionId);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error:
            "Session already has documents. Remove them first or open a new browser session.",
        },
        { status: 409 },
      );
    }

    const results = [];
    for (const doc of DEMO_DOCUMENTS) {
      const text = loadFixtureText(doc.filename);
      const result = await ingestTextDocument({
        sessionId,
        type: doc.type,
        name: doc.name,
        text,
        metadata: { fixture: doc.filename },
      });
      results.push(result);
    }

    return NextResponse.json({
      ok: true,
      message: "Demo documents loaded. Embeddings indexed.",
      documents: results,
    });
  } catch (error) {
    console.error("[demo/seed]", error);
    const message =
      error instanceof Error ? error.message : "Failed to load demo data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
