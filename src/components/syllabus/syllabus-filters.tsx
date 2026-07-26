"use client";

import { cn } from "@/lib/utils";

interface SyllabusFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortFilter: string;
  onSortFilterChange: (value: string) => void;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "A-Z" },
];

export function SyllabusFilters({ statusFilter, onStatusFilterChange, sortFilter, onSortFilterChange }: SyllabusFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-md border" role="group" aria-label="Status filter">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusFilterChange(opt.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md",
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={statusFilter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground">Sort:</label>
        <select
          id="sort-select"
          value={sortFilter}
          onChange={(e) => onSortFilterChange(e.target.value)}
          className="rounded-md border bg-background px-2 py-1.5 text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
