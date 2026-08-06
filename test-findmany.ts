import { quizAttemptRepository } from "./src/repositories/quiz-attempt";

async function test() {
  const attempts = await quizAttemptRepository.findMany({
    quizId: { in: ['123', '456'] }
  });
  console.log(attempts);
}
test();
