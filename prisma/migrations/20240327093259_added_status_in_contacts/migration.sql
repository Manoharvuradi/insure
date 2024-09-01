-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('OPEN', 'INTRESTED', 'NOT_INTRESTED', 'CALL_SCHEDULED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Contacts" ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'OPEN';
