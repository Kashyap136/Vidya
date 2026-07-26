"use client";

import { TopicCard } from "./topic-card";

interface Topic {
  id: string;
  title: string;
  summary: string | null;
  priority: string;
  difficulty: string;
  estimatedMinutes: number;
  completedAt: string | null;
  order: number;
}

interface TopicListProps {
  topics: Topic[];
  onToggle: () => void;
}

export function TopicList({ topics, onToggle }: TopicListProps) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">No topics found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} onToggle={onToggle} />
      ))}
    </div>
  );
}
