// Auth
export { registerAction } from "./auth/signup";
export { loginAction } from "./auth/login";
export { requestResetAction, resetPasswordAction } from "./auth/password-reset";

// User
export { getProfileAction, updateProfileAction, deleteAccountAction } from "./user/profile";

// Syllabus
export {
  getSyllabusAction,
  listSyllabusesAction,
  createSyllabusAction,
  renameSyllabusAction,
  archiveSyllabusAction,
  restoreSyllabusAction,
  deleteSyllabusAction,
  uploadPdfAction,
  replacePdfAction,
  deletePdfAction,
  getDownloadUrlAction,
  processSyllabusAction,
  retryProcessingAction,
  saveSyllabusTextAction,
  getDashboardDataAction,
} from "./syllabus/syllabus";

// Topic
export {
  listTopicsAction,
  createTopicAction,
  updateTopicAction,
  reorderTopicsAction,
  deleteTopicAction,
  toggleTopicCompletionAction,
  getTopicProgressAction,
} from "./topic/topic";

// Quiz Attempt
export {
  recordQuizAttemptAction,
  listQuizAttemptsAction,
  getQuizStatsAction,
} from "./quiz-attempt/quiz-attempt";

// Quiz
export {
  generateQuizAction,
  listQuizzesAction,
  getQuizWithAttemptsAction,
  getQuizQuestionsAction,
  getTopicPerformanceAction,
} from "./quiz";

// Study Plan
export {
  generatePlanAction,
  regeneratePlanAction,
  getPlanAction,
  toggleTaskAction,
  getTodayPlanAction,
  getPlanStatsAction,
} from "./study-plan/study-plan";
