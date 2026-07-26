import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopicProgressSummaryProps {
  total: number;
  completed: number;
  totalHours: number;
  completedHours: number;
}

export function TopicProgressSummary({
  total,
  completed,
  totalHours,
  completedHours,
}: TopicProgressSummaryProps) {
  const remaining = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar value={percent} />
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-2xl font-bold">{completed}/{total}</p>
            <p className="text-muted-foreground">Topics</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{remaining}</p>
            <p className="text-muted-foreground">Remaining</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalHours}h</p>
            <p className="text-muted-foreground">Est. Hours</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {completedHours}h of {totalHours}h completed
        </p>
      </CardContent>
    </Card>
  );
}
