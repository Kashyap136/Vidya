import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { verificationService } from "@/services";
import { CheckCircle2, XCircle, Mail } from "lucide-react";

export const metadata = { title: "Verify Email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (token) {
    const email = await verificationService.verifyEmail(token);
    if (email) {
      return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-xl">Email verified</CardTitle>
              <CardDescription className="max-w-xs mx-auto">
                Your email has been verified successfully. You can now sign in.
              </CardDescription>
            </div>
            <Link href="/auth/login">
              <Button>Go to Sign In</Button>
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid or expired link</CardTitle>
            <CardDescription className="max-w-xs mx-auto">
              This verification link is invalid or has expired. Please try signing in to request a new one.
            </CardDescription>
          </div>
          <Link href="/auth/login">
            <Button variant="outline">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          </CardDescription>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try signing in&mdash;you may be able to request a new verification link.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}