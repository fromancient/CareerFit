"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
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

  const hasResume = documents.some((d) => d.type === "RESUME");
  const jobCount = documents.filter((d) => d.type === "JOB_DESCRIPTION").length;
  const canContinue = hasResume && jobCount >= 1;

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
    router.push("/dashboard");
  };

  const loadDemoData = async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load demo data");
      await loadSession();
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : "Demo load failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="flex-1">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              CF
            </div>
            <span className="font-semibold">CareerFit AI</span>
          </Link>
          <span className="text-sm text-muted">Step 1 · Upload</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Upload your documents</h1>
            <p className="text-muted mt-1">
              Add one resume and up to {MAX_JOB_DESCRIPTIONS} job descriptions.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDemoData}
            disabled={seeding || documents.length > 0}
            className="rounded-lg border border-accent text-accent px-4 py-2 text-sm font-medium hover:bg-indigo-50 disabled:opacity-50 transition-colors shrink-0"
          >
            {seeding ? "Loading demo…" : "Load demo documents"}
          </button>
        </div>
        {seedError && (
          <p className="text-sm text-danger" role="alert">
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
              disabled={hasResume}
              onUploaded={handleUploaded}
            />

            <UploadDropzone
              label="Job Descriptions"
              description={`Add ${jobCount}/${MAX_JOB_DESCRIPTIONS} roles to compare`}
              documentType="JOB_DESCRIPTION"
              disabled={jobCount >= MAX_JOB_DESCRIPTIONS}
              onUploaded={handleUploaded}
            />

            {documents.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-3">Uploaded</h3>
                <ul className="space-y-2 text-sm">
                  {documents.map((d) => (
                    <li key={d.id} className="flex justify-between">
                      <span>
                        {d.type === "RESUME" ? "Resume" : "Job"}: {d.name}
                      </span>
                      <span className="text-muted">{d.chunkCount} chunks</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5">
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
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
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
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
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
