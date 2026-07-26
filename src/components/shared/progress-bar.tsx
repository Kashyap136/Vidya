import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-500", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
