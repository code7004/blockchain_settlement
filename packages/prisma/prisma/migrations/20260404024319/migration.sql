-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "lastRefillAt" TIMESTAMPTZ(3),
ADD COLUMN     "refillCount" INTEGER NOT NULL DEFAULT 0;
