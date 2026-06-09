import type { UIMessage } from "ai";

const STORAGE_PREFIX = "careerfit-chat";
const MAX_STORED_MESSAGES = 50;

export function getChatStorageKey(params: {
  sessionId: string;
  resumeDocumentId: string | null;
  selectedJobId: string | null;
}): string {
  return [
    STORAGE_PREFIX,
    params.sessionId,
    params.resumeDocumentId ?? "no-resume",
    params.selectedJobId ?? "all-jobs",
  ].join(":");
}

export function loadChatHistory(storageKey: string): UIMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

export function saveChatHistory(storageKey: string, messages: UIMessage[]): void {
  if (typeof window === "undefined" || messages.length === 0) return;

  try {
    const trimmed = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(storageKey, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function clearChatHistory(storageKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}

export function clearAllChatHistoriesForSession(sessionId: string): void {
  if (typeof window === "undefined") return;

  const prefix = `${STORAGE_PREFIX}:${sessionId}:`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) keysToRemove.push(key);
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
