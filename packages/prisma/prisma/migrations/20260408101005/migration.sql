/*
  Warnings:

  - Added the required column `partnerId` to the `SweepLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SweepLog" ADD COLUMN     "partnerId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "SweepLog_partnerId_idx" ON "SweepLog"("partnerId");

-- AddForeignKey
ALTER TABLE "SweepLog" ADD CONSTRAINT "SweepLog_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
