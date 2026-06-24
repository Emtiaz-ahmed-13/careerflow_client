-- CreateEnum
CREATE TYPE "ResumeTrack" AS ENUM ('Backend', 'Frontend', 'SoftwareEngineer');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN "resume_track" "ResumeTrack";

-- CreateIndex
CREATE UNIQUE INDEX "documents_user_id_resume_track_key" ON "documents"("user_id", "resume_track");
