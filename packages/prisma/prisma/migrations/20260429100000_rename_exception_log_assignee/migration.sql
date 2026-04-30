ALTER TABLE "exception_logs" RENAME COLUMN "assignedTo" TO "assigneeMemberId";

ALTER INDEX "exception_logs_assignedTo_idx" RENAME TO "exception_logs_assigneeMemberId_idx";
