/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `learner_pass_enrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "learner_pass_enrollment_payment_id_key" ON "learner_pass_enrollment"("payment_id");
