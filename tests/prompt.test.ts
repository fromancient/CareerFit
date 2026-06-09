import { describe, expect, it } from "vitest";
import {
  SYSTEM_PROMPT,
  buildContextBlock,
  buildChatUserPrompt,
} from "@/lib/ai/prompts";
import type { RetrievedChunk } from "@/lib/types";

describe("prompts", () => {
  it("system prompt forbids hallucination", () => {
    expect(SYSTEM_PROMPT).toContain("Do not invent");
    expect(SYSTEM_PROMPT).toContain("Evidence");
    expect(SYSTEM_PROMPT).toContain("Caveats");
  });

  it("builds context block with source labels and chunk ids", () => {
    const chunks: RetrievedChunk[] = [
      {
        chunkId: "abc-123",
        documentId: "doc-1",
        documentName: "resume.pdf",
        documentType: "RESUME",
        section: "Experience",
        content: "Led Kubernetes migration at Acme Corp.",
        score: 0.9,
      },
    ];
    const block = buildContextBlock(chunks);
    expect(block).toContain("resume.pdf");
    expect(block).toContain("abc-123");
    expect(block).toContain("Kubernetes");
  });

  it("includes question in user prompt", () => {
    const prompt = buildChatUserPrompt(
      "Does my resume mention Kubernetes?",
      "context here",
    );
    expect(prompt).toContain("Does my resume mention Kubernetes?");
    expect(prompt).toContain("context here");
  });
});
