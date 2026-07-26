import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, BarChart3 } from "lucide-react";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    questionCount: number;
    timeEstimate: number | null;
    _count: { questions: number; attempts: number };
  };
  syllabusId: string;
  latestAttempt: {
    score: number;
    totalQuestions: number;
    completedAt: string;
  } | null;
}

export function QuizCard({ quiz, syllabusId, latestAttempt }: QuizCardProps) {
  const percent = latestAttempt
    ? Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{quiz.title}</CardTitle>
          {percent != null && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                percent >= 70
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : percent >= 40
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {percent}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            {quiz._count?.questions || quiz.questionCount} questions
          </span>
          {quiz.timeEstimate && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {quiz.timeEstimate} min
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {quiz._count?.attempts || 0} attempts
          </span>
        </div>

        {latestAttempt && (
          <p className="text-xs text-muted-foreground">
            Last attempt: {new Date(latestAttempt.completedAt).toLocaleDateString()} —{" "}
            {latestAttempt.score}/{latestAttempt.totalQuestions} correct
          </p>
        )}

        <Link href={`/dashboard/syllabi/${syllabusId}/quiz/${quiz.id}`}>
          <Button className="w-full" size="sm">
            {percent != null ? "Retake Quiz" : "Start Quiz"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
