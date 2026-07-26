import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: string; positive: boolean };
  gradient?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, description, trend, gradient, className }: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", gradient && "bg-gradient-to-br from-primary/5 via-primary/5 to-transparent", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
                {trend.value}
              </p>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}