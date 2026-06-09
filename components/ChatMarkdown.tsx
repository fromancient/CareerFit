"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
  variant: "user" | "assistant";
}

export function ChatMarkdown({ content, variant }: ChatMarkdownProps) {
  return (
    <div
      className={`chat-markdown ${variant === "user" ? "chat-markdown-user" : "chat-markdown-assistant"}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc pl-5 space-y-1 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal pl-5 space-y-1 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          h1: ({ children }) => (
            <h4 className="font-semibold text-base mb-2 mt-1">{children}</h4>
          ),
          h2: ({ children }) => (
            <h4 className="font-semibold text-sm mb-2 mt-1">{children}</h4>
          ),
          h3: ({ children }) => (
            <h4 className="font-semibold text-sm mb-1 mt-1">{children}</h4>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block rounded-md bg-black/10 px-3 py-2 text-xs font-mono overflow-x-auto my-2">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded px-1 py-0.5 text-[0.85em] font-mono bg-black/10">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-current/30 pl-3 my-2 opacity-90">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
