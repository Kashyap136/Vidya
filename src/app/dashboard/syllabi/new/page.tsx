"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSyllabusAction, saveSyllabusTextAction, uploadPdfAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Breadcrumb } from "@/components/shared/breadcrumb";

type InputMethod = "select" | "text" | "pdf";

export default function NewSyllabusPage() {
  const router = useRouter();
  const [method, setMethod] = useState<InputMethod>("select");
  const [title, setTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [syllabusId, setSyllabusId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (syllabusId) {
      router.push(`/dashboard/syllabi/${syllabusId}`);
      router.refresh();
    }
  }, [syllabusId, router]);

  useEffect(() => {
    setError(null);
  }, [method]);

  async function handleCreate() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (method === "text" && pasteText.trim().length < 50) {
      setError("Syllabus text must be at least 50 characters");
      return;
    }

    if (method === "pdf" && !pdfFile) {
      setError("Please select a PDF file");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const createResult = await createSyllabusAction({ title: title.trim() });

      if (!createResult.success) {
        setError(createResult.error.message);
        setPending(false);
        return;
      }

      const newId = createResult.data.id as string;

      if (method === "text") {
        const textResult = await saveSyllabusTextAction(newId, pasteText.trim());
        if (!textResult.success) {
          setError(textResult.error.message);
          setPending(false);
          return;
        }
      } else if (method === "pdf" && pdfFile) {
        const formData = new FormData();
        formData.set("file", pdfFile);
        const uploadResult = await uploadPdfAction(newId, formData);
        if (!uploadResult.success) {
          setError(uploadResult.error.message);
          setPending(false);
          return;
        }
      }

      setSyllabusId(newId);
    } catch {
      setError("An unexpected error occurred");
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Syllabuses", href: "/dashboard/syllabi" },
        { label: "New Syllabus" },
      ]} />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Syllabus</CardTitle>
            <CardDescription>Set up a new syllabus for AI-powered study</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures"
                disabled={pending}
                required
              />
            </div>

            {method === "select" && (
              <div className="space-y-3">
                <Label>Input Method</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMethod("text")}
                    disabled={pending}
                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Paste Text</p>
                      <p className="text-xs text-muted-foreground">Copy and paste your syllabus content</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("pdf")}
                    disabled={pending}
                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="12" y2="12" />
                      <line x1="15" y1="15" x2="12" y2="12" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Upload PDF</p>
                      <p className="text-xs text-muted-foreground">Upload a PDF syllabus document</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {method === "text" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pasteText">Syllabus Content</Label>
                  <button
                    type="button"
                    onClick={() => setMethod("select")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    disabled={pending}
                  >
                    Change input method
                  </button>
                </div>
                <Textarea
                  id="pasteText"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your syllabus content here... Include course description, topics, schedule, and any learning objectives."
                  rows={12}
                  disabled={pending}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {pasteText.length} characters (minimum 50 required)
                </p>
              </div>
            )}

            {method === "pdf" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>PDF File</Label>
                  <button
                    type="button"
                    onClick={() => setMethod("select")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                    disabled={pending}
                  >
                    Change input method
                  </button>
                </div>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-muted-foreground/50"
                  onClick={() => document.getElementById("pdf-input")?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-muted-foreground">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="12" y2="12" />
                    <line x1="15" y1="15" x2="12" y2="12" />
                  </svg>
                  {pdfFile ? (
                    <div>
                      <p className="text-sm font-medium">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                        className="mt-2 text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="mb-1 text-sm font-medium">Drag & drop your PDF here</p>
                      <p className="text-xs text-muted-foreground">or click to browse (PDF, max 20MB)</p>
                    </>
                  )}
                  <input
                    id="pdf-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 20 * 1024 * 1024) {
                          setError("File size exceeds 20MB limit");
                          return;
                        }
                        setPdfFile(file);
                        setError(null);
                      }
                    }}
                    disabled={pending}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={pending || method === "select"}
            >
              {pending ? "Creating..." : method === "select" ? "Select an input method" : "Create Syllabus"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
