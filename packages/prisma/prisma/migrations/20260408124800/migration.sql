/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `SweepLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssetsReclaimJob" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "finishedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "SweepJob" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "SweepLog" DROP COLUMN "updatedAt";
