"use client";

import { useMemo, useState } from "react";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

interface SidebarProps {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  selectedJobId: string | null;
  onSelectDocument: (id: string, type: "RESUME" | "JOB_DESCRIPTION") => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  documents,
  selectedDocumentId,
  selectedJobId,
  onSelectDocument,
  onDelete,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const resume = documents.find((d) => d.type === "RESUME");
  const jobs = documents.filter((d) => d.type === "JOB_DESCRIPTION");

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => j.name.toLowerCase().includes(q));
  }, [jobs, search]);

  return (
    <aside className="flex flex-col h-full glass-panel rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/8 space-y-2 shrink-0">
        <h2 className="font-semibold text-sm text-gradient">Documents</h2>
        {jobs.length > 0 && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
            className="glass-input w-full rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
        <section>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-1">
            Resume
          </p>
          {resume ? (
            <DocumentRow
              doc={resume}
              selected={selectedDocumentId === resume.id}
              onSelect={() => onSelectDocument(resume.id, "RESUME")}
              onDelete={onDelete}
            />
          ) : (
            <p className="text-sm text-muted px-1">No indexed resume</p>
          )}
        </section>

        <section>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-1">
            Job Descriptions ({filteredJobs.length})
          </p>
          {filteredJobs.length === 0 ? (
            <p className="text-sm text-muted px-1">
              {search ? "No jobs match your search." : "No indexed jobs"}
            </p>
          ) : (
            <ul className="space-y-1">
              {filteredJobs.map((job, i) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDocument(job.id, "JOB_DESCRIPTION")}
                    className={`w-full text-left rounded-xl px-3 py-2 text-sm transition-all ${
                      selectedDocumentId === job.id
                        ? "bg-gradient-to-r from-cyan-400/20 to-violet-500/20 border border-cyan-400/30 text-foreground shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                        : selectedJobId === job.id
                          ? "bg-violet-500/10 border border-violet-400/20 text-violet-200"
                          : "hover:bg-white/[0.05] border border-transparent"
                    }`}
                  >
                    <span className="font-medium">Job #{i + 1}</span>
                    <span className="block truncate text-xs mt-0.5 text-muted">
                      {job.name}
                    </span>
                  </button>
                  <div className="flex justify-end px-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => onDelete(job.id)}
                      className="text-xs text-muted hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}

function DocumentRow({
  doc,
  selected,
  onSelect,
  onDelete,
}: {
  doc: DocumentItem;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl px-3 py-2 transition-all border ${
        selected
          ? "bg-gradient-to-r from-cyan-400/20 to-violet-500/20 border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <p className="text-sm font-medium truncate">{doc.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted">{doc.chunkCount} chunks</span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onDelete(doc.id);
            }
          }}
          className="text-xs text-muted hover:text-rose-400"
        >
          Remove
        </span>
      </div>
    </button>
  );
}
