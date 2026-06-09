import { TECH_KEYWORDS } from "@/lib/constants";
import { extractKeywords } from "@/lib/documents/normalize";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "her",
  "was",
  "one",
  "our",
  "out",
  "day",
  "get",
  "has",
  "him",
  "his",
  "how",
  "its",
  "may",
  "new",
  "now",
  "old",
  "see",
  "two",
  "way",
  "who",
  "boy",
  "did",
  "she",
  "use",
  "her",
  "what",
  "when",
  "where",
  "which",
  "with",
  "have",
  "this",
  "that",
  "from",
  "they",
  "will",
  "would",
  "there",
  "their",
  "about",
  "into",
  "your",
  "should",
  "could",
  "been",
  "being",
  "than",
  "then",
  "them",
  "these",
  "those",
  "such",
  "make",
  "like",
  "just",
  "over",
  "also",
]);

export function extractQueryTerms(query: string): string[] {
  const terms = new Set<string>();

  for (const kw of extractKeywords(query)) {
    terms.add(kw);
  }

  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  for (const word of words) {
    terms.add(word);
    if (TECH_KEYWORDS.some((t) => t.includes(word) || word.includes(t))) {
      terms.add(word);
    }
  }

  return Array.from(terms);
}

/** Lightweight BM25-style term frequency score (no IDF, good enough for rerank). */
export function termOverlapScore(content: string, terms: string[]): number {
  if (terms.length === 0) return 0;
  const lower = content.toLowerCase();
  let hits = 0;
  for (const term of terms) {
    if (lower.includes(term)) hits++;
  }
  return hits / terms.length;
}

export function sectionRelevanceBoost(section: string | null, query: string): number {
  const q = query.toLowerCase();
  const s = section?.toLowerCase() ?? "";

  if (q.includes("skill") || q.includes("gap") || q.includes("missing")) {
    if (s.includes("skill") || s.includes("required")) return 0.08;
  }
  if (q.includes("interview")) {
    if (s.includes("responsibilit") || s.includes("required")) return 0.06;
  }
  if (q.includes("fit") || q.includes("best") || q.includes("compare")) {
    if (s.includes("experience") || s.includes("responsibilit")) return 0.05;
  }
  if (q.includes("resume") || q.includes("profile") || q.includes("summary")) {
    if (s.includes("summary") || s.includes("experience")) return 0.07;
  }
  return 0;
}
