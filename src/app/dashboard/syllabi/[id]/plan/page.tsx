import { notFound } from "next/navigation";
import Link from "next/link";
import { getSyllabusAction, getPlanAction, getPlanStatsAction, listTopicsAction } from "@/actions";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import { PlanHeader } from "@/components/study-plan/plan-header";
import { WeeklyView } from "@/components/study-plan/weekly-view";
import { DailyAgenda } from "@/components/study-plan/daily-agenda";
import { PlanGenerator } from "./plan-generator";

export default async function StudyPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: syllabusId } = await params;
  const syllabusResult = await getSyllabusAction(syllabusId);

  if (!syllabusResult.success) {
    if (syllabusResult.error.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Syllabuses", href: "/dashboard/syllabi" },
          { label: "Study Plan" },
        ]} />
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {syllabusResult.error.message}
        </div>
        <Link href={`/dashboard/syllabi/${syllabusId}`}>
          <Button variant="outline">Back to Syllabus</Button>
        </Link>
      </div>
    );
  }

  const syllabus = syllabusResult.data;
  const title = (syllabus.title as string) || "Untitled";
  const status = syllabus.processingStatus as string;
  const errorMessage = syllabus.errorMessage as string | null;
  const failedStep = syllabus.failedStep as string | null;

  const planResult = await getPlanAction(syllabusId);
  const plan = planResult.success ? planResult.data : null;

  const statsResult = await getPlanStatsAction(syllabusId);
  const stats = statsResult.success ? statsResult.data : {
    totalMinutes: 0, completedMinutes: 0, totalTasks: 0, completedTasks: 0,
    totalDays: 0, completedDays: 0, streak: 0, daysRemaining: 0,
  };

  const topicsResult = await listTopicsAction(syllabusId);
  const topics = topicsResult.success ? (topicsResult.data as Record<string, unknown>[]) : [];

  const isProcessing = ["UPLOADED", "EXTRACTING", "EXTRACTED", "GENERATING_TOPICS", "TOPICS_CREATED", "GENERATING_PLAN"].includes(status);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Syllabuses", href: "/dashboard/syllabi" },
        { label: title, href: `/dashboard/syllabi/${syllabusId}` },
        { label: "Study Plan" },
      ]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Plan</h1>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/syllabi/${syllabusId}`}>
            <Button variant="outline" size="sm">Back to Syllabus</Button>
          </Link>
        </div>
      </div>

      {status === "FAILED" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
              Processing Failed{failedStep ? ` at step: ${failedStep}` : ""}
            </div>
            {errorMessage && <p className="text-destructive/80 ml-4">{errorMessage}</p>}
          </div>
          {topics.length > 0 && (
            <PlanGenerator
              syllabusId={syllabusId}
              topics={topics.map((t) => ({
                id: t.id as string,
                title: t.title as string,
                summary: t.summary as string | null,
                priority: t.priority as string,
                difficulty: t.difficulty as string,
                estimatedMinutes: t.estimatedMinutes as number,
                completedAt: t.completedAt as string | null,
              }))}
            />
          )}
        </div>
      )}

      {isProcessing && !plan && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <h2 className="text-lg font-semibold">Generating Study Plan</h2>
          <p className="text-sm text-muted-foreground">Please wait while we process your syllabus...</p>
        </div>
      )}

      {!isProcessing && status !== "FAILED" && !plan && topics.length > 0 && (
        <PlanGenerator
          syllabusId={syllabusId}
          topics={topics.map((t) => ({
            id: t.id as string,
            title: t.title as string,
            summary: t.summary as string | null,
            priority: t.priority as string,
            difficulty: t.difficulty as string,
            estimatedMinutes: t.estimatedMinutes as number,
            completedAt: t.completedAt as string | null,
          }))}
        />
      )}

      {!isProcessing && status !== "FAILED" && !plan && topics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No topics found</p>
          <p className="text-sm text-muted-foreground">Upload a syllabus first to generate topics and a study plan.</p>
          <Link href={`/dashboard/syllabi/${syllabusId}`}>
            <Button variant="outline" className="mt-4">Back to Syllabus</Button>
          </Link>
        </div>
      )}

      {plan && (
        <>
          <PlanHeader stats={stats} />

          <WeeklyView
            days={(plan.days as Array<Record<string, unknown>> || []).map((d) => ({
              id: d.id as string,
              date: d.date as string,
              dayNumber: d.dayNumber as number,
              totalMinutes: d.totalMinutes as number,
              isComplete: d.isComplete as boolean,
            }))}
          />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Daily Agenda</h2>
            {(plan.days as Array<Record<string, unknown>> || []).map((day) => (
              <DailyAgenda
                key={day.id as string}
                date={day.date as string}
                dayNumber={day.dayNumber as number}
                totalMinutes={day.totalMinutes as number}
                isComplete={day.isComplete as boolean}
                tasks={(day.tasks as Array<Record<string, unknown>> || []).map((t) => ({
                  id: t.id as string,
                  topic: t.topic ? {
                    id: (t.topic as Record<string, unknown>).id as string,
                    title: (t.topic as Record<string, unknown>).title as string,
                    difficulty: (t.topic as Record<string, unknown>).difficulty as string,
                    priority: (t.topic as Record<string, unknown>).priority as string,
                    estimatedMinutes: (t.topic as Record<string, unknown>).estimatedMinutes as number,
                  } : null,
                  minutes: t.minutes as number,
                  isComplete: t.isComplete as boolean,
                  order: t.order as number,
                }))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
