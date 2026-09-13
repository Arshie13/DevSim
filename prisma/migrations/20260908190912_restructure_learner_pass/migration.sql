/*
  Warnings:

  - You are about to drop the column `claimed_days` on the `daily_logins` table. All the data in the column will be lost.
  - You are about to drop the column `current_day` on the `daily_logins` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `daily_logins` table. All the data in the column will be lost.
  - You are about to drop the column `content_hash` on the `file_changes` table. All the data in the column will be lost.
  - You are about to drop the column `streak` on the `learner_pass_enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "daily_logins" DROP COLUMN "claimed_days",
DROP COLUMN "current_day",
DROP COLUMN "date";

-- AlterTable
ALTER TABLE "file_changes" DROP COLUMN "content_hash";

-- AlterTable
ALTER TABLE "learner_pass_enrollments" DROP COLUMN "streak";

-- CreateTable
CREATE TABLE "daily_login_claims" (
    "id" TEXT NOT NULL,
    "daily_login_id" TEXT NOT NULL,
    "day_index" INTEGER NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_login_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_login_claims_daily_login_id_idx" ON "daily_login_claims"("daily_login_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_login_claims_daily_login_id_day_index_key" ON "daily_login_claims"("daily_login_id", "day_index");

-- AddForeignKey
ALTER TABLE "daily_login_claims" ADD CONSTRAINT "daily_login_claims_daily_login_id_fkey" FOREIGN KEY ("daily_login_id") REFERENCES "daily_logins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
