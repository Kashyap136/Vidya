"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { generatePlanAction } from "@/actions";
import { CalendarDays, Clock } from "lucide-react";

interface PlanGeneratorProps {
  syllabusId: string;
  topics: Array<{
    id: string;
    title: string;
    summary: string | null;
    priority: string;
    difficulty: string;
    estimatedMinutes: number;
    completedAt: string | null;
  }>;
}

export function PlanGenerator({ syllabusId, topics }: PlanGeneratorProps) {
  const router = useRouter();
  const [dailyMinutes, setDailyMinutes] = useState(120);
  const [targetDate, setTargetDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const incompleteTopics = topics.filter((t) => !t.completedAt);
  const totalMinutes = incompleteTopics.reduce((s, t) => s + t.estimatedMinutes, 0);
  const estDays = dailyMinutes > 0 ? Math.ceil(totalMinutes / dailyMinutes) : 0;

  async function handleGenerate() {
    if (!targetDate) {
      setError("Please select a target completion date");
      return;
    }

    setError("");
    setIsGenerating(true);

    const result = await generatePlanAction({
      syllabusId,
      dailyMinutes,
      targetDate,
    } as Record<string, unknown>);

    setIsGenerating(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error?.message || "Failed to generate plan");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Your Study Plan</CardTitle>
        <CardDescription>
          Set your preferences and generate a personalized study schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {incompleteTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium">All topics completed!</p>
            <p className="text-sm text-muted-foreground">No study plan needed.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium">Syllabus Overview</p>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Topics</p>
                  <p className="font-semibold">{incompleteTopics.length} remaining</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Time</p>
                  <p className="font-semibold">{Math.ceil(totalMinutes / 60)} hours</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Days</p>
                  <p className="font-semibold">~{estDays} days</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dailyMinutes">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Study Time Per Day
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="dailyMinutes"
                    type="number"
                    min={15}
                    max={480}
                    step={15}
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(parseInt(e.target.value) || 120)}
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  How much time can you study each day? (15 min to 8 hours)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">
                  <CalendarDays className="h-4 w-4 inline mr-1" />
                  Target Completion Date
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                />
                <p className="text-xs text-muted-foreground">
                  When do you want to finish studying? Plan will include ~20% buffer days.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !targetDate}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Study Plan"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
