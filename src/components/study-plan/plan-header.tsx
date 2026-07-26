import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Flame, CalendarDays, Target, Clock } from "lucide-react";

interface PlanHeaderProps {
  stats: {
    totalMinutes: number;
    completedMinutes: number;
    totalTasks: number;
    completedTasks: number;
    totalDays: number;
    completedDays: number;
    streak: number;
    daysRemaining: number;
  };
}

export function PlanHeader({ stats }: PlanHeaderProps) {
  const taskPercent =
    stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const minutesPercent =
    stats.totalMinutes > 0 ? Math.round((stats.completedMinutes / stats.totalMinutes) * 100) : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center">
            <CalendarDays className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{stats.daysRemaining}</p>
            <p className="text-xs text-muted-foreground">Days Left</p>
          </div>
          <div className="text-center">
            <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{stats.completedDays}/{stats.totalDays}</p>
            <p className="text-xs text-muted-foreground">Days Done</p>
          </div>
          <div className="text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold">
              {Math.ceil(stats.completedMinutes / 60)}h
            </p>
            <p className="text-xs text-muted-foreground">Studied</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Tasks</span>
              <span>{stats.completedTasks}/{stats.totalTasks} ({taskPercent}%)</span>
            </div>
            <ProgressBar value={taskPercent} />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Study Hours</span>
              <span>
                {Math.ceil(stats.completedMinutes / 60)}h / {Math.ceil(stats.totalMinutes / 60)}h ({minutesPercent}%)
              </span>
            </div>
            <ProgressBar value={minutesPercent} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
