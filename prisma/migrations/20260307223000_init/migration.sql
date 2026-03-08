-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PurchaseSource" AS ENUM ('EMAIL_RECEIPT', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'RETURN_EXPIRED', 'WARRANTY_EXPIRED', 'CLAIM_GENERATED');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('RETURN_REFUND', 'WARRANTY_REPAIR', 'WARRANTY_REPLACEMENT');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'READY', 'SENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "subject" TEXT NOT NULL,
    "fromEmail" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "rawSnippet" TEXT,
    "extractionStatus" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailMessageId" TEXT,
    "merchantName" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "purchaseSource" "PurchaseSource" NOT NULL,
    "extractedConfidence" DOUBLE PRECISION NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "warrantyMonths" INTEGER,
    "returnWindowDays" INTEGER,
    "returnDeadline" TIMESTAMP(3),
    "warrantyDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "EmailMessage_userId_receivedAt_idx" ON "EmailMessage"("userId", "receivedAt");

-- CreateIndex
CREATE INDEX "Purchase_userId_orderDate_idx" ON "Purchase"("userId", "orderDate");

-- CreateIndex
CREATE INDEX "Purchase_merchantName_idx" ON "Purchase"("merchantName");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_returnDeadline_idx" ON "PurchaseItem"("returnDeadline");

-- CreateIndex
CREATE INDEX "PurchaseItem_warrantyDeadline_idx" ON "PurchaseItem"("warrantyDeadline");

-- CreateIndex
CREATE INDEX "GeneratedClaim_userId_purchaseId_idx" ON "GeneratedClaim"("userId", "purchaseId");

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "EmailMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedClaim" ADD CONSTRAINT "GeneratedClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedClaim" ADD CONSTRAINT "GeneratedClaim_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

