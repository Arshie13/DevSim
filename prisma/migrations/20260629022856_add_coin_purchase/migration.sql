-- CreateTable
CREATE TABLE "coin_purchase" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "coin_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coin_purchase_payment_id_key" ON "coin_purchase"("payment_id");

-- CreateIndex
CREATE INDEX "coin_purchase_user_id_idx" ON "coin_purchase"("user_id");

-- AddForeignKey
ALTER TABLE "coin_purchase" ADD CONSTRAINT "coin_purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
