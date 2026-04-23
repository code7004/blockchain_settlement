/*
  Warnings:

  - The values [DONE] on the enum `AssetsReclaimJobStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('DETECTED', 'PENDING', 'BROADCASTED', 'CONFIRMED', 'FAILED', 'SKIPPED');

-- AlterEnum
BEGIN;
CREATE TYPE "AssetsReclaimJobStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'FAILED');
ALTER TABLE "public"."AssetsReclaimJob" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AssetsReclaimJob" ALTER COLUMN "status" TYPE "AssetsReclaimJobStatus_new" USING ("status"::text::"AssetsReclaimJobStatus_new");
ALTER TYPE "AssetsReclaimJobStatus" RENAME TO "AssetsReclaimJobStatus_old";
ALTER TYPE "AssetsReclaimJobStatus_new" RENAME TO "AssetsReclaimJobStatus";
DROP TYPE "public"."AssetsReclaimJobStatus_old";
ALTER TABLE "AssetsReclaimJob" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SweepStatus" ADD VALUE 'PENDING';
ALTER TYPE "SweepStatus" ADD VALUE 'BROADCASTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WalletStatus" ADD VALUE 'LOCKED';
ALTER TYPE "WalletStatus" ADD VALUE 'PENDING';

-- AlterEnum
ALTER TYPE "WithdrawalStatus" ADD VALUE 'CONFIRMED';
