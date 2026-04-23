-- AlterTable
ALTER TABLE "AssetsReclaimJob" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "SweepLog" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "reason" TEXT;
