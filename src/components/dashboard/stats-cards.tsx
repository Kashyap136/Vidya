import { BookOpen, Activity, Archive, TrendingUp, Clock, Brain } from "lucide-react";
import { StatsCard } from "@/components/shared/stats-card";

interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    archived: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Syllabuses"
        value={stats.total}
        icon={<BookOpen className="h-5 w-5" />}
        gradient
      />
      <StatsCard
        title="Active"
        value={stats.active}
        icon={<Activity className="h-5 w-5" />}
        description="Currently in progress"
        gradient
      />
      <StatsCard
        title="Archived"
        value={stats.archived}
        icon={<Archive className="h-5 w-5" />}
        gradient
      />
    </div>
  );
}