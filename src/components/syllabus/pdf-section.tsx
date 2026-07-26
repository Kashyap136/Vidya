"use client";

import { useRef, useState } from "react";
import { uploadPdfAction, replacePdfAction, deletePdfAction, getDownloadUrlAction } from "@/actions";
import { PdfUploadZone } from "./pdf-upload-zone";
import { FileInfoCard } from "./file-info-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface PdfSectionProps {
  syllabusId: string;
  initialFileInfo: {
    fileName: string | null;
    fileSize: number | null;
    mimeType: string | null;
    uploadedAt: string | null;
    filePath: string;
  } | null;
}

export function PdfSection({ syllabusId, initialFileInfo }: PdfSectionProps) {
  const [fileInfo, setFileInfo] = useState(initialFileInfo);
  const [showReplace, setShowReplace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPending, setUploadPending] = useState(false);
  const [replacePending, setReplacePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(file: File) {
    if (file.type && file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB limit.");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    if (showReplace) {
      setReplacePending(true);
      const result = await replacePdfAction(syllabusId, formData);
      setReplacePending(false);
      if (result.success) {
        setFileInfo({
          fileName: result.data.fileName,
          fileSize: result.data.fileSize,
          mimeType: "application/pdf",
          uploadedAt: new Date().toISOString(),
          filePath: result.data.filePath,
        });
        setShowReplace(false);
      } else {
        setError(result.error.message);
      }
    } else {
      setUploadPending(true);
      const result = await uploadPdfAction(syllabusId, formData);
      setUploadPending(false);
      if (result.success) {
        setFileInfo({
          fileName: result.data.fileName,
          fileSize: result.data.fileSize,
          mimeType: "application/pdf",
          uploadedAt: new Date().toISOString(),
          filePath: result.data.filePath,
        });
      } else {
        setError(result.error.message);
      }
    }
  }

  async function handleDownload() {
    setDownloadPending(true);
    try {
      const result = await getDownloadUrlAction(syllabusId);
      if (result.success) {
        window.open(result.data.url, "_blank");
      } else {
        setError(result.error.message);
      }
    } finally {
      setDownloadPending(false);
    }
  }

  async function handleDelete() {
    setDeletePending(true);
    const result = await deletePdfAction(syllabusId);
    setDeletePending(false);
    if (result.success) {
      setFileInfo(null);
    } else {
      setError(result.error.message);
    }
  }

  function handleReplaceClick() {
    replaceInputRef.current?.click();
  }

  function handleReplaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">PDF File</CardTitle>
        <CardDescription>
          {fileInfo ? "Uploaded syllabus document" : "Upload your syllabus document (PDF)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={replaceInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleReplaceFileChange}
        />

        {fileInfo && !showReplace ? (
          <FileInfoCard
            fileInfo={fileInfo}
            onDownload={handleDownload}
            onReplace={handleReplaceClick}
            onDelete={handleDelete}
            replacePending={replacePending}
            deletePending={deletePending}
            downloadPending={downloadPending}
          />
        ) : (
          <div className="space-y-4">
            <PdfUploadZone
              onFileSelected={handleFileSelected}
              disabled={uploadPending || replacePending}
              error={error}
            />
            {showReplace && (
              <button
                type="button"
                onClick={() => { setShowReplace(false); setError(null); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel replace
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
