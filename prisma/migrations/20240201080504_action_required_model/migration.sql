-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CHILD_AGE_LIMIT_EXCEDED');

-- CreateTable
CREATE TABLE "ActionRequiredPolices" (
    "id" SERIAL NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL DEFAULT 'CHILD_AGE_LIMIT_EXCEDED',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "actionDate" TIMESTAMP(3),
    "childId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ActionRequiredPolices_pkey" PRIMARY KEY ("id")
);
