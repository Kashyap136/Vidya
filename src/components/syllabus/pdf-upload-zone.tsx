"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface PdfUploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  error?: string | null;
}

export function PdfUploadZone({ onFileSelected, disabled, error }: PdfUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-muted-foreground">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="12" y2="12" />
          <line x1="15" y1="15" x2="12" y2="12" />
        </svg>
        <p className="mb-1 text-sm font-medium">
          {isDragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse (PDF, max 20MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
