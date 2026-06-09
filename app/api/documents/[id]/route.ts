import { NextResponse } from "next/server";
import { getDocumentById } from "@/lib/db/queries";
import { getSessionId } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = await getSessionId();
    const { id } = await params;
    const document = await getDocumentById(id, sessionId);

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: document.id,
      name: document.name,
      type: document.type,
      rawText: document.rawText,
      chunkCount: document._count.chunks,
      createdAt: document.createdAt,
    });
  } catch (error) {
    console.error("[documents GET]", error);
    return NextResponse.json(
      { error: "Failed to load document." },
      { status: 500 },
    );
  }
}
