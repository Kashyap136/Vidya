"use client";

import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortKey = "order" | "title" | "estimatedMinutes" | "difficulty";
export type FilterStatus = "all" | "completed" | "incomplete";
export type FilterPriority = "all" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FilterDifficulty = "all" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface TopicFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
  priority: FilterPriority;
  onPriorityChange: (value: FilterPriority) => void;
  difficulty: FilterDifficulty;
  onDifficultyChange: (value: FilterDifficulty) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  total: number;
  filtered: number;
}

export function TopicFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  difficulty,
  onDifficultyChange,
  sort,
  onSortChange,
  total,
  filtered,
}: TopicFiltersProps) {
  const hasFilters = search || status !== "all" || priority !== "all" || difficulty !== "all";

  return (
    <div className="space-y-3">
      {/* ⚡ Bolt Optimization: Use debounced SearchBar to prevent expensive TopicList re-renders and re-filtering on every keystroke */}
      <SearchBar
        placeholder="Search topics..."
        value={search}
        onChange={onSearchChange}
      />
      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={(v: string) => onStatusChange(v as FilterStatus)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={(v: string) => onPriorityChange(v as FilterPriority)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficulty} onValueChange={(v: string) => onDifficultyChange(v as FilterDifficulty)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v: string) => onSortChange(v as SortKey)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">AI Order</SelectItem>
            <SelectItem value="title">Alphabetical</SelectItem>
            <SelectItem value="estimatedMinutes">Hours</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onStatusChange("all");
              onPriorityChange("all");
              onDifficultyChange("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered} of {total} topics
      </p>
    </div>
  );
}
