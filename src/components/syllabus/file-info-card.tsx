"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface FileInfo {
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: string | null;
  filePath: string;
}

interface FileInfoCardProps {
  fileInfo: FileInfo;
  onDownload: () => void;
  onReplace: () => void;
  onDelete: () => void;
  replacePending?: boolean;
  deletePending?: boolean;
  downloadPending?: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "Unknown";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FileInfoCard({
  fileInfo,
  onDownload,
  onReplace,
  onDelete,
  replacePending,
  deletePending,
  downloadPending,
}: FileInfoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="p-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-primary" aria-hidden="true">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {fileInfo.fileName || "Untitled PDF"}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {fileInfo.fileSize != null && (
                <span>{formatFileSize(fileInfo.fileSize)}</span>
              )}
              {fileInfo.mimeType && (
                <span>{fileInfo.mimeType}</span>
              )}
              {fileInfo.uploadedAt && (
                <span>Uploaded {formatDate(fileInfo.uploadedAt)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={downloadPending}
          >
            {downloadPending ? "Opening..." : "Download"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReplace}
            disabled={replacePending}
          >
            {replacePending ? "Replacing..." : "Replace"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deletePending}
          >
            {deletePending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="Delete PDF"
        description="Are you sure you want to delete this PDF? The syllabus will be kept but the file will be permanently removed from storage."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
