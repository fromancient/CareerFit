import { describe, expect, it } from "vitest";
import { getChatStorageKey, loadChatHistory } from "@/lib/chat/storage";

describe("chat storage", () => {
  it("builds stable keys per session and job scope", () => {
    const key = getChatStorageKey({
      sessionId: "sess-1",
      resumeDocumentId: "resume-1",
      selectedJobId: "job-1",
    });
    expect(key).toBe("careerfit-chat:sess-1:resume-1:job-1");
  });

  it("returns empty array when localStorage is unavailable", () => {
    expect(loadChatHistory("missing-key")).toEqual([]);
  });
});
