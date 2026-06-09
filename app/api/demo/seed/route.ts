import { NextResponse } from "next/server";
import { formatApiError } from "@/lib/api/errors";
import { DEMO_DOCUMENTS, loadFixtureText } from "@/lib/fixtures/demo-data";
import { ingestTextDocument } from "@/lib/ingestion";
import {
  deleteAllSessionDocuments,
  deleteUnindexedSessionDocuments,
  getSessionDocuments,
} from "@/lib/db/queries";
import { getSessionId } from "@/lib/session";

export const maxDuration = 120;

export async function POST() {
  try {
    const sessionId = await getSessionId();
    await deleteUnindexedSessionDocuments(sessionId);
    const existing = await getSessionDocuments(sessionId);
    const indexed = existing.filter((d) => d._count.chunks > 0);

    if (indexed.length > 0) {
      return NextResponse.json(
        {
          error:
            "Session already has indexed documents. Clear them first using 'Clear all documents'.",
        },
        { status: 409 },
      );
    }

    if (existing.length > 0) {
      await deleteAllSessionDocuments(sessionId);
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
    return NextResponse.json(
      { error: formatApiError(error, "Failed to load demo data.") },
      { status: 500 },
    );
  }
}
