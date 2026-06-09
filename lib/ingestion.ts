import { DocumentType } from "@prisma/client";
import { embedTexts } from "@/lib/ai/embeddings";
import { chunkDocument } from "@/lib/documents/chunk";
import { parseDocument } from "@/lib/documents/parse";
import { sanitizeUploadedText } from "@/lib/documents/normalize";
import {
  createChunksWithEmbeddings,
  createDocument,
} from "@/lib/db/queries";
import type { UploadResult } from "@/lib/types";

async function ingestRawText(params: {
  sessionId: string;
  type: DocumentType;
  name: string;
  rawText: string;
  metadata?: Record<string, unknown>;
}): Promise<UploadResult> {
  const document = await createDocument({
    sessionId: params.sessionId,
    type: params.type,
    name: params.name,
    rawText: params.rawText,
    metadata: params.metadata,
  });

  const chunks = chunkDocument(
    params.rawText,
    params.type as "RESUME" | "JOB_DESCRIPTION",
  );
  const embeddings = await embedTexts(chunks.map((c) => c.content));

  await createChunksWithEmbeddings(
    document.id,
    chunks.map((chunk, i) => ({
      content: chunk.content,
      section: chunk.section,
      chunkIndex: chunk.chunkIndex,
      metadata: chunk.metadata,
      embedding: embeddings[i],
    })),
  );

  return {
    documentId: document.id,
    name: document.name,
    type: params.type as "RESUME" | "JOB_DESCRIPTION",
    chunkCount: chunks.length,
  };
}

export async function ingestDocument(params: {
  sessionId: string;
  file: File;
  type: DocumentType;
}): Promise<UploadResult> {
  const rawText = await parseDocument(params.file);
  return ingestRawText({
    sessionId: params.sessionId,
    type: params.type,
    name: params.file.name,
    rawText,
    metadata: {
      size: params.file.size,
      mimeType: params.file.type,
    },
  });
}

export async function ingestTextDocument(params: {
  sessionId: string;
  type: DocumentType;
  name: string;
  text: string;
  metadata?: Record<string, unknown>;
}): Promise<UploadResult> {
  const rawText = sanitizeUploadedText(params.text);
  if (!rawText || rawText.length < 50) {
    throw new Error("Demo document text is too short.");
  }
  return ingestRawText({
    sessionId: params.sessionId,
    type: params.type,
    name: params.name,
    rawText,
    metadata: { ...params.metadata, source: "demo-fixture" },
  });
}
