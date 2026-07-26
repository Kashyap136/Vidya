import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Minus } from "lucide-react";

interface WeeklyViewProps {
  days: Array<{
    id: string;
    date: string;
    dayNumber: number;
    totalMinutes: number;
    isComplete: boolean;
  }>;
  referenceDate?: string;
}

function getWeekDays(reference: Date): Date[] {
  const start = new Date(reference);
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function WeeklyView({ days, referenceDate }: WeeklyViewProps) {
  const weekDays = getWeekDays(referenceDate ? new Date(referenceDate) : new Date());
  const dayMap = new Map(
    days.map((d) => [new Date(d.date).toISOString().slice(0, 10), d]),
  );

  const weekTotal = days
    .filter((d) => {
      const dt = new Date(d.date);
      return weekDays.some((wd) => wd.toISOString().slice(0, 10) === dt.toISOString().slice(0, 10));
    })
    .reduce((s, d) => s + d.totalMinutes, 0);

  const weekCompleted = days
    .filter((d) => {
      const dt = new Date(d.date);
      return weekDays.some((wd) => wd.toISOString().slice(0, 10) === dt.toISOString().slice(0, 10));
    })
    .filter((d) => d.isComplete)
    .reduce((s, d) => s + d.totalMinutes, 0);

  const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <span className="text-xs text-muted-foreground">
            {Math.ceil(weekCompleted / 60)}h / {Math.ceil(weekTotal / 60)}h
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((wd) => {
            const key = wd.toISOString().slice(0, 10);
            const day = dayMap.get(key);
            const today = new Date().toISOString().slice(0, 10) === key;
            const isFuture = wd > new Date();

            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md p-2 text-center",
                  today && "bg-primary/10",
                  day?.isComplete && "bg-green-50 dark:bg-green-950",
                )}
              >
                <span className="text-[10px] font-medium text-muted-foreground">
                  {wd.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                </span>
                <span className="text-xs font-medium">{wd.getDate()}</span>
                {isFuture ? (
                  <Minus className="h-3 w-3 text-muted-foreground/40" />
                ) : day?.isComplete ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : day ? (
                  <Clock className="h-3 w-3 text-amber-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground/40" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${weekPercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
