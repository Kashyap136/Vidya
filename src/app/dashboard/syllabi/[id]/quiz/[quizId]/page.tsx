import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuizWithAttemptsAction } from "@/actions";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Button } from "@/components/ui/button";
import { QuizTaker } from "./quiz-taker";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id: syllabusId, quizId } = await params;
  const result = await getQuizWithAttemptsAction(quizId);

  if (!result.success) {
    if (result.error.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Syllabuses", href: "/dashboard/syllabi" },
            { label: "Quiz" },
          ]}
        />
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {result.error.message}
        </div>
        <Link href={`/dashboard/syllabi/${syllabusId}/quiz`}>
          <Button variant="outline">Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  const { quiz, attempts, latestAttempt } = result.data;

  if (!quiz) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Syllabuses", href: "/dashboard/syllabi" },
            { label: "Quiz" },
          ]}
        />
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Quiz not found.
        </div>
        <Link href={`/dashboard/syllabi/${syllabusId}/quiz`}>
          <Button variant="outline">Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  const quizTitle = (quiz.title as string) || "Quiz";
  const questionCount = (quiz.questionCount as number) || ((quiz._count as Record<string, unknown> | undefined)?.questions as number) || 0;
  const timeEstimate = quiz.timeEstimate as number | null;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Syllabuses", href: "/dashboard/syllabi" },
          { label: quizTitle },
        ]}
      />

      <QuizTaker
        quizId={quizId}
        syllabusId={syllabusId}
        quizTitle={quizTitle}
        questionCount={questionCount}
        timeEstimate={timeEstimate}
        latestAttempt={latestAttempt ? {
          score: latestAttempt.score as number,
          totalQuestions: latestAttempt.totalQuestions as number,
          completedAt: latestAttempt.completedAt as string,
          answers: latestAttempt.answers as Array<{ questionId: string; selectedOptionIndex: number; isCorrect: boolean }> | null,
          timeTaken: latestAttempt.timeTaken as number | null,
        } : null}
        attemptsCount={attempts.length}
      />
    </div>
  );
}
