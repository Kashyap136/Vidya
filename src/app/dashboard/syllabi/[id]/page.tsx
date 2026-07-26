import { notFound } from "next/navigation";
import Link from "next/link";
import { getSyllabusAction, listTopicsAction } from "@/actions";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PdfSection } from "@/components/syllabus/pdf-section";
import { TopicExplorer } from "@/components/topic/topic-explorer";
import { BookOpen, FileText, Brain, ArrowLeft, Loader2 } from "lucide-react";

export default async function SyllabusDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getSyllabusAction(id);

  if (!result.success) {
    if (result.error.code === "NOT_FOUND") { notFound(); }
    return (
      <div className="space-y-6 animate-fade-in">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Syllabuses", href: "/dashboard/syllabi" }, { label: "Syllabus" }]} />
        <PageHeader title="Syllabus" />
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
          {result.error.message}
        </div>
        <Link href="/dashboard/syllabi"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Syllabuses</Button></Link>
      </div>
    );
  }

  const syllabus = result.data;
  const title = (syllabus.title as string) || "Untitled";
  const status = syllabus.processingStatus as string;
  const errorMessage = syllabus.errorMessage as string | null;
  const failedStep = syllabus.failedStep as string | null;
  const createdAt = syllabus.createdAt as string;
  const updatedAt = syllabus.updatedAt as string;
  const pageCount = syllabus.pageCount as number | null;
  const fileName = syllabus.fileName as string | null;
  const fileSize = syllabus.fileSize as number | null;
  const mimeType = syllabus.mimeType as string | null;
  const uploadedAt = syllabus.uploadedAt as string | null;
  const filePath = syllabus.filePath as string | null;

  const fileInfo = fileName && filePath ? { fileName, fileSize, mimeType, uploadedAt, filePath } : null;

  const topicsResult = await listTopicsAction(id);
  const topics = topicsResult.success ? (topicsResult.data as Record<string, unknown>[]) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Syllabuses", href: "/dashboard/syllabi" }, { label: title }]} />
      <PageHeader title={title} description={`Created ${createdAt ? new Date(createdAt).toLocaleDateString() : ""}${updatedAt ? ` · Updated ${new Date(updatedAt).toLocaleDateString()}` : ""}`}>
        <Link href={`/dashboard/syllabi/${id}/plan`}><Button size="sm" className="gap-2"><Brain className="h-4 w-4" /> Study Plan</Button></Link>
        <Link href={`/dashboard/syllabi/${id}/quiz`}><Button variant="outline" size="sm" className="gap-2"><BookOpen className="h-4 w-4" /> Quizzes</Button></Link>
        <Link href={`/dashboard/syllabi/${id}/edit`}><Button variant="outline" size="sm">Rename</Button></Link>
      </PageHeader>

      {status === "FAILED" && errorMessage && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
            Processing Failed{failedStep ? ` at step: ${failedStep}` : ""}
          </div>
          <p className="text-destructive/80 ml-4">{errorMessage}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {status ? <StatusBadge status={status} /> : <span className="text-sm text-muted-foreground">Unknown</span>}
          </CardContent>
        </Card>
        {pageCount != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{pageCount}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{topics.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PdfSection syllabusId={id} initialFileInfo={fileInfo} />
      <TopicExplorer topics={topics.map((t: Record<string, unknown>) => ({ id: t.id as string, title: t.title as string, summary: t.summary as string | null, priority: t.priority as string, difficulty: t.difficulty as string, estimatedMinutes: Number(t.estimatedMinutes) || 0, completedAt: t.completedAt as string | null, order: Number(t.order) || 0 }))} />
      <Link href="/dashboard/syllabi"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Syllabuses</Button></Link>
    </div>
  );
}