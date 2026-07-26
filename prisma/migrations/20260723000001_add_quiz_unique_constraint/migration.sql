-- Change Quiz.syllabusId from indexed to unique to prevent duplicate quizzes per syllabus
-- DropIndex
DROP INDEX IF EXISTS "Quiz_syllabusId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_syllabusId_key" ON "Quiz"("syllabusId");
