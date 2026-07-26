import { z } from "zod/v4";

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  questionText: z.string().min(10, "Question text must be at least 10 characters"),
  topicTitle: z.string().min(1, "Topic title is required"),
  options: z
    .array(optionSchema)
    .length(4, "Each question must have exactly 4 options")
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      "Each question must have exactly one correct option",
    ),
  explanation: z.string().min(10, "Explanation must be at least 10 characters"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedSeconds: z.number().int().min(15).max(300),
});

export const quizResponseSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  timeEstimate: z.number().int().min(5).max(60).optional(),
  questions: z
    .array(questionSchema)
    .min(3, "Quiz must have at least 3 questions")
    .max(20, "Quiz cannot have more than 20 questions")
    .refine(
      (qs) => {
        const texts = qs.map((q) => q.questionText.toLowerCase());
        return new Set(texts).size === texts.length;
      },
      "Duplicate question text detected",
    ),
});

export type ValidatedQuizResponse = z.infer<typeof quizResponseSchema>;
export type ValidatedQuestion = z.infer<typeof questionSchema>;
