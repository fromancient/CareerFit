import type { FitAnalysisResult } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-danger";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

interface FitScoreCardProps {
  result: FitAnalysisResult;
  rank: number;
  selected?: boolean;
  onSelect?: () => void;
}

export function FitScoreCard({
  result,
  rank,
  selected,
  onSelect,
}: FitScoreCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? "border-accent ring-2 ring-accent/20 shadow-md"
          : "border-border bg-card hover:border-accent/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            #{rank} Fit
          </p>
          <h3 className="font-semibold truncate mt-0.5">{result.jobName}</h3>
        </div>
        <div
          className={`shrink-0 rounded-lg border px-3 py-1.5 ${scoreBg(result.overall_fit_score)}`}
        >
          <span
            className={`text-2xl font-bold tabular-nums ${scoreColor(result.overall_fit_score)}`}
          >
            {result.overall_fit_score}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted mt-3 line-clamp-2">
        {result.recommended_positioning}
      </p>
      <div className="flex gap-3 mt-3 text-xs text-muted">
        <span>{result.strengths.length} strengths</span>
        <span>{result.gaps.length} gaps</span>
        <span>{result.interview_risks.length} risks</span>
      </div>
    </button>
  );
}
