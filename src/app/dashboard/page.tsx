import { Suspense } from "react";
import { auth } from "@/auth/config";
import { getDashboardDataAction, getTodayPlanAction } from "@/actions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SyllabusProgressCard } from "@/components/syllabus/syllabus-progress-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DailyAgenda } from "@/components/study-plan/daily-agenda";
import { DashboardGreeting } from "./dashboard-greeting";
import { Sparkles, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function DashboardContent() {
  const session = await auth();
  const result = await getDashboardDataAction();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <DashboardGreeting session={session} />
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
          Could not load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  const { stats, recentSyllabuses } = result.data;
  const todayPlanResult = await getTodayPlanAction();

  const activeSyllabuses = recentSyllabuses.filter(
    (s) => (s.topicsProgress as Record<string, unknown> | undefined) != null,
  );

  const name = session?.user?.name || "Student";

  const syllabusCount = String(stats.total);

  return (
    <div className="space-y-8">
      <DashboardGreeting session={session} stats={{ total: stats.total }} />

      <StatsCards stats={stats} />

      <QuickActions />

      {todayPlanResult.success && todayPlanResult.data?.day && (
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Today&apos;s Study Plan
              </CardTitle>
              <CardDescription>{todayPlanResult.data.syllabusTitle as string}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DailyAgenda
              date={(todayPlanResult.data.day as Record<string, unknown>).date as string}
              dayNumber={(todayPlanResult.data.day as Record<string, unknown>).dayNumber as number}
              totalMinutes={(todayPlanResult.data.day as Record<string, unknown>).totalMinutes as number}
              isComplete={(todayPlanResult.data.day as Record<string, unknown>).isComplete as boolean}
              tasks={((todayPlanResult.data.day as Record<string, unknown>).tasks as Array<Record<string, unknown>> || []).map((t) => ({
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
          </CardContent>
        </Card>
      )}

      {activeSyllabuses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Active Syllabuses</h2>
              <p className="text-sm text-muted-foreground">Continue learning with your syllabuses</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeSyllabuses.map((syllabus) => {
              const progress = syllabus.topicsProgress as { total: number; completed: number; totalHours: number };
              return (
                <SyllabusProgressCard
                  key={syllabus.id as string}
                  id={syllabus.id as string}
                  title={syllabus.title as string}
                  totalTopics={progress.total}
                  completedTopics={progress.completed}
                  totalHours={progress.totalHours}
                />
              );
            })}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Syllabuses</CardTitle>
            <CardDescription>Your most recently created syllabuses</CardDescription>
          </div>
          {recentSyllabuses.length > 0 && (
            <Link href="/dashboard/syllabi">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {recentSyllabuses.length === 0 ? (
            <EmptyState
              variant="syllabus"
              title="No syllabuses yet"
              description="Create your first syllabus to get started with AI-powered learning."
              actionLabel="Create Syllabus"
              actionHref="/dashboard/syllabi/new"
            />
          ) : (
            <div className="divide-y">
              {recentSyllabuses.map((syllabus) => (
                <div key={syllabus.id as string} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <a href={`/dashboard/syllabi/${syllabus.id as string}`} className="font-medium hover:text-primary transition-colors text-sm truncate block">
                        {syllabus.title as string}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {syllabus.createdAt ? new Date(syllabus.createdAt as string).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground shrink-0 ml-2">
                    {(syllabus.processingStatus as string) || "UPLOADED"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-24 rounded-xl bg-muted animate-pulse" />
          <div className="h-24 rounded-xl bg-muted animate-pulse" />
          <div className="h-24 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="h-12 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
