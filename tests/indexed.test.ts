import { describe, expect, it } from "vitest";
import {
  canRunAnalysis,
  canUseChat,
  getIndexedDocuments,
} from "@/lib/documents/indexed";

const docs = [
  { id: "1", name: "Resume", type: "RESUME" as const, chunkCount: 6 },
  { id: "2", name: "Job A", type: "JOB_DESCRIPTION" as const, chunkCount: 5 },
  { id: "3", name: "Job B", type: "JOB_DESCRIPTION" as const, chunkCount: 0 },
];

describe("indexed documents helpers", () => {
  it("filters out unindexed documents", () => {
    expect(getIndexedDocuments(docs)).toHaveLength(2);
  });

  it("requires indexed resume and job for analysis", () => {
    expect(canRunAnalysis(docs)).toBe(true);
    expect(canRunAnalysis([docs[0]])).toBe(false);
  });

  it("allows chat with indexed resume only", () => {
    expect(canUseChat(docs)).toBe(true);
    expect(canUseChat([docs[2]])).toBe(false);
  });
});
