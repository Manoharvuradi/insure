/*
  Warnings:

  - The values [INTRESTED,NOT_INTRESTED] on the enum `ContactStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContactStatus_new" AS ENUM ('OPEN', 'INTERESTED', 'NOT_INTERESTED', 'CALL_SCHEDULED', 'EXPIRED');
ALTER TABLE "Contacts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Contacts" ALTER COLUMN "status" TYPE "ContactStatus_new" USING ("status"::text::"ContactStatus_new");
ALTER TYPE "ContactStatus" RENAME TO "ContactStatus_old";
ALTER TYPE "ContactStatus_new" RENAME TO "ContactStatus";
DROP TYPE "ContactStatus_old";
ALTER TABLE "Contacts" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "Contacts" ADD COLUMN     "isArchived" BOOLEAN DEFAULT false;
