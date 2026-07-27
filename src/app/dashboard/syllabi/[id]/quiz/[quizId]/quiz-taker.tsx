"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { QuizQuestion } from "@/components/quiz/quiz-question";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { recordQuizAttemptAction, getQuizQuestionsAction } from "@/actions";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface QuizTakerProps {
  quizId: string;
  syllabusId: string;
  quizTitle: string;
  questionCount: number;
  timeEstimate: number | null;
  latestAttempt: {
    score: number;
    totalQuestions: number;
    completedAt: string;
    answers: Array<{ questionId: string; selectedOptionIndex: number; isCorrect: boolean }> | null;
    timeTaken: number | null;
  } | null;
  attemptsCount: number;
}

interface QuestionData {
  id: string;
  questionText: string;
  options: { text: string }[];
  difficulty: string;
  estimatedSeconds: number;
}

interface QuestionWithAnswer extends QuestionData {
  options: { text: string; isCorrect?: boolean }[];
  explanation: string | null;
  topicId: string | null;
  topicTitle: string | null;
}

type Phase = "start" | "taking" | "reviewing" | "results";

export function QuizTaker({
  quizId,
  syllabusId,
  quizTitle,
  questionCount,
  timeEstimate,
  latestAttempt,
  attemptsCount,
}: QuizTakerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(latestAttempt ? "results" : "start");
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [_score, setScore] = useState(latestAttempt?.score ?? 0);
  const [submittedAnswers, setSubmittedAnswers] = useState<Array<{
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }> | null>(latestAttempt?.answers ?? null);

  const fetchQuestions = useCallback(async () => {
    const includeAnswers = !!latestAttempt;
    const result = await getQuizQuestionsAction(quizId, includeAnswers);
    if (result.success && result.data) {
      const qs = result.data as unknown as QuestionWithAnswer[];
      setQuestions(qs);
      if (latestAttempt) {
        const restored = qs.map((q) => {
          const prev = (latestAttempt.answers ?? []).find((a) => a.questionId === q.id);
          return prev ? prev.selectedOptionIndex : null;
        });
        setAnswers(restored);
      } else {
        setAnswers(new Array(qs.length).fill(null));
      }
    }
  }, [quizId, latestAttempt]);

  useEffect(() => {
    startTransition(() => {
      fetchQuestions().catch((err) => {
        console.error("Failed to fetch questions:", err);
      });
    });
  }, [fetchQuestions]);

  useEffect(() => {
    if (phase === "taking" && startTime) {
      const timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, startTime]);

  function handleStart() {
    if (questions.length === 0) return;
    setPhase("taking");
    setStartTime(Date.now());
  }

  function handleSelectOption(index: number) {
    if (phase !== "taking") return;
    const updated = [...answers];
    updated[currentIndex] = index;
    setAnswers(updated);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  async function handleSubmit() {
    setShowConfirm(false);
    setIsSubmitting(true);

    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;

    const rawAnswers = questions.map((q, i) => ({
      questionId: q.id,
      selectedOptionIndex: answers[i] ?? -1,
    }));

    const result = await recordQuizAttemptAction({
      quizId,
      totalQuestions: questions.length,
      answers: rawAnswers,
      timeTaken,
    } as Record<string, unknown>);

    if (result.success) {
      const attemptAnswers = (result.data?.answers as Array<{
        questionId: string;
        selectedOptionIndex: number;
        isCorrect: boolean;
      }>) ?? [];
      const attemptScore = attemptAnswers.filter((a) => a.isCorrect).length;

      const questionsWithAnswers = await getQuizQuestionsAction(quizId, true);
      if (questionsWithAnswers.success && questionsWithAnswers.data) {
        setQuestions(questionsWithAnswers.data as unknown as QuestionWithAnswer[]);
      }

      setScore(attemptScore);
      setSubmittedAnswers(attemptAnswers);
      setPhase("results");
      router.refresh();
    }

    setIsSubmitting(false);
  }

  function handleGoToList() {
    router.push(`/dashboard/syllabi/${syllabusId}/quiz`);
  }

  async function handleRetake() {
    setPhase("start");
    setCurrentIndex(0);
    setStartTime(null);
    setElapsed(0);
    setShowConfirm(false);
    setSubmittedAnswers(null);
    setAnswers([]);
    await fetchQuestions();
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  function getIncorrectQuestions(): QuestionWithAnswer[] {
    if (!submittedAnswers) return [];
    return questions.filter((q) => {
      const answer = submittedAnswers.find((a) => a.questionId === q.id);
      return answer && !answer.isCorrect;
    });
  }

  function getTopicBreakdown(): { name: string; correct: number; total: number }[] {
    if (!submittedAnswers) return [];
    const map = new Map<string, { correct: number; total: number }>();
    questions.forEach((q) => {
      const topicName = q.topicTitle || q.topicId || "General";
      const entry = map.get(topicName) || { correct: 0, total: 0 };
      entry.total++;
      const answer = submittedAnswers.find((a) => a.questionId === q.id);
      if (answer?.isCorrect) entry.correct++;
      map.set(topicName, entry);
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      correct: data.correct,
      total: data.total,
    }));
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ─── Start Screen ─────────────────────────────────────────────
  if (phase === "start") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{quizTitle}</h1>
          <p className="text-sm text-muted-foreground">Test your knowledge</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="text-xl font-bold">{questionCount}</p>
              </div>
              {timeEstimate && (
                <div>
                  <p className="text-muted-foreground">Est. Time</p>
                  <p className="text-xl font-bold">{timeEstimate} min</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Attempts</p>
                <p className="text-xl font-bold">{attemptsCount}</p>
              </div>
              {latestAttempt && (
                <div>
                  <p className="text-muted-foreground">Best Score</p>
                  <p className="text-xl font-bold">
                    {latestAttempt.score}/{latestAttempt.totalQuestions}
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Each question has four options with exactly one correct answer.
              You can navigate between questions freely. Submit only when ready.
            </p>

            <div className="flex gap-3">
              <Button onClick={handleStart} size="lg">
                {attemptsCount > 0 ? "Retake Quiz" : "Start Quiz"}
              </Button>
              <Button variant="outline" onClick={handleGoToList} size="lg">
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Taking Screen ────────────────────────────────────────────
  if (phase === "taking" && questions.length > 0) {
    const q = questions[currentIndex];

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {formatTime(elapsed)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-secondary mb-6">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${((answeredCount) / questions.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-6">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 w-6 rounded-full transition-colors ${
                    i === currentIndex
                      ? "bg-primary"
                      : answers[i] !== null
                        ? "bg-primary/40"
                        : "bg-secondary"
                  }`}
                  aria-label={`Go to question ${i + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <QuizQuestion
              question={q}
              selectedOption={answers[currentIndex]}
              onSelectOption={handleSelectOption}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-2">
            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNext} disabled={answers[currentIndex] === null}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <>
                {!showConfirm ? (
                  <Button
                    onClick={() => setShowConfirm(true)}
                    disabled={!allAnswered}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Confirm Submit"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showConfirm && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <CardContent className="pt-4">
              <p className="text-sm">
                You have answered {answeredCount} of {questions.length} questions.
                {!allAnswered && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {" "}{questions.length - answeredCount} questions are unanswered.
                  </span>
                )}
                {" "}Are you sure you want to submit?
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── Results Screen ───────────────────────────────────────────
  if (phase === "results" && submittedAnswers) {
    const total = questions.length;
    const correct = submittedAnswers.filter((a) => a.isCorrect).length;
    const incorrect = submittedAnswers.filter((a) => !a.isCorrect && a.selectedOptionIndex >= 0).length;
    const skipped = submittedAnswers.filter((a) => a.selectedOptionIndex < 0).length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const topicBreakdown = getTopicBreakdown();
    const incorrectQuestions = getIncorrectQuestions();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{quizTitle}</h1>
          <p className="text-sm text-muted-foreground">Quiz Results</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold">{percentage}%</p>
              <p className="text-muted-foreground mt-1">
                {correct}/{total} correct
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="font-medium text-green-600 dark:text-green-400">{correct}</p>
                <p className="text-muted-foreground">Correct</p>
              </div>
              <div>
                <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="font-medium text-red-600 dark:text-red-400">{incorrect}</p>
                <p className="text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <HelpCircle className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="font-medium">{skipped}</p>
                <p className="text-muted-foreground">Skipped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {latestAttempt?.timeTaken != null && (
          <Card>
            <CardContent className="pt-4 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time taken:</span>
              <span className="font-medium">{formatTime(latestAttempt.timeTaken)}</span>
            </CardContent>
          </Card>
        )}

        {topicBreakdown.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Topic Breakdown
              </h3>
              <div className="space-y-2">
                {topicBreakdown.map((t) => (
                  <div key={t.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {t.name === "General" ? "General" : t.name}
                    </span>
                    <span className="font-medium">
                      {t.correct}/{t.total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {incorrectQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Review Incorrect Answers
            </h3>
            {incorrectQuestions.map((q) => {
              const answer = submittedAnswers.find((a) => a.questionId === q.id);
              const correctIndex = (q.options as Array<{ text: string; isCorrect?: boolean }>).findIndex(
                (o) => o.isCorrect,
              );

              return (
                <Card key={q.id} className="border-red-200 dark:border-red-900">
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-sm font-medium">{q.questionText}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Your answer: {answer && answer.selectedOptionIndex >= 0
                        ? q.options[answer.selectedOptionIndex]?.text
                        : "Skipped"}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Correct answer: {q.options[correctIndex]?.text}
                    </p>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleRetake}>Retake Quiz</Button>
          <Button variant="outline" onClick={handleGoToList}>
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // ─── Loading State ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="h-48 rounded bg-muted animate-pulse" />
    </div>
  );
}
