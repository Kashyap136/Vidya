"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./task-card";
import { ProgressBar } from "@/components/shared/progress-bar";

interface DailyAgendaProps {
  date: string;
  dayNumber: number;
  totalMinutes: number;
  isComplete: boolean;
  tasks: Array<{
    id: string;
    topic: {
      id: string;
      title: string;
      difficulty: string;
      priority: string;
      estimatedMinutes: number;
    } | null;
    minutes: number;
    isComplete: boolean;
    order: number;
  }>;
}

export function DailyAgenda({
  date,
  dayNumber,
  totalMinutes,
  isComplete,
  tasks,
}: DailyAgendaProps) {
  const router = useRouter();
  const completedCount = tasks.filter((t) => t.isComplete).length;
  const percent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const dateObj = new Date(date);
  const isToday = new Date().toISOString().slice(0, 10) === dateObj.toISOString().slice(0, 10);
  const isPast = dateObj < new Date(new Date().toISOString().slice(0, 10));

  const handleToggle = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <Card
      className={
        isToday
          ? "border-primary"
          : isPast && !isComplete
            ? "border-amber-200 dark:border-amber-900"
            : ""
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              {isToday ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              {isComplete && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">Complete</span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Day {dayNumber} · {Math.ceil(totalMinutes / 60)}h estimated
            </p>
          </div>
          <span className="text-sm font-medium">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <ProgressBar value={percent} />
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Rest day — no tasks assigned</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
