-- AlterEnum
ALTER TYPE "eventCategory" ADD VALUE 'LEAD';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "eventName" ADD VALUE 'LEAD_UNATTENDED';
ALTER TYPE "eventName" ADD VALUE 'LEAD_ACCEPTED';
ALTER TYPE "eventName" ADD VALUE 'LEAD_REFUSED';
ALTER TYPE "eventName" ADD VALUE 'APPLICATION_UNATTENDED';

-- AlterTable
ALTER TABLE "CredentialsUser" DROP COLUMN "best";

