"use client";

import { DocumentViewer } from "./DocumentViewer";
import { Sidebar } from "./Sidebar";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

interface DocumentsPanelProps {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  selectedJobId: string | null;
  onSelectDocument: (id: string, type: "RESUME" | "JOB_DESCRIPTION") => void;
  onDelete: (id: string) => void;
  layout?: "stacked" | "sidebar-only";
}

export function DocumentsPanel({
  documents,
  selectedDocumentId,
  selectedJobId,
  onSelectDocument,
  onDelete,
  layout = "stacked",
}: DocumentsPanelProps) {
  if (layout === "sidebar-only") {
    return (
      <div className="flex flex-col h-full min-h-0 gap-3">
        <div className="shrink-0 max-h-[45%] min-h-[180px] overflow-hidden">
          <Sidebar
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            selectedJobId={selectedJobId}
            onSelectDocument={onSelectDocument}
            onDelete={onDelete}
          />
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <DocumentViewer documentId={selectedDocumentId} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[70vh] gap-3">
      <div className="shrink-0 max-h-[40%] min-h-[200px]">
        <Sidebar
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          selectedJobId={selectedJobId}
          onSelectDocument={onSelectDocument}
          onDelete={onDelete}
        />
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <DocumentViewer documentId={selectedDocumentId} />
      </div>
    </div>
  );
}
