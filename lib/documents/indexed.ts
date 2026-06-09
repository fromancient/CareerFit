export interface DocumentWithChunks {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

export function getIndexedDocuments<T extends DocumentWithChunks>(
  documents: T[],
): T[] {
  return documents.filter((d) => d.chunkCount > 0);
}

export function hasIndexedResume(documents: DocumentWithChunks[]): boolean {
  return documents.some((d) => d.type === "RESUME" && d.chunkCount > 0);
}

export function getIndexedJobs<T extends DocumentWithChunks>(documents: T[]): T[] {
  return documents.filter(
    (d) => d.type === "JOB_DESCRIPTION" && d.chunkCount > 0,
  );
}

export function canRunAnalysis(documents: DocumentWithChunks[]): boolean {
  return hasIndexedResume(documents) && getIndexedJobs(documents).length > 0;
}

export function canUseChat(documents: DocumentWithChunks[]): boolean {
  return hasIndexedResume(documents);
}
