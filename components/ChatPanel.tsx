"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { FormEvent, useMemo, useState } from "react";
import { EvidenceDrawer, type EvidenceItem } from "./EvidenceDrawer";

const SUGGESTED_QUESTIONS = [
  "Which job is my best fit?",
  "What skills am I missing for the selected job?",
  "What interview questions should I prepare for?",
  "Rewrite my profile summary for the strongest role.",
  "Show evidence from my resume and the JD.",
];

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface ChatPanelProps {
  selectedJobName: string | null;
  onEvidenceUpdate: (items: EvidenceItem[], confidence: string | null) => void;
}

export function ChatPanel({
  selectedJobName,
  onEvidenceUpdate,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [localEvidence, setLocalEvidence] = useState<EvidenceItem[]>([]);
  const [confidence, setConfidence] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { jobName: selectedJobName ?? undefined },
        fetch: async (url, options) => {
          const res = await fetch(url, options);
          const chunksHeader = res.headers.get("X-Retrieved-Chunks");
          const confHeader = res.headers.get("X-Confidence");
          if (chunksHeader) {
            try {
              const parsed = JSON.parse(chunksHeader) as EvidenceItem[];
              setLocalEvidence(parsed);
              onEvidenceUpdate(parsed, confHeader);
            } catch {
              /* ignore */
            }
          }
          setConfidence(confHeader);
          return res;
        },
      }),
    [selectedJobName, onEvidenceUpdate],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const askSuggested = (q: string) => {
    if (isLoading) return;
    sendMessage({ text: q });
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
        <div className="px-4 py-3 border-b border-border bg-slate-50">
          <h3 className="font-semibold text-sm">Career Assistant</h3>
          <p className="text-xs text-muted mt-0.5">
            Grounded answers with citations from your documents
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Try one of these questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => askSuggested(q)}
                    className="text-xs rounded-full border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-foreground"
                }`}
              >
                {getMessageText(m)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-muted animate-pulse">
                Analyzing retrieved evidence…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="p-3 border-t border-border bg-white">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fit, gaps, interview prep…"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="h-48 shrink-0">
        <EvidenceDrawer
          items={localEvidence}
          confidence={confidence}
          title="Why this answer?"
        />
      </div>
    </div>
  );
}
