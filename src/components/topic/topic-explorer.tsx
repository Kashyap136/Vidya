"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicProgressSummary } from "./topic-progress-summary";
import { TopicFilters, type SortKey, type FilterStatus, type FilterPriority, type FilterDifficulty } from "./topic-filters";
import { TopicList } from "./topic-list";
import { useRouter } from "next/navigation";

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

interface TopicExplorerProps {
  topics: Topic[];
}

const DIFFICULTY_RANK: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
};

export function TopicExplorer({ topics }: TopicExplorerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [priority, setPriority] = useState<FilterPriority>("all");
  const [difficulty, setDifficulty] = useState<FilterDifficulty>("all");
  const [sort, setSort] = useState<SortKey>("order");

  const stats = useMemo(() => {
    const total = topics.length;
    const completed = topics.filter((t) => t.completedAt != null).length;
    const totalHours = topics.reduce(
      (sum, t) => sum + Math.ceil((t.estimatedMinutes || 0) / 60),
      0,
    );
    const completedHours = topics
      .filter((t) => t.completedAt != null)
      .reduce((sum, t) => sum + Math.ceil((t.estimatedMinutes || 0) / 60), 0);
    return { total, completed, totalHours, completedHours };
  }, [topics]);

  const filtered = useMemo(() => {
    let result = [...topics];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.summary?.toLowerCase().includes(q)),
      );
    }

    if (status === "completed") {
      result = result.filter((t) => t.completedAt != null);
    } else if (status === "incomplete") {
      result = result.filter((t) => t.completedAt == null);
    }

    if (priority !== "all") {
      result = result.filter((t) => t.priority === priority);
    }

    if (difficulty !== "all") {
      result = result.filter((t) => t.difficulty === difficulty);
    }

    result.sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.localeCompare(b.title);
        case "estimatedMinutes":
          return b.estimatedMinutes - a.estimatedMinutes;
        case "difficulty":
          return (DIFFICULTY_RANK[a.difficulty] || 0) - (DIFFICULTY_RANK[b.difficulty] || 0);
        case "order":
        default:
          return a.order - b.order;
      }
    });

    return result;
  }, [topics, search, status, priority, difficulty, sort]);

  const handleToggle = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <TopicProgressSummary
        total={stats.total}
        completed={stats.completed}
        totalHours={stats.totalHours}
        completedHours={stats.completedHours}
      />

      <TopicFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        sort={sort}
        onSortChange={setSort}
        total={topics.length}
        filtered={filtered.length}
      />

      <TopicList topics={filtered} onToggle={handleToggle} />
    </div>
  );
}
