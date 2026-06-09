import { NextResponse } from "next/server";
import { DocumentType } from "@prisma/client";
import { z } from "zod";
import { ingestDocument } from "@/lib/ingestion";
import { getSessionId } from "@/lib/session";
import { deleteDocument, getSessionDocuments } from "@/lib/db/queries";
import { MAX_JOB_DESCRIPTIONS } from "@/lib/constants";
import { formatApiError } from "@/lib/api/errors";
import { DocumentParseError } from "@/lib/documents/parse";

const uploadSchema = z.object({
  type: z.enum(["RESUME", "JOB_DESCRIPTION"]),
});

export async function POST(request: Request) {
  try {
    const sessionId = await getSessionId();
    const formData = await request.formData();
    const file = formData.get("file");
    const typeRaw = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const parsed = uploadSchema.safeParse({ type: typeRaw });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document type." }, { status: 400 });
    }

    const type = parsed.data.type as DocumentType;
    const existing = await getSessionDocuments(sessionId);

    const existingResume = existing.find((d) => d.type === "RESUME");
    if (type === "RESUME" && existingResume) {
      if (existingResume._count.chunks > 0) {
        return NextResponse.json(
          { error: "A resume is already uploaded. Delete it first to replace." },
          { status: 409 },
        );
      }
      await deleteDocument(existingResume.id, sessionId);
    }

    const jobCount = existing.filter(
      (d) => d.type === "JOB_DESCRIPTION" && d._count.chunks > 0,
    ).length;
    if (type === "JOB_DESCRIPTION" && jobCount >= MAX_JOB_DESCRIPTIONS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_JOB_DESCRIPTIONS} job descriptions allowed.` },
        { status: 409 },
      );
    }

    const result = await ingestDocument({ sessionId, file, type });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DocumentParseError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[upload]", error);
    return NextResponse.json(
      { error: formatApiError(error, "Failed to process upload.") },
      { status: 500 },
    );
  }
}
