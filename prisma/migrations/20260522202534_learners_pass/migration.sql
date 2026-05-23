/*
  Warnings:

  - You are about to drop the column `slug` on the `season` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "season_slug_key";

-- AlterTable
ALTER TABLE "season" DROP COLUMN "slug";

-- CreateTable
CREATE TABLE "learner_pass_enrollment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "current_day" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_claimed_at" TIMESTAMP(3),
    "total_claimed_days" INTEGER NOT NULL DEFAULT 0,
    "payment_id" TEXT,
    "payment_provider" TEXT NOT NULL DEFAULT 'stripe',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_pass_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_pass_day_claim" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_pass_day_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_pass_reward" (
    "id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "coins_reward" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "unlock_project_ids" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_pass_reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_project_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_ref_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_project_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learner_pass_enrollment_user_id_idx" ON "learner_pass_enrollment"("user_id");

-- CreateIndex
CREATE INDEX "learner_pass_enrollment_status_idx" ON "learner_pass_enrollment"("status");

-- CreateIndex
CREATE INDEX "learner_pass_enrollment_expires_at_idx" ON "learner_pass_enrollment"("expires_at");

-- CreateIndex
CREATE INDEX "learner_pass_enrollment_payment_id_idx" ON "learner_pass_enrollment"("payment_id");

-- CreateIndex
CREATE INDEX "learner_pass_day_claim_user_id_claimed_at_idx" ON "learner_pass_day_claim"("user_id", "claimed_at");

-- CreateIndex
CREATE INDEX "learner_pass_day_claim_enrollment_id_idx" ON "learner_pass_day_claim"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "learner_pass_day_claim_enrollment_id_day_number_key" ON "learner_pass_day_claim"("enrollment_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "learner_pass_reward_day_number_key" ON "learner_pass_reward"("day_number");

-- CreateIndex
CREATE INDEX "user_project_access_user_id_idx" ON "user_project_access"("user_id");

-- CreateIndex
CREATE INDEX "user_project_access_project_id_idx" ON "user_project_access"("project_id");

-- CreateIndex
CREATE INDEX "user_project_access_source_idx" ON "user_project_access"("source");

-- CreateIndex
CREATE UNIQUE INDEX "user_project_access_user_id_project_id_source_key" ON "user_project_access"("user_id", "project_id", "source");

-- CreateIndex
CREATE INDEX "level_id_idx" ON "level"("id");

-- AddForeignKey
ALTER TABLE "learner_pass_enrollment" ADD CONSTRAINT "learner_pass_enrollment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_pass_day_claim" ADD CONSTRAINT "learner_pass_day_claim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_pass_day_claim" ADD CONSTRAINT "learner_pass_day_claim_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "learner_pass_enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
