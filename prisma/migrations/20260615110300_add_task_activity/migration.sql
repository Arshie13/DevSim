-- Add durable task activity log for dashboard activity and lifetime task stats.
-- Unlike completed_task, this table is append-only and survives level advancement.

-- CreateTable
CREATE TABLE "task_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_activity_user_id_completed_at_idx" ON "task_activity"("user_id", "completed_at");

-- AddForeignKey
ALTER TABLE "task_activity" ADD CONSTRAINT "task_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
