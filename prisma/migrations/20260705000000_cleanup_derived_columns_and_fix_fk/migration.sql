-- Remove ghost/derivable columns and fix polymorphic FK
-- Step 1: Drop derived columns
ALTER TABLE "users" DROP COLUMN IF EXISTS "level";

ALTER TABLE "assessment_topic_scores" DROP COLUMN IF EXISTS "improvement";

ALTER TABLE "learner_pass_enrollments" DROP COLUMN IF EXISTS "total_claimed_days";

-- Step 2: Refactor polymorphic source_ref_id into proper FK columns
ALTER TABLE "user_project_access" DROP COLUMN IF EXISTS "source_ref_id";
ALTER TABLE "user_project_access" ADD COLUMN IF NOT EXISTS "learner_pass_enrollment_id" TEXT;
ALTER TABLE "user_project_access" ADD COLUMN IF NOT EXISTS "coin_purchase_id" TEXT;

-- Step 3: Add indexes for new FK columns
CREATE INDEX IF NOT EXISTS "user_project_access_learner_pass_enrollment_id_idx" ON "user_project_access"("learner_pass_enrollment_id");
CREATE INDEX IF NOT EXISTS "user_project_access_coin_purchase_id_idx" ON "user_project_access"("coin_purchase_id");

-- Step 4: Add FK constraints
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_project_access_learner_pass_enrollment_id_fkey'
  ) THEN
    ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_learner_pass_enrollment_id_fkey"
      FOREIGN KEY ("learner_pass_enrollment_id") REFERENCES "learner_pass_enrollments"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_project_access_coin_purchase_id_fkey'
  ) THEN
    ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_coin_purchase_id_fkey"
      FOREIGN KEY ("coin_purchase_id") REFERENCES "coin_purchases"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
