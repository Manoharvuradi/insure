-- CreateTable
CREATE TABLE "SmsVerfication" (
    "id" SERIAL NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,

    CONSTRAINT "SmsVerfication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SmsVerfication" ADD CONSTRAINT "SmsVerfication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
