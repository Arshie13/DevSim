-- AlterTable
ALTER TABLE "learner_pass_enrollment" ADD COLUMN "unlock_choices" JSONB NOT NULL DEFAULT '[]';
