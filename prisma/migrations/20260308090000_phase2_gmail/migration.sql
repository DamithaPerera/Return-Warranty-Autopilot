-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('GMAIL');

-- CreateEnum
CREATE TYPE "EmailClassification" AS ENUM ('RECEIPT', 'WARRANTY', 'SHIPPING', 'OTHER');

-- CreateTable
CREATE TABLE "EmailAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "EmailProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scopes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAccount_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN "gmailMessageId" TEXT;
ALTER TABLE "EmailMessage" ADD COLUMN "threadId" TEXT;
ALTER TABLE "EmailMessage" ADD COLUMN "snippet" TEXT;
ALTER TABLE "EmailMessage" ADD COLUMN "rawText" TEXT;
ALTER TABLE "EmailMessage" ADD COLUMN "htmlBody" TEXT;
ALTER TABLE "EmailMessage" ADD COLUMN "classification" "EmailClassification" NOT NULL DEFAULT 'OTHER';

-- Backfill existing rows for new required columns
UPDATE "EmailMessage"
SET "gmailMessageId" = COALESCE("gmailMessageId", "id"),
    "threadId" = COALESCE("threadId", "id"),
    "snippet" = COALESCE("snippet", "rawSnippet")
WHERE "gmailMessageId" IS NULL OR "threadId" IS NULL;

-- Enforce required columns
ALTER TABLE "EmailMessage" ALTER COLUMN "gmailMessageId" SET NOT NULL;
ALTER TABLE "EmailMessage" ALTER COLUMN "threadId" SET NOT NULL;

-- Drop legacy columns
ALTER TABLE "EmailMessage" DROP COLUMN "providerMessageId";
ALTER TABLE "EmailMessage" DROP COLUMN "rawSnippet";

-- CreateIndex
CREATE UNIQUE INDEX "EmailAccount_provider_providerAccountId_key" ON "EmailAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "EmailAccount_userId_provider_idx" ON "EmailAccount"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_gmailMessageId_key" ON "EmailMessage"("gmailMessageId");

-- AddForeignKey
ALTER TABLE "EmailAccount" ADD CONSTRAINT "EmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
