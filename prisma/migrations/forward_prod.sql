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

-- CreateTable
CREATE TABLE "RetailDeviceClaimBlock" (
    "id" SERIAL NOT NULL,
    "claimId" TEXT,
    "claimCreatedDate" TIMESTAMP(3),
    "incidentDate" TIMESTAMP(3),
    "claimType" "DeviceClaimType",
    "cause" TEXT,
    "policeCaseNumber" TEXT,
    "reportingPoliceStation" TEXT,
    "referenceNumber" TEXT,
    "incidentDescription" TEXT,
    "address" TEXT,
    "suburb" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "RetailDeviceClaimBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailCreditLifeDeviceClaimBlock" (
    "id" SERIAL NOT NULL,
    "claimId" TEXT,
    "claimCreatedDate" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "timeOfDeath" TEXT,
    "placeOfDeath" TEXT,
    "creditLifeClaimType" "FuneralClaimType",
    "cause" TEXT,
    "policeCaseNumber" TEXT,
    "reportingPoliceStation" TEXT,
    "referenceNumber" TEXT,
    "incidentDescription" TEXT,
    "suburb" TEXT,
    "province" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "RetailCreditLifeDeviceClaimBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RetailDeviceClaimBlock" ADD CONSTRAINT "RetailDeviceClaimBlock_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailDeviceClaimBlock" ADD CONSTRAINT "RetailDeviceClaimBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailDeviceClaimBlock" ADD CONSTRAINT "RetailDeviceClaimBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailCreditLifeDeviceClaimBlock" ADD CONSTRAINT "RetailCreditLifeDeviceClaimBlock_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailCreditLifeDeviceClaimBlock" ADD CONSTRAINT "RetailCreditLifeDeviceClaimBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailCreditLifeDeviceClaimBlock" ADD CONSTRAINT "RetailCreditLifeDeviceClaimBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

