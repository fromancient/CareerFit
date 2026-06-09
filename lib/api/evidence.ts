import type { RetrievedChunk } from "@/lib/types";

export interface EvidenceHeaderItem {
  chunkId: string;
  documentName: string;
  section: string | null;
  excerpt: string;
  score: number;
}

export function chunksToEvidenceItems(
  chunks: RetrievedChunk[],
): EvidenceHeaderItem[] {
  return chunks.map((c) => ({
    chunkId: c.chunkId,
    documentName: c.documentName,
    section: c.section,
    excerpt: c.content.slice(0, 200),
    score: c.score,
  }));
}

/** HTTP headers must be ASCII — base64-encode JSON evidence payloads. */
export function encodeEvidenceHeader(items: EvidenceHeaderItem[]): string {
  return Buffer.from(JSON.stringify(items), "utf-8").toString("base64");
}

export function decodeEvidenceHeader(encoded: string): EvidenceHeaderItem[] {
  const json = Buffer.from(encoded, "base64").toString("utf-8");
  return JSON.parse(json) as EvidenceHeaderItem[];
}

/** Browser-side decoder for ChatPanel fetch wrapper. */
export function decodeEvidenceHeaderBrowser(encoded: string): EvidenceHeaderItem[] {
  const json = atob(encoded);
  return JSON.parse(json) as EvidenceHeaderItem[];
}
