export default function DashboardLoadingPage() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-2xl bg-muted animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
      </div>
      <div className="h-12 rounded-lg bg-muted animate-pulse" />
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    </div>
  );
}
