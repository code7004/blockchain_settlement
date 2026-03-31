/*
  Warnings:

  - Made the column `txHash` on table `callback_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "callback_logs" ALTER COLUMN "txHash" SET NOT NULL;
