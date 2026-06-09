export const SESSION_COOKIE = "careerfit_session_id";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_JOB_DESCRIPTIONS = 5;

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
export const CHAT_MODEL = "gpt-4o-mini";

export const RESUME_SECTIONS = [
  "Summary",
  "Experience",
  "Projects",
  "Skills",
  "Education",
  "Other",
] as const;

export const JD_SECTIONS = [
  "Responsibilities",
  "Required Skills",
  "Preferred Skills",
  "Company Context",
  "Other",
] as const;

export const TECH_KEYWORDS = [
  "kubernetes",
  "docker",
  "aws",
  "gcp",
  "azure",
  "react",
  "next.js",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "node.js",
  "postgresql",
  "mongodb",
  "redis",
  "kafka",
  "terraform",
  "ci/cd",
  "soc2",
  "graphql",
  "rest",
  "microservices",
  "machine learning",
  "llm",
  "rag",
] as const;
