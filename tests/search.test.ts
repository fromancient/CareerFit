import { describe, expect, it } from "vitest";
import {
  extractQueryTerms,
  sectionRelevanceBoost,
  termOverlapScore,
} from "@/lib/ai/search";

describe("search utilities", () => {
  it("extracts tech and meaningful query terms", () => {
    const terms = extractQueryTerms(
      "What Kubernetes and Python skills am I missing for Job #2?",
    );
    expect(terms).toContain("kubernetes");
    expect(terms).toContain("python");
    expect(terms).toContain("missing");
  });

  it("scores term overlap in chunk content", () => {
    const score = termOverlapScore(
      "Led Kubernetes migration with Python services on AWS.",
      ["kubernetes", "python", "aws"],
    );
    expect(score).toBeGreaterThan(0.6);
  });

  it("boosts skill sections for gap questions", () => {
    const boost = sectionRelevanceBoost("Required Skills", "What skills am I missing?");
    expect(boost).toBeGreaterThan(0);
  });
});
