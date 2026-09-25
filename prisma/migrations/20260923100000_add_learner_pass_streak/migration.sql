ALTER TABLE "learner_pass_enrollments"
  ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0;

UPDATE "learner_pass_enrollments"
SET "streak" = 1
WHERE "last_claimed_at" IS NOT NULL;