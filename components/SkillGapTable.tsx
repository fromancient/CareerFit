import type { FitAnalysisResult } from "@/lib/types";

interface SkillGapTableProps {
  result: FitAnalysisResult | null;
}

function GapSection({
  title,
  dotColor,
  items,
  emptyText,
  icon,
}: {
  title: string;
  dotColor: string;
  items: string[];
  emptyText: string;
  icon: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${dotColor}`}>
        <span
          className={`h-2 w-2 rounded-full shrink-0 ${
            dotColor === "text-emerald-400"
              ? "bg-emerald-400"
              : dotColor === "text-rose-400"
                ? "bg-rose-400"
                : "bg-amber-400"
          }`}
        />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted">{emptyText}</li>
        ) : (
          items.map((s) => (
            <li key={s} className="text-sm flex gap-2">
              <span className={`shrink-0 ${dotColor}`}>{icon}</span>
              <span>{s}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function SkillGapTable({ result }: SkillGapTableProps) {
  if (!result) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-sm text-muted">
        Run analysis to see skill gaps and strengths.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GapSection
        title="Strengths"
        dotColor="text-emerald-400"
        items={result.strengths}
        emptyText="No strengths identified."
        icon="✓"
      />
      <GapSection
        title="Skill Gaps"
        dotColor="text-rose-400"
        items={result.gaps}
        emptyText="No major gaps found."
        icon="△"
      />
      <div className="glass-panel rounded-2xl p-5 md:col-span-2">
        <h3 className="font-semibold text-amber-300 mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Interview Risks
        </h3>
        <ul className="space-y-2">
          {result.interview_risks.length === 0 ? (
            <li className="text-sm text-muted">No major interview risks flagged.</li>
          ) : (
            result.interview_risks.map((r) => (
              <li key={r} className="text-sm flex gap-2">
                <span className="text-amber-400 shrink-0">!</span>
                <span>{r}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
