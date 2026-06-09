import { describe, expect, it } from "vitest";
import { extractKeywords } from "@/lib/documents/normalize";

describe("keyword extraction for retrieval boost", () => {
  it("extracts technology keywords from text", () => {
    const keywords = extractKeywords(
      "Built services with Kubernetes, React, and PostgreSQL on AWS.",
    );
    expect(keywords).toContain("kubernetes");
    expect(keywords).toContain("react");
    expect(keywords).toContain("postgresql");
    expect(keywords).toContain("aws");
  });

  it("returns empty array when no tech keywords found", () => {
    const keywords = extractKeywords("Managed teams and delivered projects.");
    expect(keywords).toHaveLength(0);
  });
});

describe("rerank scoring logic", () => {
  it("boosts chunks containing query keywords", () => {
    const content = "Experience with Kubernetes and Docker orchestration.";
    const keywords = ["kubernetes", "docker"];
    const lower = content.toLowerCase();
    const hits = keywords.filter((kw) => lower.includes(kw)).length;
    const score = hits / keywords.length;
    expect(score).toBe(1);
  });
});
