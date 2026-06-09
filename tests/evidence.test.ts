import { describe, expect, it } from "vitest";
import {
  chunksToEvidenceItems,
  decodeEvidenceHeader,
  encodeEvidenceHeader,
} from "@/lib/api/evidence";
import type { RetrievedChunk } from "@/lib/types";

describe("evidence header encoding", () => {
  it("round-trips unicode document names through base64 headers", () => {
    const chunks: RetrievedChunk[] = [
      {
        chunkId: "abc-123",
        documentId: "doc-1",
        documentName: "CloudScale — Senior Backend Engineer",
        documentType: "JOB_DESCRIPTION",
        section: "Required Skills",
        content: "Strong Python and Kubernetes skills required.",
        score: 0.88,
      },
    ];

    const items = chunksToEvidenceItems(chunks);
    const encoded = encodeEvidenceHeader(items);
    const decoded = decodeEvidenceHeader(encoded);

    expect(decoded[0].documentName).toBe("CloudScale — Senior Backend Engineer");
    expect(encoded).not.toMatch(/[^\x00-\x7F]/);
  });
});
