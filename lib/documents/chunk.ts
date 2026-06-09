import { JD_SECTIONS, RESUME_SECTIONS } from "@/lib/constants";
import type { DocumentType } from "@/lib/types";

export interface TextChunk {
  content: string;
  section: string;
  chunkIndex: number;
  metadata?: Record<string, unknown>;
}

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  Summary: [/^(professional\s+)?summary\b/i, /^profile\b/i, /^about\b/i],
  Experience: [
    /^experience\b/i,
    /^work\s+experience\b/i,
    /^employment\b/i,
    /^professional\s+experience\b/i,
  ],
  Projects: [/^projects?\b/i, /^portfolio\b/i],
  Skills: [/^skills?\b/i, /^technical\s+skills\b/i, /^core\s+competencies\b/i],
  Education: [/^education\b/i, /^academic\b/i],
  Responsibilities: [
    /^responsibilities\b/i,
    /^what\s+you('ll| will)\s+do\b/i,
    /^role\b/i,
    /^the\s+role\b/i,
  ],
  "Required Skills": [
    /^requirements?\b/i,
    /^required\b/i,
    /^must\s+have\b/i,
    /^qualifications\b/i,
  ],
  "Preferred Skills": [
    /^preferred\b/i,
    /^nice\s+to\s+have\b/i,
    /^bonus\b/i,
  ],
  "Company Context": [
    /^about\s+(us|the\s+company)\b/i,
    /^company\b/i,
    /^who\s+we\s+are\b/i,
  ],
};

function detectSection(line: string, sections: readonly string[]): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 80) return null;

  for (const section of sections) {
    const patterns = SECTION_PATTERNS[section] ?? [];
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) return section;
    }
  }
  return null;
}

function splitIntoSections(
  text: string,
  sections: readonly string[],
): Array<{ section: string; body: string }> {
  const lines = text.split("\n");
  const result: Array<{ section: string; body: string }> = [];
  let currentSection = sections[sections.length - 1] ?? "Other";
  let buffer: string[] = [];

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body) result.push({ section: currentSection, body });
    buffer = [];
  };

  for (const line of lines) {
    const detected = detectSection(line, sections);
    if (detected) {
      flush();
      currentSection = detected;
      continue;
    }
    buffer.push(line);
  }
  flush();

  if (result.length === 0) {
    return [{ section: sections[0] ?? "Other", body: text }];
  }
  return result;
}

function splitByTokenBudget(
  text: string,
  maxChars: number,
  overlap: number,
): string[] {
  if (text.length <= maxChars) return [text];

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).trim().length <= maxChars) {
      current = current ? `${current}\n\n${para}` : para;
    } else {
      if (current) chunks.push(current.trim());
      if (para.length <= maxChars) {
        current = para;
      } else {
        const sentences = para.split(/(?<=[.!?])\s+/);
        let sentenceBuf = "";
        for (const sentence of sentences) {
          if ((sentenceBuf + " " + sentence).trim().length <= maxChars) {
            sentenceBuf = sentenceBuf ? `${sentenceBuf} ${sentence}` : sentence;
          } else {
            if (sentenceBuf) chunks.push(sentenceBuf.trim());
            sentenceBuf = sentence;
          }
        }
        current = sentenceBuf;
      }
    }
  }
  if (current) chunks.push(current.trim());

  if (chunks.length > 1 && overlap > 0) {
    const withOverlap: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prev = i > 0 ? chunks[i - 1].slice(-overlap) : "";
      withOverlap.push(prev ? `${prev}\n${chunks[i]}` : chunks[i]);
    }
    return withOverlap;
  }

  return chunks;
}

export function chunkResume(text: string): TextChunk[] {
  const sections = splitIntoSections(text, RESUME_SECTIONS);
  const chunks: TextChunk[] = [];
  let index = 0;

  for (const { section, body } of sections) {
    const parts = splitByTokenBudget(body, 1800, 200);
    for (const part of parts) {
      chunks.push({
        content: part,
        section,
        chunkIndex: index++,
        metadata: { documentKind: "resume" },
      });
    }
  }
  return chunks;
}

export function chunkJobDescription(text: string): TextChunk[] {
  const sections = splitIntoSections(text, JD_SECTIONS);
  const chunks: TextChunk[] = [];
  let index = 0;

  for (const { section, body } of sections) {
    const parts = splitByTokenBudget(body, 2400, 250);
    for (const part of parts) {
      chunks.push({
        content: part,
        section,
        chunkIndex: index++,
        metadata: { documentKind: "job_description" },
      });
    }
  }
  return chunks;
}

export function chunkDocument(text: string, type: DocumentType): TextChunk[] {
  return type === "RESUME" ? chunkResume(text) : chunkJobDescription(text);
}
