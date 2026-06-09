"use client";

import { useCallback, useState } from "react";

interface UploadDropzoneProps {
  label: string;
  description: string;
  documentType: "RESUME" | "JOB_DESCRIPTION";
  disabled?: boolean;
  onUploaded: (result: {
    documentId: string;
    name: string;
    type: string;
    chunkCount: number;
  }) => void;
}

export function UploadDropzone({
  label,
  description,
  documentType,
  disabled,
  onUploaded,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", documentType);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        onUploaded(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [documentType, onUploaded],
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="glass-panel holo-border rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="font-semibold">{label}</h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all ${
          dragging
            ? "border-cyan-400/50 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
            : "border-white/15 hover:border-cyan-400/30 hover:bg-white/[0.03]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          disabled={disabled || uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/20 flex items-center justify-center border border-white/10">
          <svg
            className="h-6 w-6 text-cyan-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <span className="text-sm font-medium">
          {uploading ? "Processing & embedding…" : "Drop file or click to browse"}
        </span>
        <span className="text-xs text-muted">PDF, DOCX, or TXT · max 10 MB</span>
      </label>
      {error && (
        <p className="mt-3 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
