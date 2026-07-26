import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-primary">404</h1>
          <h2 className="text-xl font-semibold">Page not found</h2>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="gap-2"><Home className="h-4 w-4" /> Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}