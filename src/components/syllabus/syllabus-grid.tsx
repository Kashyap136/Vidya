"use client";

import { SyllabusCard } from "./syllabus-card";

interface SyllabusGridProps {
  syllabuses: Record<string, unknown>[];
  onRename: (syllabus: Record<string, unknown>) => void;
  onArchive: (syllabus: Record<string, unknown>) => void;
  onDelete: (syllabus: Record<string, unknown>) => void;
  onRestore: (syllabus: Record<string, unknown>) => void;
  showArchived?: boolean;
}

export function SyllabusGrid({ syllabuses, onRename, onArchive, onDelete, onRestore, showArchived }: SyllabusGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {syllabuses.map((syllabus) => (
        <SyllabusCard
          key={syllabus.id as string}
          syllabus={syllabus}
          onRename={onRename}
          onArchive={onArchive}
          onDelete={onDelete}
          onRestore={onRestore}
          isArchived={showArchived}
        />
      ))}
    </div>
  );
}
