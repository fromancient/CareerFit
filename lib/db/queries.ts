import { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "./client";
import type { SessionPreferences } from "@/lib/types";

export async function getOrCreateSession(sessionId: string) {
  return prisma.session.upsert({
    where: { id: sessionId },
    create: { id: sessionId },
    update: {},
  });
}

export async function updateSessionPreferences(
  sessionId: string,
  preferences: SessionPreferences,
) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { preferences: preferences as Prisma.InputJsonValue },
  });
}

export async function createDocument(params: {
  sessionId: string;
  type: DocumentType;
  name: string;
  rawText: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.document.create({
    data: {
      sessionId: params.sessionId,
      type: params.type,
      name: params.name,
      rawText: params.rawText,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function createChunksWithEmbeddings(
  documentId: string,
  chunks: Array<{
    content: string;
    section: string | null;
    chunkIndex: number;
    metadata?: Record<string, unknown>;
    embedding: number[];
  }>,
) {
  for (const chunk of chunks) {
    const created = await prisma.chunk.create({
      data: {
        documentId,
        content: chunk.content,
        section: chunk.section,
        chunkIndex: chunk.chunkIndex,
        metadata: (chunk.metadata ?? {}) as Prisma.InputJsonValue,
        embedding: {
          create: {
            vector: chunk.embedding,
          },
        },
      },
    });
    void created;
  }
}

export async function getSessionDocuments(sessionId: string) {
  return prisma.document.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { chunks: true } },
    },
  });
}

export async function getLatestAnalysis(sessionId: string) {
  return prisma.analysis.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveAnalysis(
  sessionId: string,
  results: Record<string, unknown>,
) {
  return prisma.analysis.create({
    data: {
      sessionId,
      results: results as Prisma.InputJsonValue,
    },
  });
}

export async function deleteDocument(documentId: string, sessionId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, sessionId },
  });
  if (!doc) return null;
  await prisma.document.delete({ where: { id: documentId } });
  return doc;
}

export interface VectorSearchRow {
  chunk_id: string;
  document_id: string;
  document_name: string;
  document_type: DocumentType;
  section: string | null;
  content: string;
  distance: number;
}

function cosineDistance(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 1;
  return 1 - dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function vectorSearch(params: {
  queryEmbedding: number[];
  sessionId: string;
  documentTypes?: DocumentType[];
  documentIds?: string[];
  limit?: number;
}): Promise<VectorSearchRow[]> {
  const limit = params.limit ?? 12;

  const chunks = await prisma.chunk.findMany({
    where: {
      document: {
        sessionId: params.sessionId,
        ...(params.documentTypes?.length
          ? { type: { in: params.documentTypes } }
          : {}),
        ...(params.documentIds?.length ? { id: { in: params.documentIds } } : {}),
      },
      embedding: { isNot: null },
    },
    include: {
      embedding: true,
      document: true,
    },
  });

  const ranked = chunks
    .map((chunk) => ({
      chunk_id: chunk.id,
      document_id: chunk.document.id,
      document_name: chunk.document.name,
      document_type: chunk.document.type,
      section: chunk.section,
      content: chunk.content,
      distance: cosineDistance(
        params.queryEmbedding,
        chunk.embedding?.vector ?? [],
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return ranked;
}
