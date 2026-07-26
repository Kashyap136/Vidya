"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

interface SyllabusCardProps {
  syllabus: Record<string, unknown>;
  onRename: (syllabus: Record<string, unknown>) => void;
  onArchive: (syllabus: Record<string, unknown>) => void;
  onDelete: (syllabus: Record<string, unknown>) => void;
  onRestore: (syllabus: Record<string, unknown>) => void;
  isArchived?: boolean;
}

export function SyllabusCard({ syllabus, onRename, onArchive, onDelete, onRestore, isArchived }: SyllabusCardProps) {
  const id = syllabus.id as string;
  const title = (syllabus.title as string) || "Untitled";
  const status = syllabus.processingStatus as string;
  const createdAt = syllabus.createdAt as string;
  const updatedAt = syllabus.updatedAt as string;
  const pageCount = syllabus.pageCount as number | null;
  const createdDate = createdAt ? new Date(createdAt).toLocaleDateString() : "";
  const updatedDate = updatedAt ? new Date(updatedAt).toLocaleDateString() : "";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/dashboard/syllabi/${id}`} className="hover:underline">
            <CardTitle className="text-base">{title}</CardTitle>
          </Link>
        </div>
        <CardDescription className="text-xs">
          Created {createdDate} {updatedDate ? `· Updated ${updatedDate}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="flex flex-wrap gap-2">
          {status && <StatusBadge status={status} />}
          {pageCount != null && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {pageCount} {pageCount === 1 ? "page" : "pages"}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={`/dashboard/syllabi/${id}`}>
          <Button variant="outline" size="sm">Open</Button>
        </Link>
        {isArchived ? (
          <Button variant="ghost" size="sm" onClick={() => onRestore(syllabus)}>Restore</Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => onRename(syllabus)}>Rename</Button>
            <Button variant="ghost" size="sm" onClick={() => onArchive(syllabus)}>Archive</Button>
          </>
        )}
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(syllabus)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
