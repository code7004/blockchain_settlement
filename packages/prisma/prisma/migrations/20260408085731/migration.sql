-- CreateEnum
CREATE TYPE "SweepStatus" AS ENUM ('SUCCESS', 'FAILED', 'LACKOFRESOURCE', 'SKIPPED');

-- CreateTable
CREATE TABLE "SweepJob" (
    "id" UUID NOT NULL,
    "depositId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SweepJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SweepLog" (
    "id" UUID NOT NULL,
    "depositId" UUID NOT NULL,
    "txHash" TEXT,
    "amount" DECIMAL(30,6),
    "feeAmount" DECIMAL(30,6),
    "feeSymbol" VARCHAR(20),
    "status" "SweepStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SweepLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SweepJob_depositId_key" ON "SweepJob"("depositId");

-- CreateIndex
CREATE INDEX "SweepJob_createdAt_idx" ON "SweepJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SweepLog_txHash_key" ON "SweepLog"("txHash");

-- CreateIndex
CREATE INDEX "SweepLog_depositId_idx" ON "SweepLog"("depositId");

-- CreateIndex
CREATE INDEX "SweepLog_status_idx" ON "SweepLog"("status");

-- AddForeignKey
ALTER TABLE "SweepJob" ADD CONSTRAINT "SweepJob_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SweepLog" ADD CONSTRAINT "SweepLog_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
