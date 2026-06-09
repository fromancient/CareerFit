import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteDocument,
  getLatestAnalysis,
  getSessionDocuments,
  updateSessionPreferences,
} from "@/lib/db/queries";
import { getSessionId } from "@/lib/session";

const preferencesSchema = z.object({
  roleLevel: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  industry: z.string().optional(),
});

export async function GET() {
  try {
    const sessionId = await getSessionId();
    const [documents, analysis] = await Promise.all([
      getSessionDocuments(sessionId),
      getLatestAnalysis(sessionId),
    ]);

    return NextResponse.json({
      sessionId,
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        chunkCount: d._count.chunks,
        createdAt: d.createdAt,
      })),
      analysis: analysis?.results ?? null,
    });
  } catch (error) {
    console.error("[session GET]", error);
    return NextResponse.json({ error: "Failed to load session." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionId = await getSessionId();
    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid preferences." }, { status: 400 });
    }
    await updateSessionPreferences(sessionId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[session PATCH]", error);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionId = await getSessionId();
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    if (!documentId) {
      return NextResponse.json({ error: "documentId required." }, { status: 400 });
    }
    const deleted = await deleteDocument(documentId, sessionId);
    if (!deleted) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[session DELETE]", error);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
