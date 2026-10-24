"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, ArrowUpDown, Loader2 } from "lucide-react";
import { toggleTopicCompletionAction } from "@/actions";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    summary: string | null;
    priority: string;
    difficulty: string;
    estimatedMinutes: number;
    completedAt: string | null;
    order: number;
  };
  onToggle: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function TopicCard({ topic, onToggle }: TopicCardProps) {
  const [isPending, startTransition] = useTransition();
  const completed = topic.completedAt != null;
  const hours = Math.ceil(topic.estimatedMinutes / 60);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleTopicCompletionAction(topic.id);
      if (result.success) {
        onToggle();
      }
    });
  }

  return (
    <Card
      className={cn(
        "transition-colors",
        completed && "opacity-70",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={cn("text-base", completed && "line-through text-muted-foreground")}>
            {topic.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={handleToggle}
            disabled={isPending}
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
        {topic.summary && (
          <CardDescription className="line-clamp-2 text-sm">
            {topic.summary}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
              priorityColors[topic.priority] || "bg-gray-100 text-gray-700",
            )}
          >
            {topic.priority}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
              difficultyColors[topic.difficulty] || "bg-gray-100 text-gray-700",
            )}
          >
            {topic.difficulty}
          </span>
          {hours > 0 && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {hours}h
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ArrowUpDown className="h-3 w-3" />
            #{topic.order + 1}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
