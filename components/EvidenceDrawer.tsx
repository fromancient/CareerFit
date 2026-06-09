"use client";

export interface EvidenceItem {
  chunkId: string;
  documentName: string;
  section: string | null;
  excerpt: string;
  score?: number;
}

interface EvidenceDrawerProps {
  items: EvidenceItem[];
  confidence?: string | null;
  title?: string;
}

export function EvidenceDrawer({
  items,
  confidence,
  title = "Retrieved Evidence",
}: EvidenceDrawerProps) {
  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8 bg-white/[0.02]">
        <h3 className="font-semibold text-sm text-gradient">{title}</h3>
        {confidence && (
          <p className="text-xs text-muted mt-1">
            Confidence:{" "}
            <span className="font-medium capitalize text-cyan-300">{confidence}</span>
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted p-2">
            Ask a question to see retrieved resume and JD chunks here.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.chunkId}
              className="rounded-xl border border-white/8 p-3 bg-white/[0.03] text-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-medium text-xs text-cyan-300 truncate">
                  {item.documentName}
                </span>
                {item.score !== undefined && (
                  <span className="text-xs text-violet-300 tabular-nums shrink-0">
                    {(item.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              {item.section && (
                <p className="text-xs text-muted mb-1.5">{item.section}</p>
              )}
              <p className="text-foreground/80 leading-relaxed">
                {item.excerpt}
                {item.excerpt.length >= 200 ? "…" : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
