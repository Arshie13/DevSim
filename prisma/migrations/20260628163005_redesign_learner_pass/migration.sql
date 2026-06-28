/*
  Warnings:

  - You are about to drop the column `current_day` on the `learner_pass_enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `coins_reward` on the `learner_pass_reward` table. All the data in the column will be lost.
  - You are about to drop the column `unlock_project_ids` on the `learner_pass_reward` table. All the data in the column will be lost.
  - You are about to drop the column `xp_reward` on the `learner_pass_reward` table. All the data in the column will be lost.
  - You are about to drop the `learner_pass_day_claim` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "learner_pass_day_claim" DROP CONSTRAINT "learner_pass_day_claim_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "learner_pass_day_claim" DROP CONSTRAINT "learner_pass_day_claim_user_id_fkey";

-- AlterTable
ALTER TABLE "app_setting" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "learner_pass_enrollment" DROP COLUMN "current_day",
ADD COLUMN     "claimed_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "learner_pass_reward" DROP COLUMN "coins_reward",
DROP COLUMN "unlock_project_ids",
DROP COLUMN "xp_reward",
ADD COLUMN     "rewards" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "learner_pass_day_claim";

-- DropEnum
DROP TYPE "PassType";

-- DropEnum
DROP TYPE "RewardType";
