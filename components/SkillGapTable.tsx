import type { FitAnalysisResult } from "@/lib/types";

interface SkillGapTableProps {
  result: FitAnalysisResult | null;
}

export function SkillGapTable({ result }: SkillGapTableProps) {
  if (!result) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted">
        Run analysis to see skill gaps and strengths.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          Strengths
        </h3>
        <ul className="space-y-2">
          {result.strengths.length === 0 ? (
            <li className="text-sm text-muted">No strengths identified.</li>
          ) : (
            result.strengths.map((s) => (
              <li key={s} className="text-sm flex gap-2">
                <span className="text-success shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-danger mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          Skill Gaps
        </h3>
        <ul className="space-y-2">
          {result.gaps.length === 0 ? (
            <li className="text-sm text-muted">No major gaps found.</li>
          ) : (
            result.gaps.map((g) => (
              <li key={g} className="text-sm flex gap-2">
                <span className="text-danger shrink-0">△</span>
                <span>{g}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 md:col-span-2">
        <h3 className="font-semibold text-warning mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warning" />
          Interview Risks
        </h3>
        <ul className="space-y-2">
          {result.interview_risks.length === 0 ? (
            <li className="text-sm text-muted">No major interview risks flagged.</li>
          ) : (
            result.interview_risks.map((r) => (
              <li key={r} className="text-sm flex gap-2">
                <span className="text-warning shrink-0">!</span>
                <span>{r}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
