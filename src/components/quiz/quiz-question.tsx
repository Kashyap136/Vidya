"use client";

import { cn } from "@/lib/utils";

interface QuestionData {
  id: string;
  questionText: string;
  options: { text: string }[];
  difficulty: string;
  estimatedSeconds: number;
}

interface QuizQuestionProps {
  question: QuestionData;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  showResult?: boolean;
  correctOption?: number | null;
}

export function QuizQuestion({
  question,
  selectedOption,
  onSelectOption,
  showResult = false,
  correctOption,
}: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              question.difficulty === "BEGINNER"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : question.difficulty === "INTERMEDIATE"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            )}
          >
            {question.difficulty}
          </span>
          {question.estimatedSeconds > 0 && (
            <span className="text-xs text-muted-foreground">
              ~{question.estimatedSeconds}s
            </span>
          )}
        </div>
        <p className="text-base font-medium">{question.questionText}</p>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = showResult && correctOption === index;
          const isWrong = showResult && isSelected && correctOption !== index;

          return (
            <button
              key={index}
              onClick={() => !showResult && onSelectOption(index)}
              disabled={showResult}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                "w-full text-left rounded-md border p-3 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !showResult && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                isSelected && !showResult && "border-primary bg-primary/5",
                isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                isWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                showResult && "cursor-default",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                    isSelected && !showResult && "border-primary bg-primary text-primary-foreground",
                    isCorrect && "border-green-500 bg-green-500 text-white",
                    isWrong && "border-red-500 bg-red-500 text-white",
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="pt-0.5">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
