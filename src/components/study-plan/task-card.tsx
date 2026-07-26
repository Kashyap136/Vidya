"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { toggleTaskAction } from "@/actions";

interface TaskCardProps {
  task: {
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
  };
  onToggle: () => void;
  readOnly?: boolean;
}

export function TaskCard({ task, onToggle, readOnly = false }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (readOnly) return;
    startTransition(async () => {
      const result = await toggleTaskAction(task.id);
      if (result.success) {
        onToggle();
      }
    });
  }

  const hours = Math.ceil(task.minutes / 60);
  const topicTitle = task.topic?.title || "Untitled Topic";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border p-3 transition-colors",
        task.isComplete && "opacity-60",
        !readOnly && "hover:bg-accent/50",
      )}
    >
      {!readOnly ? (
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="shrink-0"
          aria-label={task.isComplete ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      ) : (
        <div className="shrink-0">
          {task.isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            task.isComplete && "line-through text-muted-foreground",
          )}
        >
          {topicTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.topic && (
            <>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {task.topic.difficulty}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {task.topic.priority}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Clock className="h-3 w-3" />
        {hours > 0 ? `${hours}h` : `${task.minutes}m`}
      </div>
    </div>
  );
}
