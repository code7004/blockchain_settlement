/*
  Warnings:

  - You are about to drop the column `reclaim` on the `Wallet` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetsReclaimJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "reclaim";

-- CreateTable
CREATE TABLE "AssetsReclaimJob" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "status" "AssetsReclaimJobStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AssetsReclaimJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetsReclaimJob_status_idx" ON "AssetsReclaimJob"("status");

-- AddForeignKey
ALTER TABLE "AssetsReclaimJob" ADD CONSTRAINT "AssetsReclaimJob_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
