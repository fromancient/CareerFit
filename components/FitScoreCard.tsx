import type { FitAnalysisResult } from "@/lib/types";

function scoreClass(score: number): string {
  if (score >= 80) return "score-high";
  if (score >= 60) return "score-mid";
  return "score-low";
}

interface FitScoreCardProps {
  result: FitAnalysisResult;
  rank: number;
  selected?: boolean;
  onSelect?: () => void;
}

export function FitScoreCard({ result, rank, selected, onSelect }: FitScoreCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl p-4 transition-all ${
        selected
          ? "glass-panel holo-border shadow-[0_0_30px_rgba(34,211,238,0.15)]"
          : "glass-panel hover:bg-white/[0.06] hover:border-cyan-400/20"
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
          className={`shrink-0 rounded-xl px-3 py-1.5 border ${scoreClass(result.overall_fit_score)}`}
        >
          <span className="text-2xl font-bold tabular-nums">
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
