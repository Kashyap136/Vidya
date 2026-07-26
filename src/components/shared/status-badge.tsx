import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  UPLOADED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  EXTRACTING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  EXTRACTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  GENERATING_TOPICS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  TOPICS_CREATED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  GENERATING_PLAN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  PLAN_CREATED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  GENERATING_QUIZ: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  QUIZ_CREATED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  UPLOADED: "Uploaded",
  EXTRACTING: "Extracting",
  EXTRACTED: "Extracted",
  GENERATING_TOPICS: "Generating Topics",
  TOPICS_CREATED: "Topics Created",
  GENERATING_PLAN: "Generating Plan",
  PLAN_CREATED: "Plan Created",
  GENERATING_QUIZ: "Generating Quiz",
  QUIZ_CREATED: "Quiz Created",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        className,
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
