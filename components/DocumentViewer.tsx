"use client";

import { useEffect, useState } from "react";

interface DocumentViewerProps {
  documentId: string | null;
}

interface DocumentDetail {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  rawText: string;
  chunkCount: number;
}

export function DocumentViewer({ documentId }: DocumentViewerProps) {
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/documents/${documentId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Failed to load document");
        setDocument(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setDocument(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  if (!documentId) {
    return (
      <div className="flex flex-1 items-center justify-center glass-panel rounded-2xl border-dashed border-white/15 p-6 text-center min-h-[200px]">
        <p className="text-sm text-muted">
          Select a resume or job description to preview its content.
        </p>
      </div>
    );
  }

  if (loading && !document) {
    return (
      <div className="flex flex-1 items-center justify-center glass-panel rounded-2xl p-6 min-h-[200px]">
        <p className="text-sm text-muted animate-pulse">Loading document…</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-1 items-center justify-center alert-error rounded-2xl p-6 min-h-[200px]">
        <p className="text-sm">{error ?? "Document unavailable"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 glass-panel rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8 shrink-0 bg-gradient-to-r from-violet-500/5 to-cyan-400/5">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          {document.type === "RESUME" ? "Resume" : "Job Description"}
        </p>
        <h3 className="font-semibold text-sm mt-0.5 truncate">{document.name}</h3>
        <p className="text-xs text-cyan-300/80 mt-1">
          {document.chunkCount} indexed chunks
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/85">
          {document.rawText}
        </pre>
      </div>
    </div>
  );
}
