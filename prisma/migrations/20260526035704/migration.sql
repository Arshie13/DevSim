-- DropIndex
DROP INDEX "learner_pass_day_claim_enrollment_id_day_number_key";

-- AlterTable
ALTER TABLE "learner_pass_day_claim" ALTER COLUMN "claim_type" DROP NOT NULL;
