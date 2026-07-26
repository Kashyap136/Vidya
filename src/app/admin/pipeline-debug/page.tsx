import { auth } from "@/auth/config";
import { syllabusRepository, topicRepository } from "@/repositories";
import { prisma } from "@/config/prisma";
import Link from "next/link";

async function getDiagnosticData(userId: string) {
  const syllabuses = await syllabusRepository.findMany(
    { userId } as Record<string, unknown>,
    { orderBy: { field: "createdAt" as const, order: "desc" as const }, limit: 20, includeDeleted: true },
  );

  const results = [];
  for (const s of syllabuses) {
    const syllabusId = s.id as string;
    const topics = await topicRepository.findBySyllabusId(syllabusId, { includeDeleted: true });
    const quizzes = await prisma.quiz.findMany({ where: { syllabusId } });
    const studyPlans = await prisma.studyPlan.findMany({
      where: { syllabusId },
      include: { _count: { select: { days: true } } },
    });

    let studyDays = 0;
    let studyTasks = 0;
    if (studyPlans.length > 0) {
      const days = await prisma.studyDay.findMany({
        where: { studyPlanId: { in: studyPlans.map((p) => p.id) } },
        include: { _count: { select: { tasks: true } } },
      });
      studyDays = days.length;
      studyTasks = days.reduce((sum, d) => sum + d._count.tasks, 0);
    }

    let totalQuestions = 0;
    if (quizzes.length > 0) {
      const questions = await prisma.quizQuestion.findMany({
        where: { quizId: { in: quizzes.map((q) => q.id) } },
      });
      totalQuestions = questions.length;
    }

    const errors = (s as Record<string, unknown>).errorMessage as string | undefined;
    const failedStep = (s as Record<string, unknown>).failedStep as string | undefined;

    results.push({
      id: syllabusId,
      title: s.title as string,
      status: s.processingStatus as string,
      rawTextLength: ((s.rawText as string) || "").length,
      hasRawText: !!(s.rawText as string),
      filePath: s.filePath as string,
      createdAt: (s.createdAt as Date).toISOString(),
      updatedAt: (s.updatedAt as Date).toISOString(),
      deletedAt: s.deletedAt ? (s.deletedAt as Date).toISOString() : null,
      topicCount: topics.length,
      quizCount: quizzes.length,
      questionCount: totalQuestions,
      planCount: studyPlans.length,
      studyDays,
      studyTasks,
      errorMessage: errors || null,
      failedStep: failedStep || null,
    });
  }

  return results;
}

export default async function PipelineDebugPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div className="p-8">Please sign in to view this page.</div>;
  }

  const data = await getDiagnosticData(session.user.id);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pipeline Debug Dashboard</h1>
        <p className="text-muted-foreground text-sm">User: {session.user.email} ({session.user.id})</p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No syllabuses found for this user.
        </div>
      ) : (
        data.map((s) => (
          <div key={s.id} className="rounded-lg border p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {s.title || "Untitled"}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">ID: {s.id}</p>
              </div>
              <StatusBadge status={s.status} />
            </div>

            {s.errorMessage && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">Failed Step: {s.failedStep || "Unknown"}</p>
                <p className="mt-1 font-mono text-xs break-all">{s.errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <StatBox label="Raw Text" value={s.hasRawText ? `${s.rawTextLength} chars` : "NONE"} variant={s.hasRawText ? "ok" : "error"} />
              <StatBox label="Topics" value={String(s.topicCount)} variant={s.topicCount > 0 ? "ok" : "warn"} />
              <StatBox label="Quizzes" value={String(s.quizCount)} variant={s.quizCount > 0 ? "ok" : "warn"} />
              <StatBox label="Questions" value={String(s.questionCount)} variant={s.questionCount > 0 ? "ok" : "warn"} />
              <StatBox label="Study Plans" value={String(s.planCount)} variant={s.planCount > 0 ? "ok" : "warn"} />
              <StatBox label="Study Days" value={String(s.studyDays)} variant={s.studyDays > 0 ? "ok" : "warn"} />
              <StatBox label="Study Tasks" value={String(s.studyTasks)} variant={s.studyTasks > 0 ? "ok" : "warn"} />
              <StatBox label="File Path" value={s.filePath || "none"} variant={s.filePath && s.filePath !== "manual" ? "ok" : "info"} />
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Created: {new Date(s.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(s.updatedAt).toLocaleString()}</span>
              {s.deletedAt && <span className="text-destructive">Deleted: {new Date(s.deletedAt).toLocaleString()}</span>}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/syllabi/${s.id}`}
                className="text-xs text-primary hover:underline"
              >
                View Syllabus
              </Link>
              <Link
                href={`/dashboard/syllabi/${s.id}/plan`}
                className="text-xs text-primary hover:underline"
              >
                Study Plan
              </Link>
              <Link
                href={`/dashboard/syllabi/${s.id}/quiz`}
                className="text-xs text-primary hover:underline"
              >
                Quizzes
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    UPLOADED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    EXTRACTING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    EXTRACTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    GENERATING_TOPICS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    TOPICS_CREATED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    GENERATING_PLAN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PLAN_CREATED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    GENERATING_QUIZ: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    QUIZ_CREATED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  const color = colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

function StatBox({ label, value, variant }: { label: string; value: string; variant: "ok" | "warn" | "error" | "info" }) {
  const colors: Record<string, string> = {
    ok: "text-green-600 dark:text-green-400",
    warn: "text-yellow-600 dark:text-yellow-400",
    error: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${colors[variant]}`}>{value}</p>
    </div>
  );
}
