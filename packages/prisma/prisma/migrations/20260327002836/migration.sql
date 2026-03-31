-- AlterTable
ALTER TABLE "callback_logs" ADD COLUMN     "txHash" VARCHAR(128);

-- CreateIndex
CREATE INDEX "callback_logs_txHash_idx" ON "callback_logs"("txHash");
