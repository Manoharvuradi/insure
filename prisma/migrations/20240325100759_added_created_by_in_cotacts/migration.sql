/*
  Warnings:

  - You are about to drop the column `credentialsUserId` on the `Contacts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contacts" DROP CONSTRAINT "Contacts_credentialsUserId_fkey";

-- AlterTable
ALTER TABLE "Contacts" DROP COLUMN "credentialsUserId",
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
