-- CreateTable
CREATE TABLE "exception_logs" (
    "id" UUID NOT NULL,
    "source" VARCHAR(80) NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "errorName" VARCHAR(120),
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "method" VARCHAR(10),
    "path" VARCHAR(500),
    "workerName" VARCHAR(80),
    "jobId" UUID,
    "depositId" UUID,
    "partnerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exception_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exception_logs_source_idx" ON "exception_logs"("source");

-- CreateIndex
CREATE INDEX "exception_logs_statusCode_idx" ON "exception_logs"("statusCode");

-- CreateIndex
CREATE INDEX "exception_logs_partnerId_idx" ON "exception_logs"("partnerId");

-- CreateIndex
CREATE INDEX "exception_logs_depositId_idx" ON "exception_logs"("depositId");

-- CreateIndex
CREATE INDEX "exception_logs_jobId_idx" ON "exception_logs"("jobId");

-- CreateIndex
CREATE INDEX "exception_logs_createdAt_idx" ON "exception_logs"("createdAt");
