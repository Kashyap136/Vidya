-- AlterTable
ALTER TABLE "Syllabus" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "uploadedAt" TIMESTAMP(3);
