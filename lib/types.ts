export type DocumentType = "RESUME" | "JOB_DESCRIPTION";

export interface SessionPreferences {
  roleLevel?: string;
  location?: string;
  salary?: string;
  industry?: string;
}

export interface FitEvidence {
  source: string;
  excerpt: string;
  chunkId: string;
}

export interface FitAnalysisResult {
  jobDocumentId: string;
  jobName: string;
  overall_fit_score: number;
  strengths: string[];
  gaps: string[];
  evidence: FitEvidence[];
  interview_risks: string[];
  recommended_positioning: string;
}

export interface AnalysisResults {
  jobs: FitAnalysisResult[];
  generatedAt: string;
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  documentType: DocumentType;
  section: string | null;
  content: string;
  score: number;
}

export interface ChatCitation {
  chunkId: string;
  documentName: string;
  section: string | null;
  excerpt: string;
}

export interface UploadResult {
  documentId: string;
  name: string;
  type: DocumentType;
  chunkCount: number;
}
