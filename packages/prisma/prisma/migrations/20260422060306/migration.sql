-- AlterTable
ALTER TABLE "AssetsReclaimJob" ADD COLUMN     "writer" VARCHAR(50);

-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "writer" VARCHAR(50);

-- AlterTable
ALTER TABLE "SweepJob" ADD COLUMN     "writer" VARCHAR(50);

-- AlterTable
ALTER TABLE "SweepLog" ADD COLUMN     "writer" VARCHAR(50);

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "writer" VARCHAR(50);

-- AlterTable
ALTER TABLE "callback_logs" ADD COLUMN     "writer" VARCHAR(50);
