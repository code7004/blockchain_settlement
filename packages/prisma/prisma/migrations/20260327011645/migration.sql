/*
  Warnings:

  - A unique constraint covering the columns `[txHash]` on the table `callback_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "callback_logs" ALTER COLUMN "txHash" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "callback_logs_txHash_key" ON "callback_logs"("txHash");
