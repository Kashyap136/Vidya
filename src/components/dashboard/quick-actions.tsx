import { FilePlus, List, Sparkles } from "lucide-react";
import { QuickActionCard } from "@/components/shared/quick-action-card";

export function QuickActions() {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickActionCard
          title="New Syllabus"
          description="Upload a PDF to get started"
          icon={<FilePlus className="h-5 w-5" />}
          href="/dashboard/syllabi/new"
          variant="primary"
        />
        <QuickActionCard
          title="View Syllabuses"
          description="Browse all your syllabuses"
          icon={<List className="h-5 w-5" />}
          href="/dashboard/syllabi"
        />
        <QuickActionCard
          title="Continue Learning"
          description="Pick up where you left off"
          icon={<Sparkles className="h-5 w-5" />}
          href="/dashboard"
        />
      </div>
    </div>
  );
}