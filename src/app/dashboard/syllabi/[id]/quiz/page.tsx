import { notFound } from "next/navigation";
import Link from "next/link";
import { getSyllabusAction, listQuizzesAction } from "@/actions";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/quiz-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft } from "lucide-react";
import { GenerateQuizButton } from "./generate-quiz-button";

export default async function QuizListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [syllabusResult, quizzesResult] = await Promise.all([
    getSyllabusAction(id),
    listQuizzesAction(id),
  ]);

  if (!syllabusResult.success) {
    if (syllabusResult.error.code === "NOT_FOUND") { notFound(); }
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Syllabuses", href: "/dashboard/syllabi" }, { label: "Quizzes" }]} />
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
          {syllabusResult.error.message}
        </div>
        <Link href="/dashboard/syllabi"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Syllabuses</Button></Link>
      </div>
    );
  }

  const syllabus = syllabusResult.data;
  const quizzes = quizzesResult.success ? (quizzesResult.data as Record<string, unknown>[]) : [];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Syllabuses", href: "/dashboard/syllabi" }, { label: (syllabus.title as string) || "Syllabus", href: `/dashboard/syllabi/${id}` }, { label: "Quizzes" }]} />

      <PageHeader title="Quizzes" description={`Test your knowledge of ${(syllabus.title as string) || "this syllabus"}`}>
        <div className="flex gap-2">
          <GenerateQuizButton syllabusId={id} />
          <Link href={`/dashboard/syllabi/${id}`}><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Syllabus</Button></Link>
        </div>
      </PageHeader>

      {quizzes.length === 0 ? (
        <EmptyState
          variant="quiz"
          title="No quizzes available"
          description="Generate a quiz from your syllabus topics to test your knowledge."
        >
          <GenerateQuizButton syllabusId={id} />
        </EmptyState>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id as string}
              quiz={{
                id: quiz.id as string,
                title: quiz.title as string,
                questionCount: (quiz._count as Record<string, unknown>)?.questions as number || quiz.questionCount as number,
                timeEstimate: quiz.timeEstimate as number | null,
                _count: (quiz._count as { questions: number; attempts: number }) || { questions: 0, attempts: 0 },
              }}
              syllabusId={id}
              latestAttempt={null}
            />
          ))}
        </div>
      )}
    </div>
  );
}