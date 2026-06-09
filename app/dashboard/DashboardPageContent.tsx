"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/ui/AppHeader";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { getIndexedJobs } from "@/lib/documents/indexed";
import type { AnalysisResults } from "@/lib/types";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

export function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAnalyzeDone, setAutoAnalyzeDone] = useState(false);

  const loadSession = useCallback(async () => {
    const res = await fetch("/api/session");
    const data = await res.json();
    setSessionId(data.sessionId ?? null);
    setDocuments(data.documents ?? []);
    if (data.analysis) setAnalysis(data.analysis as AnalysisResults);
    const jobs = getIndexedJobs(data.documents ?? []);
    if (jobs.length) {
      setSelectedJobId((prev) => prev ?? jobs[0].id);
    }
    setSessionLoading(false);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (cancelled) return;
      setSessionId(data.sessionId ?? null);
      setDocuments(data.documents ?? []);
      if (data.analysis) setAnalysis(data.analysis as AnalysisResults);
      const jobs = getIndexedJobs(data.documents ?? []);
      if (jobs.length) {
        setSelectedJobId((prev) => prev ?? jobs[0].id);
      }
      setSessionLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runAnalysis = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (
      searchParams.get("analyze") !== "1" ||
      sessionLoading ||
      autoAnalyzeDone ||
      !documents.some((d) => d.chunkCount > 0)
    ) {
      return;
    }

    let cancelled = false;
    (async () => {
      if (cancelled) return;
      setAutoAnalyzeDone(true);
      router.replace("/dashboard");
      await runAnalysis();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    sessionLoading,
    autoAnalyzeDone,
    documents,
    runAnalysis,
    router,
  ]);

  const deleteDocument = async (documentId: string) => {
    await fetch(`/api/session?documentId=${documentId}`, { method: "DELETE" });
    await loadSession();
  };

  const indexedCount = documents.filter((d) => d.chunkCount > 0).length;

  return (
    <main className="flex flex-col h-screen overflow-hidden relative">
      <div className="orb w-80 h-80 bg-cyan-400/10 -top-20 left-1/4" />

      <AppHeader
        subtitle="Decision Workspace"
        right={
          <Link href="/upload" className="btn-ghost">
            Upload
          </Link>
        }
      />

      {error && (
        <div className="alert-error border-b border-rose-400/20 px-4 py-2 text-sm shrink-0">
          {error}
        </div>
      )}

      {indexedCount === 0 && !sessionLoading && (
        <div className="alert-warning border-b border-amber-400/20 px-4 py-3 text-sm shrink-0">
          No indexed documents yet.{" "}
          <Link href="/upload" className="font-medium underline text-amber-200">
            Upload or load demo data
          </Link>{" "}
          to use fit analysis and Career Assistant.
        </div>
      )}

      {sessionLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted">
          Loading workspace…
        </div>
      ) : sessionId ? (
        <DashboardWorkspace
          sessionId={sessionId}
          documents={documents}
          analysis={analysis}
          analyzing={analyzing}
          selectedJobId={selectedJobId}
          onSelectJob={setSelectedJobId}
          onAnalyze={runAnalysis}
          onDeleteDocument={deleteDocument}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-rose-400">
          Could not start session. Refresh the page.
        </div>
      )}
    </main>
  );
}
