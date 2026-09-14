/*
  Warnings:

  - You are about to drop the column `coin_reward` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `xp_reward` on the `achievements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "achievements" DROP COLUMN "coin_reward",
DROP COLUMN "xp_reward";
