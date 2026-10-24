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
    let completed = 0;
    let totalHours = 0;
    let completedHours = 0;

    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      const hours = Math.ceil((t.estimatedMinutes || 0) / 60);
      totalHours += hours;

      if (t.completedAt != null) {
        completed++;
        completedHours += hours;
      }
    }

    return { total: topics.length, completed, totalHours, completedHours };
  }, [topics]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    // Bolt Optimization: Filter array in a single pass instead of chaining filter calls
    const result = topics.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !(t.summary?.toLowerCase().includes(q))) {
        return false;
      }

      if (status === "completed" && t.completedAt == null) return false;
      if (status === "incomplete" && t.completedAt != null) return false;

      if (priority !== "all" && t.priority !== priority) return false;
      if (difficulty !== "all" && t.difficulty !== difficulty) return false;

      return true;
    });

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
