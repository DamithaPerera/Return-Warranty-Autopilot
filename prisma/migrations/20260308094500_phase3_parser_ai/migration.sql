-- Convert EmailMessage.classification from enum to text for flexible parser labels.
ALTER TABLE "EmailMessage"
  ALTER COLUMN "classification" TYPE TEXT
  USING LOWER("classification"::text);

ALTER TABLE "EmailMessage"
  ALTER COLUMN "classification" SET DEFAULT 'other';

-- Drop old enum no longer used by Prisma schema.
DROP TYPE IF EXISTS "EmailClassification";
