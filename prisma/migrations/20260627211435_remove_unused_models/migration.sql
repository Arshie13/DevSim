/*
  Warnings:

  - You are about to drop the `pass_reward_track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pass_xp_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reward_claim_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `season` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_premium_pass` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_reward_claim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_season_progression` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pass_reward_track" DROP CONSTRAINT "pass_reward_track_season_id_fkey";

-- DropForeignKey
ALTER TABLE "pass_xp_log" DROP CONSTRAINT "pass_xp_log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reward_claim_log" DROP CONSTRAINT "reward_claim_log_reward_id_fkey";

-- DropForeignKey
ALTER TABLE "reward_claim_log" DROP CONSTRAINT "reward_claim_log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_premium_pass" DROP CONSTRAINT "user_premium_pass_season_id_fkey";

-- DropForeignKey
ALTER TABLE "user_premium_pass" DROP CONSTRAINT "user_premium_pass_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_reward_claim" DROP CONSTRAINT "user_reward_claim_reward_id_fkey";

-- DropForeignKey
ALTER TABLE "user_reward_claim" DROP CONSTRAINT "user_reward_claim_season_id_fkey";

-- DropForeignKey
ALTER TABLE "user_reward_claim" DROP CONSTRAINT "user_reward_claim_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_season_progression" DROP CONSTRAINT "user_season_progression_season_id_fkey";

-- DropForeignKey
ALTER TABLE "user_season_progression" DROP CONSTRAINT "user_season_progression_user_id_fkey";

-- DropTable
DROP TABLE "pass_reward_track";

-- DropTable
DROP TABLE "pass_xp_log";

-- DropTable
DROP TABLE "reward_claim_log";

-- DropTable
DROP TABLE "season";

-- DropTable
DROP TABLE "user_premium_pass";

-- DropTable
DROP TABLE "user_reward_claim";

-- DropTable
DROP TABLE "user_season_progression";
