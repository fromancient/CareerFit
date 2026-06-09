import { DocumentType } from "@prisma/client";
import { embedText } from "./embeddings";
import {
  extractQueryTerms,
  sectionRelevanceBoost,
  termOverlapScore,
} from "./search";
import { vectorSearch } from "@/lib/db/queries";
import type { RetrievedChunk } from "@/lib/types";

function rerankChunks(
  rows: Awaited<ReturnType<typeof vectorSearch>>,
  query: string,
): RetrievedChunk[] {
  const queryTerms = extractQueryTerms(query);

  return rows
    .map((row) => {
      const vectorScore = 1 - Number(row.distance);
      const keywordScore = termOverlapScore(row.content, queryTerms);
      const sectionBoost = sectionRelevanceBoost(row.section, query);
      const requiredBoost =
        row.section?.toLowerCase().includes("required") ||
        row.section?.toLowerCase().includes("skill")
          ? 0.04
          : 0;
      const score =
        vectorScore * 0.65 +
        keywordScore * 0.25 +
        sectionBoost +
        requiredBoost;

      return {
        chunkId: row.chunk_id,
        documentId: row.document_id,
        documentName: row.document_name,
        documentType: row.document_type as RetrievedChunk["documentType"],
        section: row.section,
        content: row.content,
        score: Math.min(score, 1),
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
  const isBroadComparison =
    /best fit|compare|which job|strongest|all job/i.test(params.query);
  const limit = params.limit ?? (isBroadComparison ? 16 : 12);

  const queryEmbedding = await embedText(params.query);
  const rows = await vectorSearch({
    queryEmbedding,
    sessionId: params.sessionId,
    documentTypes: params.documentTypes,
    documentIds: params.documentIds,
    limit: limit * 2,
  });

  const reranked = rerankChunks(rows, params.query);
  return reranked.slice(0, limit);
}
