"use client";

import { useActionState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { renameSyllabusAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface RenameSyllabusDialogProps {
  open: boolean;
  onClose: () => void;
  syllabus: Record<string, unknown> | null;
}

export function RenameSyllabusDialog({ open, onClose, syllabus }: RenameSyllabusDialogProps) {
  const router = useRouter();
  const formId = useId();

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      if (!syllabus) return { success: false, error: { code: "ERROR", message: "No syllabus selected" } };
      const result = await renameSyllabusAction(syllabus.id as string, {
        title: formData.get("title") as string,
      });
      return result;
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
      router.refresh();
    }
  }, [state, router, onClose]);

  if (!open || !syllabus) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-syllabus-title"
    >
      <Card
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle id="rename-syllabus-title">Rename Syllabus</CardTitle>
          <CardDescription>Enter a new title for this syllabus</CardDescription>
        </CardHeader>
        <form action={formAction} key={formId}>
          <CardContent className="space-y-4">
            {state?.success === false && state.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.error.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rename-title">Title</Label>
              <Input
                id="rename-title"
                name="title"
                defaultValue={syllabus.title as string}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Renaming..." : "Rename"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
