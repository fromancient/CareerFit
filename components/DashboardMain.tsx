"use client";

import type { AnalysisResults, FitAnalysisResult } from "@/lib/types";
import { FitScoreCard } from "./FitScoreCard";
import { SkillGapTable } from "./SkillGapTable";

interface DashboardMainProps {
  analysis: AnalysisResults | null;
  analyzing: boolean;
  onAnalyze: () => void;
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
}

export function DashboardMain({
  analysis,
  analyzing,
  onAnalyze,
  selectedJobId,
  onSelectJob,
}: DashboardMainProps) {
  const selectedResult: FitAnalysisResult | null =
    analysis?.jobs.find((j) => j.jobDocumentId === selectedJobId) ??
    analysis?.jobs[0] ??
    null;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Fit Dashboard</h2>
          <p className="text-sm text-muted">
            Compare your resume against each role
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors shrink-0"
        >
          {analyzing ? "Analyzing…" : analysis ? "Re-run Analysis" : "Run Analysis"}
        </button>
      </div>

      {!analysis ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-muted text-sm max-w-md mx-auto">
            Upload your resume and job descriptions, then run analysis to see fit
            scores, skill gaps, and interview prep insights.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="mt-4 rounded-xl border border-border bg-card p-5">
                  <h4 className="font-semibold text-sm mb-3">Key Evidence</h4>
                  <ul className="space-y-2">
                    {selectedResult.evidence.slice(0, 5).map((e, i) => (
                      <li key={`${e.chunkId}-${i}`} className="text-sm">
                        <span className="font-medium text-accent">{e.source}:</span>{" "}
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
