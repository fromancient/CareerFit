import { DocumentType } from "@prisma/client";
import { embedText } from "./embeddings";
import { vectorSearch } from "@/lib/db/queries";
import { extractKeywords } from "@/lib/documents/normalize";
import { TECH_KEYWORDS } from "@/lib/constants";
import type { RetrievedChunk } from "@/lib/types";

function keywordBoostScore(
  content: string,
  queryKeywords: string[],
): number {
  if (queryKeywords.length === 0) return 0;
  const lower = content.toLowerCase();
  let hits = 0;
  for (const kw of queryKeywords) {
    if (lower.includes(kw)) hits++;
  }
  return hits / queryKeywords.length;
}

function rerankChunks(
  rows: Awaited<ReturnType<typeof vectorSearch>>,
  query: string,
): RetrievedChunk[] {
  const queryKeywords = [
    ...extractKeywords(query),
    ...query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) =>
        TECH_KEYWORDS.some((t) => t.includes(w) || w.includes(t)),
      ),
  ];

  const uniqueKeywords = Array.from(new Set(queryKeywords));

  return rows
    .map((row) => {
      const vectorScore = 1 - Number(row.distance);
      const keywordScore = keywordBoostScore(row.content, uniqueKeywords);
      const requiredBoost =
        row.section?.toLowerCase().includes("required") ||
        row.section?.toLowerCase().includes("skills")
          ? 0.05
          : 0;
      const score = vectorScore * 0.75 + keywordScore * 0.2 + requiredBoost;

      return {
        chunkId: row.chunk_id,
        documentId: row.document_id,
        documentName: row.document_name,
        documentType: row.document_type as RetrievedChunk["documentType"],
        section: row.section,
        content: row.content,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function retrieveContext(params: {
  sessionId: string;
  query: string;
  documentTypes?: DocumentType[];
  documentIds?: string[];
  limit?: number;
}): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(params.query);
  const rows = await vectorSearch({
    queryEmbedding,
    sessionId: params.sessionId,
    documentTypes: params.documentTypes,
    documentIds: params.documentIds,
    limit: (params.limit ?? 12) * 2,
  });

  const reranked = rerankChunks(rows, params.query);
  return reranked.slice(0, params.limit ?? 12);
}
