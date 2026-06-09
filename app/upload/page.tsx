"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/ui/AppHeader";
import { UploadDropzone } from "@/components/UploadDropzone";
import { clearAllChatHistoriesForSession } from "@/lib/chat/storage";
import { MAX_JOB_DESCRIPTIONS } from "@/lib/constants";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [preferences, setPreferences] = useState({
    roleLevel: "",
    location: "",
    salary: "",
    industry: "",
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    const res = await fetch("/api/session");
    const data = await res.json();
    setDocuments(data.documents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (cancelled) return;
      setDocuments(data.documents ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const indexedDocuments = documents.filter((d) => d.chunkCount > 0);
  const brokenDocuments = documents.filter((d) => d.chunkCount === 0);
  const hasResume = indexedDocuments.some((d) => d.type === "RESUME");
  const jobCount = indexedDocuments.filter(
    (d) => d.type === "JOB_DESCRIPTION",
  ).length;
  const canContinue = hasResume && jobCount >= 1;
  const canLoadDemo = indexedDocuments.length === 0;

  const handleUploaded = () => {
    loadSession();
  };

  const savePreferences = async () => {
    await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
  };

  const goToDashboard = async () => {
    await savePreferences();
    router.push("/dashboard?analyze=1");
  };

  const clearAllDocuments = async () => {
    const sessionRes = await fetch("/api/session");
    const sessionData = await sessionRes.json();
    if (sessionData.sessionId) {
      clearAllChatHistoriesForSession(sessionData.sessionId);
    }
    await fetch("/api/session?all=true", { method: "DELETE" });
    await loadSession();
  };

  const loadDemoData = async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load demo data");
      await loadSession();
      router.push("/dashboard?analyze=1");
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : "Demo load failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="flex-1 relative">
      <div className="orb w-64 h-64 bg-violet-500/15 top-10 right-10" />

      <AppHeader subtitle="Step 1 · Upload" />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Upload your <span className="text-gradient">documents</span>
            </h1>
            <p className="text-muted mt-2">
              Add one resume and up to {MAX_JOB_DESCRIPTIONS} job descriptions.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDemoData}
            disabled={seeding || !canLoadDemo}
            className="btn-secondary shrink-0"
          >
            {seeding ? "Loading demo…" : "Load demo documents"}
          </button>
        </div>
        {seedError && (
          <p className="alert-error rounded-xl px-4 py-3 text-sm" role="alert">
            {seedError}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading session…</p>
        ) : (
          <>
            <UploadDropzone
              label="Resume"
              description="Your current resume (PDF, DOCX, or TXT)"
              documentType="RESUME"
              disabled={hasResume || documents.some((d) => d.type === "RESUME" && d.chunkCount > 0)}
              onUploaded={handleUploaded}
            />

            <UploadDropzone
              label="Job Descriptions"
              description={`Add ${jobCount}/${MAX_JOB_DESCRIPTIONS} roles to compare`}
              documentType="JOB_DESCRIPTION"
              disabled={
                documents.filter(
                  (d) => d.type === "JOB_DESCRIPTION" && d.chunkCount > 0,
                ).length >= MAX_JOB_DESCRIPTIONS
              }
              onUploaded={handleUploaded}
            />

            {brokenDocuments.length > 0 && (
              <div className="alert-warning rounded-2xl p-4 text-sm">
                {brokenDocuments.length} document(s) failed indexing (likely an API
                error). Clear them and try again.
                <button
                  type="button"
                  onClick={clearAllDocuments}
                  className="ml-2 font-medium underline"
                >
                  Clear all documents
                </button>
              </div>
            )}

            {documents.length > 0 && (
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Uploaded</h3>
                  {indexedDocuments.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllDocuments}
                      className="text-xs text-muted hover:text-rose-400"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {documents.map((d) => (
                    <li key={d.id} className="flex justify-between">
                      <span>
                        {d.type === "RESUME" ? "Resume" : "Job"}: {d.name}
                      </span>
                      <span
                        className={
                          d.chunkCount === 0 ? "text-danger" : "text-muted"
                        }
                      >
                        {d.chunkCount === 0
                          ? "indexing failed"
                          : `${d.chunkCount} chunks`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass-panel rounded-2xl p-5">
              <h3 className="font-semibold mb-3">
                Target Preferences{" "}
                <span className="text-muted font-normal text-sm">(optional)</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {(
                  [
                    ["roleLevel", "Role level", "e.g. Senior, Staff"],
                    ["location", "Location", "e.g. Remote, NYC"],
                    ["salary", "Salary target", "e.g. $150k–$180k"],
                    ["industry", "Industry", "e.g. Fintech, Healthcare"],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <label key={key} className="block">
                    <span className="text-sm font-medium">{label}</span>
                    <input
                      value={preferences[key]}
                      onChange={(e) =>
                        setPreferences((p) => ({ ...p, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      className="glass-input mt-1 w-full rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={goToDashboard}
                disabled={!canContinue}
                className="btn-primary px-6 py-3"
              >
                Continue to Dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
