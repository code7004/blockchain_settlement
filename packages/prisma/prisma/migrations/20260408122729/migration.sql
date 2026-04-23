/*
  Warnings:

  - Added the required column `updatedAt` to the `SweepLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SweepLog" ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3);
