-- CreateEnum
CREATE TYPE "ExceptionLogStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- AlterTable
ALTER TABLE "exception_logs" ADD COLUMN     "status" "ExceptionLogStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "assignedTo" UUID,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "exception_logs_status_idx" ON "exception_logs"("status");

-- CreateIndex
CREATE INDEX "exception_logs_assignedTo_idx" ON "exception_logs"("assignedTo");

-- CreateIndex
CREATE INDEX "exception_logs_isDeleted_idx" ON "exception_logs"("isDeleted");
