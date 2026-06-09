import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from "@/lib/constants";
import { sanitizeUploadedText } from "./normalize";

export class DocumentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentParseError";
  }
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export function validateFile(file: File): void {
  const ext = getExtension(file.name);
  if (
    !SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number]) &&
    !SUPPORTED_MIME_TYPES.includes(
      file.type as (typeof SUPPORTED_MIME_TYPES)[number],
    )
  ) {
    throw new DocumentParseError(
      `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
    );
  }

  const maxSize = Number(process.env.MAX_FILE_SIZE_MB ?? 10) * 1024 * 1024;
  if (file.size > maxSize) {
    throw new DocumentParseError(
      `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB ?? 10} MB.`,
    );
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseDocument(file: File): Promise<string> {
  validateFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = getExtension(file.name);

  let text: string;
  if (ext === ".pdf" || file.type === "application/pdf") {
    text = await parsePdf(buffer);
  } else if (
    ext === ".docx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await parseDocx(buffer);
  } else {
    text = buffer.toString("utf-8");
  }

  const sanitized = sanitizeUploadedText(text);
  if (!sanitized || sanitized.length < 50) {
    throw new DocumentParseError(
      "Could not extract enough text from the document.",
    );
  }

  return sanitized;
}
