"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestResetAction } from "@/actions/auth/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestResetAction, null);

  if (state?.success) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
              <Mail className="h-7 w-7 text-success" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription className="max-w-xs mx-auto">
              If an account with that email exists, we&apos;ve sent a password reset link.
            </CardDescription>
          </div>
          <div className="flex justify-center">
            <Link href="/auth/login">
              <Button variant="outline">Back to Sign In</Button>
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
          <CardTitle className="text-xl">Forgot password?</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
        </div>
        <Card>
          <form action={formAction}>
            <CardContent className="space-y-4 pt-6">
              {state?.success === false && state.error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />
                  {state.error.message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending..." : "Send Reset Link"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Back to Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}