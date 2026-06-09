"use client";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

interface SidebarProps {
  documents: DocumentItem[];
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  documents,
  selectedJobId,
  onSelectJob,
  onDelete,
}: SidebarProps) {
  const resume = documents.find((d) => d.type === "RESUME");
  const jobs = documents.filter((d) => d.type === "JOB_DESCRIPTION");

  return (
    <aside className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-slate-50">
        <h2 className="font-semibold text-sm">Documents</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <section>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-1">
            Resume
          </p>
          {resume ? (
            <DocumentRow doc={resume} onDelete={onDelete} />
          ) : (
            <p className="text-sm text-muted px-1">No resume uploaded</p>
          )}
        </section>

        <section>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 px-1">
            Job Descriptions ({jobs.length})
          </p>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted px-1">No jobs uploaded</p>
          ) : (
            <ul className="space-y-1">
              {jobs.map((job, i) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => onSelectJob(job.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedJobId === job.id
                        ? "bg-accent text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-medium">Job #{i + 1}</span>
                    <span
                      className={`block truncate text-xs mt-0.5 ${
                        selectedJobId === job.id ? "text-indigo-100" : "text-muted"
                      }`}
                    >
                      {job.name}
                    </span>
                  </button>
                  <div className="flex justify-end px-1 mt-0.5">
                    <button
                      type="button"
                      onClick={() => onDelete(job.id)}
                      className="text-xs text-muted hover:text-danger"
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
  onDelete,
}: {
  doc: DocumentItem;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2 bg-white">
      <p className="text-sm font-medium truncate">{doc.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted">{doc.chunkCount} chunks</span>
        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          className="text-xs text-muted hover:text-danger"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
