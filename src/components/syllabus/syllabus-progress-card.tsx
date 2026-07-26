import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";

interface SyllabusProgressCardProps {
  id: string;
  title: string;
  totalTopics: number;
  completedTopics: number;
  totalHours: number;
}

export function SyllabusProgressCard({
  id,
  title,
  totalTopics,
  completedTopics,
  totalHours,
}: SyllabusProgressCardProps) {
  const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <Link href={`/dashboard/syllabi/${id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium line-clamp-1">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProgressBar value={percent} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedTopics}/{totalTopics} topics
            </span>
            <span>{percent}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{totalHours}h estimated</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SyllabusProgressCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-2 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}
