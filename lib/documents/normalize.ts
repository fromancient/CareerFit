const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /system\s*:\s*/gi,
  /you\s+are\s+now/gi,
  /disregard\s+(the\s+)?(above|previous)/gi,
  /<\s*script/gi,
];

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeUploadedText(text: string): string {
  let sanitized = normalizeText(text);
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }
  return sanitized.slice(0, 200_000);
}

export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  const techPattern =
    /\b(kubernetes|docker|aws|gcp|azure|react|next\.?js|typescript|python|java|go|rust|node\.?js|postgresql|mongodb|redis|kafka|terraform|graphql|microservices|llm|rag|soc2|ci\/cd)\b/gi;

  let match: RegExpExecArray | null;
  while ((match = techPattern.exec(lower)) !== null) {
    found.add(match[1].toLowerCase());
  }

  return Array.from(found);
}
