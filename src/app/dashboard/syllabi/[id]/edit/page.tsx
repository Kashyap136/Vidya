"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSyllabusAction, renameSyllabusAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ListSkeleton } from "@/components/shared/loading-skeleton";

export default function EditSyllabusPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const [syllabus, setSyllabus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!id) {
      setFetchError("Invalid syllabus ID");
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      const result = await getSyllabusAction(id);
      if (result.success) {
        setSyllabus(result.data);
      } else {
        setFetchError(result.error.message);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await renameSyllabusAction(id, {
        title: formData.get("title") as string,
      });
      return result;
    },
    null,
  );

  useEffect(() => {
    if (state?.success && id) {
      router.push(`/dashboard/syllabi/${id}`);
      router.refresh();
    }
  }, [state, router, id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Syllabuses", href: "/dashboard/syllabi" },
          { label: "Edit" },
        ]} />
        <ListSkeleton count={1} />
      </div>
    );
  }

  if (fetchError || !syllabus) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Syllabuses", href: "/dashboard/syllabi" },
          { label: "Edit" },
        ]} />
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {fetchError || "Syllabus not found"}
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/syllabi")}>
          Back to Syllabuses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Syllabuses", href: "/dashboard/syllabi" },
        { label: syllabus.title as string, href: `/dashboard/syllabi/${id}` },
        { label: "Edit" },
      ]} />

      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Rename Syllabus</CardTitle>
            <CardDescription>Change the title of this syllabus</CardDescription>
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
                <Input
                  id="title"
                  name="title"
                  defaultValue={syllabus.title as string}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
