"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth/password-reset";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      const timeout = setTimeout(() => router.push("/auth/login"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [state, router]);

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <GraduationCap className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid reset link</CardTitle>
            <CardDescription>This password reset link is missing or invalid. Please request a new one.</CardDescription>
          </div>
          <div className="flex justify-center">
            <Link href="/auth/forgot-password">
              <Button variant="outline">Request New Link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <CardTitle className="text-xl">Password reset successful</CardTitle>
            <CardDescription>You will be redirected to the sign in page shortly.</CardDescription>
          </div>
          <div className="flex justify-center">
            <Link href="/auth/login">
              <Button variant="outline">Sign In Now</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </div>
        <Card>
          <form action={formAction}>
            <input type="hidden" name="token" value={token} />
            <CardContent className="space-y-4 pt-6">
              {state?.success === false && state.error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />
                  {state.error.message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput id="password" name="password" required />
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with a letter and a number
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Resetting..." : "Reset Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}