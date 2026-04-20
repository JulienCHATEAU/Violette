-- AlterTable
ALTER TABLE "PushMessage" ADD COLUMN "templateId" TEXT;

-- CreateIndex
CREATE INDEX "PushMessage_templateId_sentAt_idx" ON "PushMessage"("templateId", "sentAt");
