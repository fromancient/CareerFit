"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeEvidenceHeaderBrowser } from "@/lib/api/evidence";
import {
  clearChatHistory,
  getChatStorageKey,
  loadChatHistory,
  saveChatHistory,
} from "@/lib/chat/storage";
import { ChatMarkdown } from "./ChatMarkdown";
import { EvidenceDrawer, type EvidenceItem } from "./EvidenceDrawer";

const SUGGESTED_QUESTIONS = [
  "Which job is my best fit?",
  "What skills am I missing for the selected job?",
  "What interview questions should I prepare for?",
  "Rewrite my profile summary for the strongest role.",
  "Show evidence from my resume and the JD.",
];

function getMessageText(message: UIMessage): string {
  if (message.parts?.length) {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  const legacy = message as UIMessage & { content?: string };
  return legacy.content ?? "";
}

interface ChatPanelProps {
  sessionId: string;
  resumeDocumentId: string | null;
  selectedJobId: string | null;
  selectedJobName: string | null;
  disabled?: boolean;
  disabledReason?: string;
}

export function ChatPanel({
  sessionId,
  resumeDocumentId,
  selectedJobId,
  selectedJobName,
  disabled = false,
  disabledReason,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [localEvidence, setLocalEvidence] = useState<EvidenceItem[]>([]);
  const [confidence, setConfidence] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(
    () =>
      getChatStorageKey({
        sessionId,
        resumeDocumentId,
        selectedJobId,
      }),
    [sessionId, resumeDocumentId, selectedJobId],
  );

  const [initialMessages] = useState<UIMessage[]>(() =>
    loadChatHistory(storageKey),
  );

  const documentIds = useMemo(() => {
    const ids: string[] = [];
    if (resumeDocumentId) ids.push(resumeDocumentId);
    if (selectedJobId) ids.push(selectedJobId);
    return ids.length > 0 ? ids : undefined;
  }, [resumeDocumentId, selectedJobId]);

  const handleEvidence = useCallback(
    (encoded: string | null, conf: string | null) => {
      if (encoded) {
        try {
          setLocalEvidence(decodeEvidenceHeaderBrowser(encoded));
        } catch {
          setLocalEvidence([]);
        }
      }
      setConfidence(conf);
    },
    [],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          jobName: selectedJobName ?? undefined,
          documentIds,
        },
        fetch: async (url, options) => {
          const res = await fetch(url, options);
          handleEvidence(
            res.headers.get("X-Retrieved-Chunks-B64"),
            res.headers.get("X-Confidence"),
          );
          return res;
        },
      }),
    [selectedJobName, documentIds, handleEvidence],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      saveChatHistory(storageKey, messages);
    }
  }, [messages, status, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    sendMessage({ text: input });
    setInput("");
  };

  const askSuggested = (q: string) => {
    if (isLoading || disabled) return;
    sendMessage({ text: q });
  };

  const clearChat = () => {
    clearChatHistory(storageKey);
    setMessages([]);
    setLocalEvidence([]);
    setConfidence(null);
  };

  return (
    <div className="flex flex-col h-full min-h-[480px] gap-3">
      <div className="flex-1 flex flex-col glass-panel holo-border rounded-2xl overflow-hidden min-h-0">
        <div className="px-4 py-3 border-b border-white/8 flex items-start justify-between gap-2 shrink-0 bg-gradient-to-r from-cyan-400/5 to-violet-500/5">
          <div>
            <h3 className="font-semibold text-sm text-gradient">Career Assistant</h3>
            <p className="text-xs text-muted mt-0.5">
              {selectedJobName
                ? `Scoped to: ${selectedJobName}`
                : "Grounded answers from your uploaded documents"}
            </p>
            {messages.length > 0 && (
              <p className="text-[10px] text-muted mt-1">Chat saved in this browser</p>
            )}
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="text-xs text-muted hover:text-rose-400 shrink-0"
            >
              Clear chat
            </button>
          )}
        </div>

        {disabled ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted max-w-sm">
              {disabledReason ??
                "Upload documents before using the career assistant."}
            </p>
            <Link href="/upload" className="btn-primary mt-4">
              Go to Upload
            </Link>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">Try one of these questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => askSuggested(q)}
                        className="text-xs rounded-full border border-white/15 px-3 py-1.5 hover:border-cyan-400/40 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const text = getMessageText(m);
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser ? "bubble-user" : "bubble-assistant"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{text}</p>
                      ) : (
                        <ChatMarkdown content={text} variant="assistant" />
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bubble-assistant px-4 py-3 text-sm text-muted animate-pulse">
                    Analyzing retrieved evidence…
                  </div>
                </div>
              )}

              {error && (
                <div className="alert-error rounded-xl px-4 py-3 text-sm">
                  {error.message}
                </div>
              )}
            </div>

            <form
              onSubmit={onSubmit}
              className="p-3 border-t border-white/8 shrink-0"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about fit, gaps, interview prep…"
                  className="glass-input flex-1 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="btn-primary px-4 py-2.5"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <div className="h-44 shrink-0">
        <EvidenceDrawer
          items={localEvidence}
          confidence={confidence}
          title="Why this answer?"
        />
      </div>
    </div>
  );
}
