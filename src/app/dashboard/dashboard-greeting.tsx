"use client";

import { TrendingUp, Flame } from "lucide-react";

interface DashboardGreetingProps {
  session: { user?: { name?: string | null } } | null;
  stats?: { total: number };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting({ session, stats }: DashboardGreetingProps) {
  const greeting = getGreeting();

  const name = session?.user?.name || "Student";

  return (
    <div className="relative rounded-2xl border bg-gradient-to-br from-primary/5 via-primary/5 to-transparent p-6 sm:p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {greeting}, {name.split(" ")[0]}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Here&apos;s your learning overview
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span><strong className="text-foreground">0</strong> day streak</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-success" />
            <span><strong className="text-foreground">{stats?.total ?? 0}</strong> syllabuses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
