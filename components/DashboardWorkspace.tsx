"use client";

import { useState } from "react";
import { ChatPanel } from "./ChatPanel";
import { DashboardMain } from "./DashboardMain";
import { DocumentsPanel } from "./DocumentsPanel";
import type { AnalysisResults } from "@/lib/types";
import {
  canRunAnalysis,
  canUseChat,
  getIndexedDocuments,
  getIndexedJobs,
} from "@/lib/documents/indexed";

type WorkspaceTab = "fit" | "assistant" | "documents";

interface DocumentItem {
  id: string;
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  chunkCount: number;
}

interface DashboardWorkspaceProps {
  sessionId: string;
  documents: DocumentItem[];
  analysis: AnalysisResults | null;
  analyzing: boolean;
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onAnalyze: () => void;
  onDeleteDocument: (id: string) => void;
}

const TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "assistant", label: "Career Assistant" },
  { id: "fit", label: "Fit Dashboard" },
  { id: "documents", label: "Documents" },
];

export function DashboardWorkspace({
  sessionId,
  documents,
  analysis,
  analyzing,
  selectedJobId,
  onSelectJob,
  onAnalyze,
  onDeleteDocument,
}: DashboardWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("assistant");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const indexedDocs = getIndexedDocuments(documents);
  const indexedJobs = getIndexedJobs(documents);
  const resumeDocument = indexedDocs.find((d) => d.type === "RESUME") ?? null;
  const selectedJob = indexedJobs.find((d) => d.id === selectedJobId) ?? indexedJobs[0] ?? null;
  const chatReady = canUseChat(documents);
  const analysisReady = canRunAnalysis(documents);

  const viewingDocumentId =
    selectedDocumentId ?? resumeDocument?.id ?? null;

  const handleSelectDocument = (
    id: string,
    type: "RESUME" | "JOB_DESCRIPTION",
  ) => {
    setSelectedDocumentId(id);
    if (type === "JOB_DESCRIPTION") {
      onSelectJob(id);
    }
  };

  const documentsPanel = (
    <DocumentsPanel
      documents={indexedDocs}
      selectedDocumentId={viewingDocumentId}
      selectedJobId={selectedJob?.id ?? null}
      onSelectDocument={handleSelectDocument}
      onDelete={onDeleteDocument}
      layout={activeTab === "documents" ? "stacked" : "sidebar-only"}
    />
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="xl:hidden shrink-0 glass-header px-2 py-2">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id ? "tab-active" : "tab-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden xl:grid flex-1 grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        <div className="col-span-3 min-h-0 flex flex-col overflow-hidden">
          {documentsPanel}
        </div>
        <div className="col-span-4 min-h-0 overflow-hidden">
          <DashboardMain
            analysis={analysis}
            analyzing={analyzing}
            onAnalyze={onAnalyze}
            selectedJobId={selectedJob?.id ?? null}
            onSelectJob={onSelectJob}
            canAnalyze={analysisReady}
            documentCount={indexedDocs.length}
          />
        </div>
        <div className="col-span-5 min-h-0 flex flex-col overflow-hidden">
          <ChatPanel
            key={`${sessionId}-${resumeDocument?.id ?? "none"}-${selectedJob?.id ?? "none"}`}
            sessionId={sessionId}
            resumeDocumentId={resumeDocument?.id ?? null}
            selectedJobId={selectedJob?.id ?? null}
            selectedJobName={selectedJob?.name ?? null}
            disabled={!chatReady}
            disabledReason={
              chatReady
                ? undefined
                : "Upload and index a resume before using Career Assistant."
            }
          />
        </div>
      </div>

      <div className="xl:hidden flex-1 min-h-0 p-4 overflow-hidden">
        {activeTab === "documents" && documentsPanel}
        {activeTab === "fit" && (
          <div className="h-full min-h-[50vh] overflow-y-auto">
            <DashboardMain
              analysis={analysis}
              analyzing={analyzing}
              onAnalyze={onAnalyze}
              selectedJobId={selectedJob?.id ?? null}
              onSelectJob={onSelectJob}
              canAnalyze={analysisReady}
              documentCount={indexedDocs.length}
            />
          </div>
        )}
        {activeTab === "assistant" && (
          <div className="h-full min-h-[70vh] flex flex-col">
            <ChatPanel
              key={`mobile-${sessionId}-${resumeDocument?.id ?? "none"}-${selectedJob?.id ?? "none"}`}
              sessionId={sessionId}
              resumeDocumentId={resumeDocument?.id ?? null}
              selectedJobId={selectedJob?.id ?? null}
              selectedJobName={selectedJob?.name ?? null}
              disabled={!chatReady}
              disabledReason={
                chatReady
                  ? undefined
                  : "Upload and index a resume before using Career Assistant."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
