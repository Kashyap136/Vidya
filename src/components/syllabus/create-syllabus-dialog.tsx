"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSyllabusAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface CreateSyllabusDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSyllabusDialog({ open, onClose }: CreateSyllabusDialogProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createSyllabusAction({
        title: formData.get("title"),
      });
      return result;
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard/syllabi");
      router.refresh();
    }
  }, [state, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-syllabus-title"
    >
      <Card
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle id="create-syllabus-title">New Syllabus</CardTitle>
          <CardDescription>Enter a title for your syllabus</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.success === false && state.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.error.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g. Data Structures" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
