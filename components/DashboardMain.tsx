"use client";

import Link from "next/link";
import type { AnalysisResults, FitAnalysisResult } from "@/lib/types";
import { FitScoreCard } from "./FitScoreCard";
import { SkillGapTable } from "./SkillGapTable";

interface DashboardMainProps {
  analysis: AnalysisResults | null;
  analyzing: boolean;
  onAnalyze: () => void;
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  canAnalyze?: boolean;
  documentCount?: number;
}

export function DashboardMain({
  analysis,
  analyzing,
  onAnalyze,
  selectedJobId,
  onSelectJob,
  canAnalyze = true,
  documentCount = 0,
}: DashboardMainProps) {
  const selectedResult: FitAnalysisResult | null =
    analysis?.jobs.find((j) => j.jobDocumentId === selectedJobId) ??
    analysis?.jobs[0] ??
    null;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gradient">Fit Dashboard</h2>
          <p className="text-sm text-muted">
            Compare your resume against each role
            {documentCount > 0 && ` · ${documentCount} indexed documents`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing || !canAnalyze}
          className="btn-primary shrink-0"
        >
          {analyzing ? "Analyzing…" : analysis ? "Re-run Analysis" : "Run Analysis"}
        </button>
      </div>

      {!canAnalyze && (
        <div className="alert-warning rounded-2xl p-5 text-sm">
          Upload an indexed resume and at least one job description to run fit
          analysis.{" "}
          <Link href="/upload" className="font-medium underline text-amber-200">
            Go to Upload
          </Link>
        </div>
      )}

      {!analysis ? (
        <div className="glass-panel rounded-2xl border-dashed border-white/15 p-10 text-center">
          <p className="text-muted text-sm max-w-md mx-auto">
            {canAnalyze
              ? "Click Run Analysis to generate fit scores, skill gaps, and interview prep insights."
              : "Upload your resume and job descriptions first."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.jobs.map((job, i) => (
              <FitScoreCard
                key={job.jobDocumentId}
                result={job}
                rank={i + 1}
                selected={
                  (selectedJobId ?? analysis.jobs[0]?.jobDocumentId) ===
                  job.jobDocumentId
                }
                onSelect={() => onSelectJob(job.jobDocumentId)}
              />
            ))}
          </div>

          {selectedResult && (
            <section>
              <h3 className="font-semibold mb-3">
                Details: {selectedResult.jobName}
              </h3>
              <SkillGapTable result={selectedResult} />

              {selectedResult.evidence.length > 0 && (
                <div className="mt-4 glass-panel rounded-2xl p-5">
                  <h4 className="font-semibold text-sm mb-3 text-cyan-300">
                    Key Evidence
                  </h4>
                  <ul className="space-y-2">
                    {selectedResult.evidence.slice(0, 5).map((e, i) => (
                      <li key={`${e.chunkId}-${i}`} className="text-sm">
                        <span className="font-medium text-violet-300">{e.source}:</span>{" "}
                        <span className="text-foreground/80">{e.excerpt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <p className="text-xs text-muted">
            Last analyzed: {new Date(analysis.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}
