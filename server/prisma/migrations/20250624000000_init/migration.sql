-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Applied', 'Assessment', 'Interview', 'FinalInterview', 'Offer', 'Rejected');
CREATE TYPE "InterviewType" AS ENUM ('Phone', 'Video', 'Onsite', 'Technical', 'HR', 'Other');
CREATE TYPE "InterviewOutcome" AS ENUM ('Pending', 'Passed', 'Failed', 'Cancelled');
CREATE TYPE "DocumentType" AS ENUM ('Resume', 'JobDescription', 'CoverLetter', 'Other');
CREATE TYPE "AnalysisType" AS ENUM ('Match', 'Review');
CREATE TYPE "QuestionCategory" AS ENUM ('HR', 'Technical', 'Behavioral');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "headline" TEXT,
    "phone" TEXT NOT NULL,
    "location" TEXT,
    "linkedin_url" TEXT NOT NULL,
    "github_url" TEXT NOT NULL,
    "avatar_url" TEXT,
    "avatar_file_id" TEXT,
    "refresh_token_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "job_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "job_url" TEXT,
    "salary" TEXT,
    "location" TEXT,
    "deadline" TIMESTAMP(3),
    "notes" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Applied',
    "job_description_text" TEXT,
    "kanban_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interviews" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "type" "InterviewType" NOT NULL DEFAULT 'Video',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,
    "interviewer_name" TEXT,
    "notes" TEXT,
    "outcome" "InterviewOutcome" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "extracted_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "title" TEXT NOT NULL,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resume_analyses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "application_id" UUID,
    "analysis_type" "AnalysisType" NOT NULL,
    "match_score" INTEGER,
    "ats_score" INTEGER,
    "strong_skills" JSONB NOT NULL DEFAULT '[]',
    "missing_skills" JSONB NOT NULL DEFAULT '[]',
    "weak_areas" JSONB NOT NULL DEFAULT '[]',
    "grammar_issues" JSONB NOT NULL DEFAULT '[]',
    "formatting_issues" JSONB NOT NULL DEFAULT '[]',
    "missing_keywords" JSONB NOT NULL DEFAULT '[]',
    "suggestions" JSONB NOT NULL DEFAULT '[]',
    "raw_ai_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cover_letters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "resume_document_id" UUID NOT NULL,
    "job_description_text" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cover_letters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interview_questions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "job_description_text" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "application_emails" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "company_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "job_description_text" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "application_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "job_applications_user_id_status_idx" ON "job_applications"("user_id", "status");
CREATE INDEX "job_applications_user_id_created_at_idx" ON "job_applications"("user_id", "created_at" DESC);
CREATE INDEX "interviews_application_id_scheduled_at_idx" ON "interviews"("application_id", "scheduled_at");
CREATE INDEX "documents_user_id_type_idx" ON "documents"("user_id", "type");
CREATE INDEX "reminders_user_id_remind_at_idx" ON "reminders"("user_id", "remind_at");
CREATE INDEX "resume_analyses_user_id_created_at_idx" ON "resume_analyses"("user_id", "created_at" DESC);
CREATE INDEX "cover_letters_user_id_created_at_idx" ON "cover_letters"("user_id", "created_at" DESC);
CREATE INDEX "interview_questions_user_id_created_at_idx" ON "interview_questions"("user_id", "created_at" DESC);
CREATE INDEX "application_emails_user_id_created_at_idx" ON "application_emails"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_resume_document_id_fkey" FOREIGN KEY ("resume_document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "application_emails" ADD CONSTRAINT "application_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_emails" ADD CONSTRAINT "application_emails_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
