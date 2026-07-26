"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listSyllabusesAction, archiveSyllabusAction, restoreSyllabusAction, deleteSyllabusAction } from "@/actions";
import { SyllabusGrid } from "@/components/syllabus/syllabus-grid";
import { SyllabusFilters } from "@/components/syllabus/syllabus-filters";
import { CreateSyllabusDialog } from "@/components/syllabus/create-syllabus-dialog";
import { RenameSyllabusDialog } from "@/components/syllabus/rename-syllabus-dialog";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ListSkeleton } from "@/components/shared/loading-skeleton";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import type { ActionResponse } from "@/types";

type PageState = "loading" | "loaded" | "error";
type DialogType = "create" | "rename" | "archive" | "delete" | null;

export default function SyllabiPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [syllabuses, setSyllabuses] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [dialog, setDialog] = useState<DialogType>(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSyllabuses = useCallback(async (opts?: { status?: string; sort?: string; cursor?: string }) => {
    setPageState("loading");
    setError("");

    try {
      const params: Record<string, unknown> = {
        includeArchived: (opts?.status ?? statusFilter) === "archived",
        sort: opts?.sort ?? sortFilter,
      };
      if (opts?.cursor) params.cursor = opts.cursor;

      const result = await listSyllabusesAction(params) as ActionResponse<{
        items: Record<string, unknown>[];
        pageMeta: { hasNextPage: boolean; nextCursor?: string };
      }>;

      if (!result.success) {
        setError(result.error.message);
        setPageState("error");
        return;
      }

      const data = result.data as unknown as {
        items: Record<string, unknown>[];
        pageMeta: { hasNextPage: boolean; nextCursor?: string };
      };

      setSyllabuses(data.items);
      setPageState("loaded");
    } catch {
      setError("Failed to load syllabuses");
      setPageState("error");
    }
  }, [statusFilter, sortFilter]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchSyllabuses({ status: value });
  };

  const handleSortChange = (value: string) => {
    setSortFilter(value);
    fetchSyllabuses({ sort: value });
  };

  const handleRename = (syllabus: Record<string, unknown>) => {
    setSelectedSyllabus(syllabus);
    setDialog("rename");
  };

  const handleArchive = async (syllabus: Record<string, unknown>) => {
    setSelectedSyllabus(syllabus);
    setDialog("archive");
  };

  const handleDelete = (syllabus: Record<string, unknown>) => {
    setSelectedSyllabus(syllabus);
    setDialog("delete");
  };

  const handleRestore = async (syllabus: Record<string, unknown>) => {
    const syllabusId = syllabus?.id;
    if (!syllabusId) return;
    setActionLoading(true);
    try {
      await restoreSyllabusAction(syllabusId as string);
      router.refresh();
      fetchSyllabuses();
    } catch {
      setError("Failed to restore syllabus");
    }
    setActionLoading(false);
  };

  const confirmArchive = async () => {
    const syllabusId = selectedSyllabus?.id;
    if (!syllabusId) return;
    setActionLoading(true);
    try {
      await archiveSyllabusAction(syllabusId as string);
      setDialog(null);
      router.refresh();
      fetchSyllabuses();
    } catch {
      setError("Failed to archive syllabus");
    }
    setActionLoading(false);
  };

  const confirmDelete = async () => {
    const syllabusId = selectedSyllabus?.id;
    if (!syllabusId) return;
    setActionLoading(true);
    try {
      await deleteSyllabusAction(syllabusId as string);
      setDialog(null);
      router.refresh();
      fetchSyllabuses();
    } catch {
      setError("Failed to delete syllabus");
    }
    setActionLoading(false);
  };

  const filteredSyllabuses = syllabuses.filter((s) => {
    if (!searchQuery) return true;
    const title = (s.title as string || "").toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  if (pageState === "error" && syllabuses.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Syllabuses" }]} />
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error || "Could not load syllabuses"}
        </div>
        <Button variant="outline" onClick={() => fetchSyllabuses()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Syllabuses" }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-sm">
          <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search syllabuses..." />
        </div>
        <Button onClick={() => setDialog("create")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New Syllabus
        </Button>
      </div>

      <SyllabusFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusChange}
        sortFilter={sortFilter}
        onSortFilterChange={handleSortChange}
      />

      {pageState === "loading" && syllabuses.length === 0 ? (
        <ListSkeleton count={6} />
      ) : filteredSyllabuses.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching syllabuses" : "No syllabuses yet"}
          description={
            searchQuery
              ? "Try a different search term"
              : statusFilter === "archived"
                ? "No archived syllabuses"
                : "Create your first syllabus to get started."
          }
          actionLabel={!searchQuery && statusFilter !== "archived" ? "Create Syllabus" : undefined}
          actionHref={!searchQuery && statusFilter !== "archived" ? "/dashboard/syllabi/new" : undefined}
        />
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <SyllabusGrid
            syllabuses={filteredSyllabuses}
            onRename={handleRename}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onRestore={handleRestore}
            showArchived={statusFilter === "archived"}
          />
        </>
      )}

      <CreateSyllabusDialog open={dialog === "create"} onClose={() => setDialog(null)} />
      <RenameSyllabusDialog open={dialog === "rename"} onClose={() => setDialog(null)} syllabus={selectedSyllabus} />
      <ConfirmDialog
        open={dialog === "archive"}
        onClose={() => setDialog(null)}
        onConfirm={confirmArchive}
        title="Archive Syllabus"
        description="Are you sure you want to archive this syllabus? You can restore it later."
        confirmLabel="Archive"
        variant="default"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={confirmDelete}
        title="Delete Syllabus"
        description="Are you sure you want to permanently delete this syllabus? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={actionLoading}
      />
    </div>
  );
}
