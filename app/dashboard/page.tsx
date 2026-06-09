"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { DashboardMain } from "@/components/DashboardMain";
import { Sidebar } from "@/components/Sidebar";
import type { AnalysisResults } from "@/lib/types";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    const res = await fetch("/api/session");
    const data = await res.json();
    setDocuments(data.documents ?? []);
    if (data.analysis) setAnalysis(data.analysis as AnalysisResults);
    const jobs = (data.documents ?? []).filter(
      (d: DocumentItem) => d.type === "JOB_DESCRIPTION",
    );
    if (jobs.length && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [selectedJobId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (cancelled) return;
      setDocuments(data.documents ?? []);
      if (data.analysis) setAnalysis(data.analysis as AnalysisResults);
      const jobs = (data.documents ?? []).filter(
        (d: DocumentItem) => d.type === "JOB_DESCRIPTION",
      );
      if (jobs.length) {
        setSelectedJobId((prev) => prev ?? jobs[0].id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data);
      if (data.jobs?.[0]) setSelectedJobId(data.jobs[0].jobDocumentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    await fetch(`/api/session?documentId=${documentId}`, { method: "DELETE" });
    await loadSession();
  };

  const selectedJob = documents.find((d) => d.id === selectedJobId);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xs">
              CF
            </div>
            <span className="font-semibold">CareerFit AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="text-sm text-muted hover:text-foreground"
            >
              Upload more
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        <div className="lg:col-span-2 min-h-0 h-full">
          <Sidebar
            documents={documents}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onDelete={deleteDocument}
          />
        </div>

        <div className="lg:col-span-5 min-h-0 h-full overflow-hidden">
          <DashboardMain
            analysis={analysis}
            analyzing={analyzing}
            onAnalyze={runAnalysis}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
          />
        </div>

        <div className="lg:col-span-5 min-h-0 h-full overflow-hidden">
          <ChatPanel
            key={selectedJobId ?? "none"}
            selectedJobName={selectedJob?.name ?? null}
            onEvidenceUpdate={() => {}}
          />
        </div>
      </div>
    </main>
  );
}
