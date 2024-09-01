-- CreateEnum
CREATE TYPE "identificationType" AS ENUM ('ID', 'PASSPORT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'LAPSED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('DRAFT', 'INREVIEW', 'DECLINED', 'ACCEPTED', 'REFUSED');

-- CreateEnum
CREATE TYPE "Leadtype" AS ENUM ('APPLICATION', 'CLAIM');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'CLOSED', 'FINALIZED', 'ACKNOWLEDGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REPUDIATED', 'PAYOUT_BLOCKED', 'PAYOUT_PROCESSED');

-- CreateEnum
CREATE TYPE "CoverageOptions" AS ENUM ('A', 'B', 'C', 'D', 'E', 'TELKOM_FREE_BENEFIT');

-- CreateEnum
CREATE TYPE "ExtendedFamilyMembers" AS ENUM ('FATHER', 'MOTHER', 'SISTER', 'BROTHER');

-- CreateEnum
CREATE TYPE "PremiumFrequency" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('INDIVIDUAL');

-- CreateEnum
CREATE TYPE "PackageName" AS ENUM ('DEVICE_INSURANCE', 'DEVICE_CREDITLIFE', 'EMPLOYEE_MOTOR_INSURANCE', 'EMPLOYEE_FUNERAL_INSURANCE', 'EMPLOYEE_DEVICE_INSURANCE', 'EMPLOYEE_MOTOR_CREDITLIFE', 'EMPLOYEE_DEVICE_CREDITLIFE');

-- CreateEnum
CREATE TYPE "SchemeType" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "DeceasedIndividual" AS ENUM ('MAIN', 'OTHER');

-- CreateEnum
CREATE TYPE "FuneralClaimType" AS ENUM ('ACCIDENT', 'NATURAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUBMITTED', 'PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'CANCLLED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('policyPremium', 'claimPayOut', 'policyPremiuRefund');

-- CreateEnum
CREATE TYPE "FamilyRelationship" AS ENUM ('CHILD', 'EXTENDEDFAMILY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AGENT', 'POLICY_ADMINISTRATOR', 'CLAIM_ASSESSOR', 'CLAIM_SUPERVISOR', 'DEVELOPER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "eventCategory" AS ENUM ('POLICY', 'CLAIM', 'APPLICATION', 'COMPLAINT', 'POLICYHOLDER', 'LEAD');

-- CreateEnum
CREATE TYPE "eventName" AS ENUM ('POLICY_ISSUED', 'POLICY_BENEFICIARY_UPDATED', 'POLICY_POLICYHOLDER_UPDATED', 'POLICY_UPDATED', 'POLICY_CANCELLED', 'CLAIM_APPROVED', 'CLAIM_RECEIVED', 'CLAIM_REPUDIATED', 'CLAIM_SENT_TO_REVIEW_CLAIMENT', 'LEAD_UNATTENDED', 'LEAD_ACCEPTED', 'LEAD_REFUSED', 'APPLICATION_UNATTENDED');

-- CreateEnum
CREATE TYPE "Features" AS ENUM ('Admin', 'Application', 'Leads', 'Policy', 'Claim', 'Complaints', 'Payments');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('TELKOM', 'QSURE');

-- CreateEnum
CREATE TYPE "PaymentMethodTypes" AS ENUM ('DEBIT_FROM_SALARY', 'DEBIT_FROM_BANK_ACCOUNT');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('POSTED', 'NOT_POSTED');

-- CreateEnum
CREATE TYPE "DeviceClaimType" AS ENUM ('SOFTWARE_DAMAGE', 'HARDWARE_DAMAGE', 'LOST', 'SCREEN_DAMAGE');

-- CreateEnum
CREATE TYPE "AgentRoleType" AS ENUM ('NONE', 'AGENT', 'LEAD', 'MANAGER');

-- CreateTable
CREATE TABLE "CallCenter" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,

    CONSTRAINT "CallCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialsUser" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "roles" "UserRole"[],
    "phone" TEXT,
    "callCenterId" INTEGER,
    "isArchived" BOOLEAN DEFAULT false,
    "packageName" "PackageName"[],
    "otp_enabled" BOOLEAN DEFAULT false,
    "otp_verified" BOOLEAN DEFAULT false,
    "otp_ascii" TEXT,
    "otp_hex" TEXT,
    "otp_base32" TEXT,
    "otp_auth_url" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "agentRoletype" "AgentRoleType" DEFAULT 'NONE',

    CONSTRAINT "CredentialsUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JwtToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiry" TEXT,
    "userId" INTEGER,

    CONSTRAINT "JwtToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policyholder" (
    "id" TEXT NOT NULL,
    "type" "Type",
    "firstName" TEXT,
    "initial" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneOther" TEXT,
    "streetAddress1" TEXT,
    "streetAddress2" TEXT,
    "suburb" TEXT,
    "city" TEXT,
    "country" TEXT,
    "areaCode" TEXT,
    "appData" JSONB,
    "citizenshipId" TEXT NOT NULL,
    "salaryReferenceNo" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Policyholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leads" (
    "id" TEXT NOT NULL,
    "leadNumber" TEXT NOT NULL,
    "policyholderId" TEXT NOT NULL,
    "claimId" TEXT,
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "status" "LeadStatus" NOT NULL DEFAULT 'DRAFT',
    "leadType" "Leadtype" NOT NULL,
    "policyId" TEXT,
    "options" "CoverageOptions",
    "billingFrequency" "PremiumFrequency" NOT NULL DEFAULT 'MONTHLY',
    "applicationOnHold" BOOLEAN DEFAULT false,
    "applicationRejected" BOOLEAN DEFAULT false,
    "claimOnHold" BOOLEAN DEFAULT false,
    "claimRejected" BOOLEAN DEFAULT false,
    "applicationData" JSONB,
    "claimant" JSONB,
    "policyScheduleKey" TEXT,
    "sumAssured" DOUBLE PRECISION,
    "basePremium" DOUBLE PRECISION,
    "additionalPremium" DOUBLE PRECISION,
    "totalPremium" DOUBLE PRECISION,
    "freeBenefitPremium" DOUBLE PRECISION,
    "billingDay" INTEGER,
    "billingAmount" DOUBLE PRECISION,
    "nextBillingDate" TIMESTAMP(3),
    "nextBillingAmount" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "schemeType" "SchemeType" DEFAULT 'INDIVIDUAL',
    "renewalDate" TIMESTAMP(3),
    "autoRenewal" BOOLEAN,
    "appData" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "policyholderId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "options" "CoverageOptions",
    "billingFrequency" "PremiumFrequency" NOT NULL DEFAULT 'MONTHLY',
    "applicationData" JSONB NOT NULL,
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "sumAssured" DOUBLE PRECISION,
    "basePremium" DOUBLE PRECISION,
    "additionalPremium" DOUBLE PRECISION,
    "totalPremium" DOUBLE PRECISION,
    "freeBenefitPremium" DOUBLE PRECISION,
    "billingDay" INTEGER NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "balance" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "schemeType" "SchemeType" DEFAULT 'INDIVIDUAL',
    "renewalDate" TIMESTAMP(3),
    "autoRenewal" BOOLEAN,
    "appData" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "leadId" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "policyholderId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "options" "CoverageOptions",
    "billingFrequency" "PremiumFrequency" NOT NULL DEFAULT 'MONTHLY',
    "policyData" JSONB NOT NULL,
    "policyScheduleKey" TEXT,
    "sumAssured" DOUBLE PRECISION,
    "basePremium" DOUBLE PRECISION,
    "additionalPremium" DOUBLE PRECISION,
    "totalPremium" DOUBLE PRECISION,
    "freeBenefitPremium" DOUBLE PRECISION,
    "billingDay" INTEGER NOT NULL,
    "billingAmount" DOUBLE PRECISION,
    "nextBillingDate" TIMESTAMP(3),
    "nextBillingAmount" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "schemeType" "SchemeType" DEFAULT 'INDIVIDUAL',
    "renewalDate" TIMESTAMP(3),
    "autoRenewal" BOOLEAN,
    "appData" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "policyholderId" TEXT,
    "claimStatus" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
    "approvalStatus" "ClaimApprovalStatus" DEFAULT 'PENDING',
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "requestedAmount" DOUBLE PRECISION,
    "grantedAmount" DOUBLE PRECISION,
    "claimDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "claimant" JSONB NOT NULL,
    "appData" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaints" (
    "id" SERIAL NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "complainantFirstName" TEXT NOT NULL,
    "complainantLastName" TEXT NOT NULL,
    "complainantEmail" TEXT NOT NULL,
    "complainantMobileNumber" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "leadsId" TEXT,

    CONSTRAINT "Complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" SERIAL NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "description" TEXT,
    "paymentDate" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3),
    "externalReference" TEXT,
    "failureReason" TEXT,
    "failureAction" TEXT,
    "failureCode" TEXT,
    "collectionType" TEXT,
    "billingDate" TIMESTAMP(3) NOT NULL,
    "policyId" TEXT,
    "claimId" TEXT,
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policyPayments" (
    "id" SERIAL NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentType" "PaymentType" NOT NULL,
    "state" "PaymentState" DEFAULT 'NOT_POSTED',
    "amount" DOUBLE PRECISION,
    "description" TEXT,
    "paymentDate" TIMESTAMP(3),
    "failureReason" TEXT,
    "billingDate" TIMESTAMP(3) NOT NULL,
    "policyId" TEXT,
    "packageName" "PackageName" DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "policyPayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "isPrimary" BOOLEAN,
    "paymentMethodType" "PaymentMethodTypes",
    "collectionType" TEXT,
    "accountHolder" TEXT,
    "bank" TEXT,
    "branchCode" TEXT,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "externalReference" TEXT,
    "policyholderId" TEXT,
    "billingAddress" TEXT,
    "applicationId" TEXT,
    "policyId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "leadsId" TEXT,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumCalculator" (
    "id" SERIAL NOT NULL,
    "options" "CoverageOptions" NOT NULL,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "childrenId" INTEGER,
    "mainMember" JSONB NOT NULL,
    "spouse" JSONB NOT NULL,

    CONSTRAINT "PremiumCalculator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtendedPremiumCalculator" (
    "id" SERIAL NOT NULL,
    "options" "CoverageOptions" NOT NULL,
    "extendedFamilyId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ExtendedPremiumCalculator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadLibrary" (
    "id" SERIAL NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "s3response" JSONB,
    "name" TEXT,
    "type" TEXT,
    "description" TEXT,
    "appData" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "applicationIds" TEXT,
    "policyIds" TEXT,
    "complaintIds" INTEGER,
    "claimIds" TEXT,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "leadsId" TEXT,

    CONSTRAINT "UploadLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" SERIAL NOT NULL,
    "leadsId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyNote" (
    "id" SERIAL NOT NULL,
    "policyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "PolicyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimNote" (
    "id" SERIAL NOT NULL,
    "claimId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ClaimNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationNote" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ApplicationNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintNotes" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ComplaintNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimcheckListNote" (
    "id" SERIAL NOT NULL,
    "claimCheckListId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ClaimcheckListNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "differences" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "leadsId" TEXT,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyActivity" (
    "id" SERIAL NOT NULL,
    "policyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "differences" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "PolicyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimActivity" (
    "id" SERIAL NOT NULL,
    "claimId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "differences" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ClaimActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationActivity" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "differences" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ApplicationActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintsActivity" (
    "id" SERIAL NOT NULL,
    "complaintId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "differences" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ComplaintsActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyholderActivity" (
    "id" SERIAL NOT NULL,
    "policyholderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" JSONB,
    "differences" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "PolicyholderActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuneralClaimBlock" (
    "id" SERIAL NOT NULL,
    "claimId" TEXT,
    "deceasedMemberId" TEXT,
    "deceasedIndividual" "DeceasedIndividual",
    "firstName" TEXT,
    "lastName" TEXT,
    "said" TEXT,
    "deceasedIndividualCreatedAt" TIMESTAMP(3),
    "claimCreatedDate" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "funeralClaimType" "FuneralClaimType",
    "cause" TEXT,
    "policeCaseNumber" TEXT,
    "reportingPoliceStation" TEXT,
    "referenceNumber" TEXT,
    "incidentDescription" TEXT,
    "doctorName" TEXT,
    "doctorContactNumber" TEXT,
    "doctoreAddress" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "FuneralClaimBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identification" (
    "id" SERIAL NOT NULL,
    "type" "identificationType",
    "country" TEXT,
    "number" TEXT,
    "policyholderId" TEXT,

    CONSTRAINT "Identification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IQuoteMember" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "citizenshipId" TEXT,
    "age" INTEGER NOT NULL,
    "naturalDeathAmount" DOUBLE PRECISION,
    "accidentalDeathAmount" DOUBLE PRECISION,
    "premiumAmount" DOUBLE PRECISION,
    "relation" "ExtendedFamilyMembers",

    CONSTRAINT "IQuoteMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IBeneficiary" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "percentage" INTEGER,
    "relation" TEXT,
    "identification" JSONB NOT NULL,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "applicationId" TEXT,
    "trustNumber" TEXT,
    "policyId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "leadsId" TEXT,

    CONSTRAINT "IBeneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "options" "CoverageOptions",
    "billingFrequency" "PremiumFrequency" NOT NULL DEFAULT 'MONTHLY',
    "policyData" JSONB,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IMember" (
    "id" SERIAL NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "isStudying" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isStillBorn" BOOLEAN NOT NULL DEFAULT false,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "premiumAmount" DOUBLE PRECISION NOT NULL,
    "premiumFrequency" "PremiumFrequency" NOT NULL DEFAULT 'MONTHLY',

    CONSTRAINT "IMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventNotification" (
    "id" SERIAL NOT NULL,
    "eventName" "eventName" NOT NULL,
    "eventCategory" "eventCategory" NOT NULL,
    "packageName" "PackageName" NOT NULL,
    "emailNotification" BOOLEAN DEFAULT false,
    "emailTemplate" TEXT,
    "emailProductSpecification" BOOLEAN DEFAULT false,
    "smsNotification" BOOLEAN DEFAULT false,
    "smsTemplate" TEXT,
    "smsProductSpecification" BOOLEAN DEFAULT false,
    "attachment" BOOLEAN DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "EventNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLevels" (
    "id" SERIAL NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "packageName" "PackageName" NOT NULL DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "features" "Features" NOT NULL DEFAULT 'Application',
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "AccessLevels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimCheckListDefinitions" (
    "id" SERIAL NOT NULL,
    "packageName" "PackageName" NOT NULL,
    "condition" TEXT NOT NULL,

    CONSTRAINT "ClaimCheckListDefinitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimCheckList" (
    "id" SERIAL NOT NULL,
    "packageName" "PackageName" NOT NULL,
    "claimId" TEXT,
    "condition" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ClaimCheckList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeData" (
    "id" SERIAL NOT NULL,
    "CellPhone" TEXT,
    "Email" TEXT,
    "FullName" TEXT,
    "IDNumber" TEXT,
    "SalaryRef" TEXT,
    "Initials" TEXT,
    "Username" TEXT,
    "PreferredName" TEXT,
    "Rank" TEXT,
    "Status" TEXT,
    "Surname" TEXT,
    "Title" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "EmployeeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reports" (
    "id" SERIAL NOT NULL,
    "packageName" "PackageName" NOT NULL DEFAULT 'EMPLOYEE_FUNERAL_INSURANCE',
    "reportType" "ReportType" NOT NULL,
    "csvData" JSONB[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" SERIAL NOT NULL,
    "packageName" "PackageName" NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachments" (
    "id" SERIAL NOT NULL,
    "fileUrl" TEXT,
    "s3response" JSONB,
    "name" TEXT,
    "type" TEXT,
    "isArchived" BOOLEAN DEFAULT false,
    "packageId" INTEGER,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLifeClaimBlock" (
    "id" SERIAL NOT NULL,
    "claimId" TEXT,
    "claimCreatedDate" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "placeOfDeath" TEXT,
    "creditLifeClaimType" "FuneralClaimType",
    "cause" TEXT,
    "policeCaseNumber" TEXT,
    "reportingPoliceStation" TEXT,
    "referenceNumber" TEXT,
    "incidentDescription" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "CreditLifeClaimBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleData" (
    "id" SERIAL NOT NULL,
    "AreaOffice" TEXT,
    "EngineNumber" TEXT,
    "Make" TEXT,
    "MarketValue" TEXT,
    "MMNumber" TEXT,
    "Model" TEXT,
    "RecordId" TEXT,
    "RegistrationNumber" TEXT,
    "RetailPrice" TEXT,
    "TradePrice" TEXT,
    "TransactionNumber" TEXT,
    "VehicleRef" TEXT,
    "VINNumber" TEXT,
    "WRTYEnd" TEXT,
    "WRTYStart" TEXT,
    "YearModel" TEXT,
    "VehicleNumber" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "VehicleData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevicePremiumCalculator" (
    "id" SERIAL NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "premiumAmount" DOUBLE PRECISION,
    "isArchived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedById" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "DevicePremiumCalculator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageRules" (
    "id" SERIAL NOT NULL,
    "ruleStartDate" TIMESTAMP(3),
    "packageId" INTEGER,
    "updatedById" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "PackageRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleLimits" (
    "id" SERIAL NOT NULL,
    "freeCoverBenefitAmount" DOUBLE PRECISION,
    "freeCoverPremium" DOUBLE PRECISION,
    "aditionalCoverPercentage" DOUBLE PRECISION,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "packageRulesId" INTEGER,

    CONSTRAINT "RuleLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceCatalog" (
    "id" SERIAL NOT NULL,
    "deviceType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "updatedById" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "DeviceCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceClaimBlock" (
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

    CONSTRAINT "DeviceClaimBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLifeDeviceClaimBlock" (
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

    CONSTRAINT "CreditLifeDeviceClaimBlock_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_reportingUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ExtendedPremiumCalculatorToIMember" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_IMemberToPremiumCalculator" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CredentialsUser_email_key" ON "CredentialsUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JwtToken_token_key" ON "JwtToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Policyholder_email_key" ON "Policyholder"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Policyholder_citizenshipId_key" ON "Policyholder"("citizenshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Leads_claimId_key" ON "Leads"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Leads_leadNumber_key" ON "Leads"("leadNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Application_leadId_key" ON "Application"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_applicationId_key" ON "Policy"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyNumber_key" ON "Policy"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumCalculator_options_key" ON "PremiumCalculator"("options");

-- CreateIndex
CREATE UNIQUE INDEX "ExtendedPremiumCalculator_options_key" ON "ExtendedPremiumCalculator"("options");

-- CreateIndex
CREATE UNIQUE INDEX "EventNotification_eventName_eventCategory_packageName_key" ON "EventNotification"("eventName", "eventCategory", "packageName");

-- CreateIndex
CREATE UNIQUE INDEX "AccessLevels_role_features_key" ON "AccessLevels"("role", "features");

-- CreateIndex
CREATE UNIQUE INDEX "Package_packageName_key" ON "Package"("packageName");

-- CreateIndex
CREATE UNIQUE INDEX "_reportingUser_AB_unique" ON "_reportingUser"("A", "B");

-- CreateIndex
CREATE INDEX "_reportingUser_B_index" ON "_reportingUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExtendedPremiumCalculatorToIMember_AB_unique" ON "_ExtendedPremiumCalculatorToIMember"("A", "B");

-- CreateIndex
CREATE INDEX "_ExtendedPremiumCalculatorToIMember_B_index" ON "_ExtendedPremiumCalculatorToIMember"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IMemberToPremiumCalculator_AB_unique" ON "_IMemberToPremiumCalculator"("A", "B");

-- CreateIndex
CREATE INDEX "_IMemberToPremiumCalculator_B_index" ON "_IMemberToPremiumCalculator"("B");

-- AddForeignKey
ALTER TABLE "CredentialsUser" ADD CONSTRAINT "CredentialsUser_callCenterId_fkey" FOREIGN KEY ("callCenterId") REFERENCES "CallCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JwtToken" ADD CONSTRAINT "JwtToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policyholder" ADD CONSTRAINT "Policyholder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policyholder" ADD CONSTRAINT "Policyholder_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leads" ADD CONSTRAINT "Leads_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaints" ADD CONSTRAINT "Complaints_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policyPayments" ADD CONSTRAINT "policyPayments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policyPayments" ADD CONSTRAINT "policyPayments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policyPayments" ADD CONSTRAINT "policyPayments_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumCalculator" ADD CONSTRAINT "PremiumCalculator_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumCalculator" ADD CONSTRAINT "PremiumCalculator_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtendedPremiumCalculator" ADD CONSTRAINT "ExtendedPremiumCalculator_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtendedPremiumCalculator" ADD CONSTRAINT "ExtendedPremiumCalculator_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_applicationIds_fkey" FOREIGN KEY ("applicationIds") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_policyIds_fkey" FOREIGN KEY ("policyIds") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_complaintIds_fkey" FOREIGN KEY ("complaintIds") REFERENCES "Complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_claimIds_fkey" FOREIGN KEY ("claimIds") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLibrary" ADD CONSTRAINT "UploadLibrary_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyNote" ADD CONSTRAINT "PolicyNote_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyNote" ADD CONSTRAINT "PolicyNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyNote" ADD CONSTRAINT "PolicyNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimNote" ADD CONSTRAINT "ClaimNote_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimNote" ADD CONSTRAINT "ClaimNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimNote" ADD CONSTRAINT "ClaimNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintNotes" ADD CONSTRAINT "ComplaintNotes_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintNotes" ADD CONSTRAINT "ComplaintNotes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintNotes" ADD CONSTRAINT "ComplaintNotes_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimcheckListNote" ADD CONSTRAINT "ClaimcheckListNote_claimCheckListId_fkey" FOREIGN KEY ("claimCheckListId") REFERENCES "ClaimCheckList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimcheckListNote" ADD CONSTRAINT "ClaimcheckListNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimcheckListNote" ADD CONSTRAINT "ClaimcheckListNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyActivity" ADD CONSTRAINT "PolicyActivity_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyActivity" ADD CONSTRAINT "PolicyActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyActivity" ADD CONSTRAINT "PolicyActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimActivity" ADD CONSTRAINT "ClaimActivity_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimActivity" ADD CONSTRAINT "ClaimActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimActivity" ADD CONSTRAINT "ClaimActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationActivity" ADD CONSTRAINT "ApplicationActivity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationActivity" ADD CONSTRAINT "ApplicationActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationActivity" ADD CONSTRAINT "ApplicationActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintsActivity" ADD CONSTRAINT "ComplaintsActivity_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintsActivity" ADD CONSTRAINT "ComplaintsActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintsActivity" ADD CONSTRAINT "ComplaintsActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyholderActivity" ADD CONSTRAINT "PolicyholderActivity_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyholderActivity" ADD CONSTRAINT "PolicyholderActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyholderActivity" ADD CONSTRAINT "PolicyholderActivity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuneralClaimBlock" ADD CONSTRAINT "FuneralClaimBlock_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuneralClaimBlock" ADD CONSTRAINT "FuneralClaimBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuneralClaimBlock" ADD CONSTRAINT "FuneralClaimBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Identification" ADD CONSTRAINT "Identification_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "Policyholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IBeneficiary" ADD CONSTRAINT "IBeneficiary_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IBeneficiary" ADD CONSTRAINT "IBeneficiary_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IBeneficiary" ADD CONSTRAINT "IBeneficiary_leadsId_fkey" FOREIGN KEY ("leadsId") REFERENCES "Leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventNotification" ADD CONSTRAINT "EventNotification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventNotification" ADD CONSTRAINT "EventNotification_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLevels" ADD CONSTRAINT "AccessLevels_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLevels" ADD CONSTRAINT "AccessLevels_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCheckList" ADD CONSTRAINT "ClaimCheckList_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCheckList" ADD CONSTRAINT "ClaimCheckList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCheckList" ADD CONSTRAINT "ClaimCheckList_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeData" ADD CONSTRAINT "EmployeeData_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeData" ADD CONSTRAINT "EmployeeData_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLifeClaimBlock" ADD CONSTRAINT "CreditLifeClaimBlock_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLifeClaimBlock" ADD CONSTRAINT "CreditLifeClaimBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLifeClaimBlock" ADD CONSTRAINT "CreditLifeClaimBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleData" ADD CONSTRAINT "VehicleData_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleData" ADD CONSTRAINT "VehicleData_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevicePremiumCalculator" ADD CONSTRAINT "DevicePremiumCalculator_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevicePremiumCalculator" ADD CONSTRAINT "DevicePremiumCalculator_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRules" ADD CONSTRAINT "PackageRules_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRules" ADD CONSTRAINT "PackageRules_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRules" ADD CONSTRAINT "PackageRules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleLimits" ADD CONSTRAINT "RuleLimits_packageRulesId_fkey" FOREIGN KEY ("packageRulesId") REFERENCES "PackageRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCatalog" ADD CONSTRAINT "DeviceCatalog_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCatalog" ADD CONSTRAINT "DeviceCatalog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceClaimBlock" ADD CONSTRAINT "DeviceClaimBlock_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceClaimBlock" ADD CONSTRAINT "DeviceClaimBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceClaimBlock" ADD CONSTRAINT "DeviceClaimBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLifeDeviceClaimBlock" ADD CONSTRAINT "CreditLifeDeviceClaimBlock_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLifeDeviceClaimBlock" ADD CONSTRAINT "CreditLifeDeviceClaimBlock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLifeDeviceClaimBlock" ADD CONSTRAINT "CreditLifeDeviceClaimBlock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CredentialsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "_reportingUser" ADD CONSTRAINT "_reportingUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CredentialsUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_reportingUser" ADD CONSTRAINT "_reportingUser_B_fkey" FOREIGN KEY ("B") REFERENCES "CredentialsUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtendedPremiumCalculatorToIMember" ADD CONSTRAINT "_ExtendedPremiumCalculatorToIMember_A_fkey" FOREIGN KEY ("A") REFERENCES "ExtendedPremiumCalculator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtendedPremiumCalculatorToIMember" ADD CONSTRAINT "_ExtendedPremiumCalculatorToIMember_B_fkey" FOREIGN KEY ("B") REFERENCES "IMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IMemberToPremiumCalculator" ADD CONSTRAINT "_IMemberToPremiumCalculator_A_fkey" FOREIGN KEY ("A") REFERENCES "IMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IMemberToPremiumCalculator" ADD CONSTRAINT "_IMemberToPremiumCalculator_B_fkey" FOREIGN KEY ("B") REFERENCES "PremiumCalculator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

