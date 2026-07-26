import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FilePlus, Sparkles, BookOpen, Brain } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "syllabus" | "quiz" | "plan";
  children?: React.ReactNode;
}

const variantIcons: Record<string, React.ReactNode> = {
  syllabus: <FilePlus className="h-10 w-10" />,
  quiz: <Brain className="h-10 w-10" />,
  plan: <BookOpen className="h-10 w-10" />,
};

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, className, variant = "default", children }: EmptyStateProps) {
  const displayIcon = icon ?? variantIcons[variant] ?? <Sparkles className="h-10 w-10" />;

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {displayIcon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {(actionLabel && actionHref) || (actionLabel && onAction) ? (
        actionHref ? (
          <Link href={actionHref} className="mt-6">
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button className="mt-6" onClick={onAction}>{actionLabel}</Button>
        )
      ) : null}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}