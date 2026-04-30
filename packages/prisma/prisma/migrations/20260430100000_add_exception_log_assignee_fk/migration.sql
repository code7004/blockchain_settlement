ALTER TABLE "exception_logs"
ADD CONSTRAINT "exception_logs_assigneeMemberId_fkey"
FOREIGN KEY ("assigneeMemberId") REFERENCES "Member"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
