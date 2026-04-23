/*
  Warnings:

  - The values [LACKOFRESOURCE] on the enum `SweepStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SweepStatus_new" AS ENUM ('PENDING', 'BROADCASTED', 'SUCCESS', 'FAILED', 'SKIPPED');
ALTER TABLE "SweepLog" ALTER COLUMN "status" TYPE "SweepStatus_new" USING ("status"::text::"SweepStatus_new");
ALTER TYPE "SweepStatus" RENAME TO "SweepStatus_old";
ALTER TYPE "SweepStatus_new" RENAME TO "SweepStatus";
DROP TYPE "public"."SweepStatus_old";
COMMIT;
