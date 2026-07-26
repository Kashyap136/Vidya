// Repositories
export { UserRepository, userRepository } from "./user";
export { AccountRepository, accountRepository } from "./account";
export { SessionRepository, sessionRepository } from "./session";
export { PasswordResetRepository, passwordResetRepository } from "./password-reset";
export { VerificationTokenRepository, verificationTokenRepository } from "./verification-token";
export { SyllabusRepository, syllabusRepository } from "./syllabus";
export { TopicRepository, topicRepository } from "./topic";
export { QuizAttemptRepository, quizAttemptRepository } from "./quiz-attempt";

// Legacy helper functions (backward compat with auth code)
export {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  softDeleteUser,
} from "./user";
export {
  findAccountByProvider,
  findAccountsByUserId,
  linkAccount,
} from "./account";
export {
  findSessionByToken,
  findActiveSessions,
  removeExpiredSessions,
  removeUserSessions,
} from "./session";
export {
  findPasswordResetByToken,
  createPasswordResetToken,
  markResetTokenAsUsed,
} from "./password-reset";
export {
  findVerificationByToken,
  createVerificationToken,
} from "./verification-token";
export {
  findSyllabiByUserId,
  findSyllabusWithTopics,
  createSyllabus,
  updateSyllabus,
  softDeleteSyllabus,
} from "./syllabus";
export {
  findTopicsBySyllabus,
  findTopicsByPriority,
  createTopic,
  updateTopic,
  softDeleteTopic,
  reorderTopics,
} from "./topic";
export {
  findQuizAttemptsByUserId,
  findQuizAttemptsByQuiz,
  createQuizAttempt,
  getQuizScoreStats,
} from "./quiz-attempt";

// Shared utilities
export { BaseRepository } from "./base";
export { transaction } from "./transaction";
export * from "./types";
export * from "./errors";
