-- AlterTable
ALTER TABLE "user" ADD COLUMN     "aiHelpCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xpBoostActiveUntil" TIMESTAMP(3);
