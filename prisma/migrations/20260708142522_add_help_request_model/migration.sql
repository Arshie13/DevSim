/*
  Warnings:

  - You are about to drop the column `badges` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `borders` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `premium_pass_expires_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `xp_boost_expires_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `xp_boost_percent` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "badges",
DROP COLUMN "borders",
DROP COLUMN "premium_pass_expires_at",
DROP COLUMN "xp_boost_expires_at",
DROP COLUMN "xp_boost_percent";

-- CreateTable
CREATE TABLE "help_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "context" JSONB,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "help_requests_user_id_idx" ON "help_requests"("user_id");

-- CreateIndex
CREATE INDEX "help_requests_status_idx" ON "help_requests"("status");

-- AddForeignKey
ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
