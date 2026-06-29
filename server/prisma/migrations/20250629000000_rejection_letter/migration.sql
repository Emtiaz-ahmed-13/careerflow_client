-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN "rejection_letter" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "rejected_at" TIMESTAMP(3);
