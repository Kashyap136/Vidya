import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Authentication Error" };

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Authentication Error</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            Something went wrong while signing in. Please try again.
          </CardDescription>
        </div>
        <div className="flex justify-center gap-3">
          <Link href="/auth/login">
            <Button variant="outline">Try Again</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Create Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}