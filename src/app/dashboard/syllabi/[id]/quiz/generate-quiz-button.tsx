"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateQuizAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function GenerateQuizButton({ syllabusId }: { syllabusId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    try {
      const result = await generateQuizAction(syllabusId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("Failed to generate quiz");
    }
    setPending(false);
  }

  return (
    <div>
      <Button
        size="sm"
        className="gap-2"
        onClick={handleGenerate}
        disabled={pending}
      >
        <Plus className="h-4 w-4" />
        {pending ? "Generating..." : "Generate Quiz"}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
