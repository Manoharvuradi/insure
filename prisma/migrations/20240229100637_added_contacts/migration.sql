-- CreateTable
CREATE TABLE "Contacts" (
    "id" SERIAL NOT NULL,
    "phone" TEXT,
    "planType" TEXT,
    "productCode" TEXT,
    "order" TEXT,
    "model" TEXT,
    "typeOfDevice" TEXT,
    "imei" TEXT,
    "masterDealer" TEXT,
    "dealerRegion" TEXT,
    "distribution" TEXT,
    "dateOfPurchase" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "banNumber" TEXT,
    "callCenterId" INTEGER,
    "leadsId" TEXT,
    "credentialsUserId" INTEGER,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_callCenterId_fkey" FOREIGN KEY ("callCenterId") REFERENCES "CallCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_credentialsUserId_fkey" FOREIGN KEY ("credentialsUserId") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
