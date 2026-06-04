/*
  Warnings:

  - You are about to drop the column `xpBoostActiveUntil` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "xpBoostActiveUntil",
ADD COLUMN     "xpBoostExpiresAt" TIMESTAMP(3),
ADD COLUMN     "xpBoostPercent" INTEGER NOT NULL DEFAULT 0;
