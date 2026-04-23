/*
  Warnings:

  - Added the required column `status` to the `SweepJob` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SweepJobStatus" AS ENUM ('PENDING', 'PROCESSING');

-- AlterTable
ALTER TABLE "SweepJob" ADD COLUMN     "status" "SweepJobStatus" NOT NULL;
