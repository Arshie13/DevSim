/*
  Warnings:

  - You are about to drop the column `hasCompletedTutorial` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `has_completed_onboarding` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "daily_login" ADD COLUMN     "claimedDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "currentDay" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lastClaimedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" DROP COLUMN "hasCompletedTutorial",
DROP COLUMN "has_completed_onboarding",
ADD COLUMN     "has_completed_tutorial" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "assessment_topic_score" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "pre_score" INTEGER,
    "post_score" INTEGER,
    "improvement" INTEGER,
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_topic_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_topic_score_user_id_idx" ON "assessment_topic_score"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_topic_score_user_id_topic_key" ON "assessment_topic_score"("user_id", "topic");

-- AddForeignKey
ALTER TABLE "assessment_topic_score" ADD CONSTRAINT "assessment_topic_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
