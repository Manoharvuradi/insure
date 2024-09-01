import {
  IColumn,
  IEmployeeDataColumn,
  IUserColumn,
  IVehicleDataColumn,
} from "~/interfaces/common";
import * as pdf from "html-pdf";
import { env } from "~/env.mjs";
import { v4 as uuidv4 } from "uuid";
import { Policyholder, UserRole } from "@prisma/client";

import { emailSendGenerator } from "../helpers/sendEmail";
import { smsSendGenerator } from "../helpers/sendSms";
import { IEventNotification } from "~/interfaces/eventNotification";
import smsTemplate from "~/components/smsTemplate";
import { api } from "../api";
import { IOption } from "~/interfaces/common/form";
import { logError, logInfo } from "~/server/api/constants/logger";
import crypto from "crypto";
import { encode } from "hi-base32";
import path from "path";

export const telkomFreeBenefit = "TELKOM_FREE_BENEFIT";
export const GuardRiskManagementFee = 2.6; // 2.6%
export const applicationStatus = ["PENDING", "APPROVED", "REJECTED"] as const;
export const leadStatus = [
  "DRAFT",
  "REFUSED",
  "INREVIEW",
  "DECLINED",
  "ACCEPTED",
] as const;
export const leadType = ["APPLICATION", "CLAIM"] as const;
export const policyStatus = ["ACTIVE", "CANCELLED", "LAPSED"] as const;
export const claimStatus = [
  "OPEN",
  "CLOSED",
  "FINALIZED",
  "ACKNOWLEDGED",
  "REJECTED",
] as const;
export const complaintStatus = [
  "OPEN",
  "CLOSED",
  "FINALIZED",
  "ACKNOWLEDGED",
] as const;
export const claimApprovalStatus = [
  "PENDING",
  "APPROVED",
  "REPUDIATED",
  "PAYOUT_BLOCKED",
  "PAYOUT_PROCESSED",
] as const;
export const coverageOptions = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "TELKOM_FREE_BENEFIT",
] as const;
export const additionalPercentageInsured = [
  "0",
  "25",
  "50",
  "75",
  "100",
  "Other",
] as const;
export const gender = ["MALE", "FEMALE", "OTHER"] as const;
export const schemeType = ["INDIVIDUAL", "GROUP"] as const;
export const relation = [
  "parent",
  "parent_in_law",
  "brother",
  "sister",
  "uncle",
  "aunt",
  "nephew",
  "niece",
  "additional_child",
  "grandparent",
  "cousin",
] as const;
export const packageName = [
  "EMPLOYEE_MOTOR_INSURANCE",
  "EMPLOYEE_FUNERAL_INSURANCE",
  "EMPLOYEE_DEVICE_INSURANCE",
  "EMPLOYEE_MOTOR_CREDITLIFE",
  "EMPLOYEE_DEVICE_CREDITLIFE",
  "DEVICE_INSURANCE",
  "DEVICE_CREDITLIFE",
] as const;
export const premiumFrequency = ["MONTHLY"] as const;
export const identificationType = ["ID", "PASSPORT"] as const;
export const type = ["INDIVIDUAL"] as const;
export const familyRelationship = ["CHILD", "EXTENDEDFAMILY"] as const;
export const agentRoleType = ["NONE", "AGENT", "LEAD", "MANAGER"] as const;
export const eventCategory = [
  "POLICY",
  "CLAIM",
  "APPLICATION",
  "COMPLAINT",
  "POLICYHOLDER",
  "LEAD",
] as const;

export const eventName = [
  "POLICY_ISSUED",
  "POLICY_BENEFICIARY_UPDATED",
  "POLICY_POLICYHOLDER_UPDATED",
  "POLICY_UPDATED",
  "POLICY_CANCELLED",
  "CLAIM_APPROVED",
  "CLAIM_RECEIVED",
  "CLAIM_REPUDIATED",
  "CLAIM_SENT_TO_REVIEW_CLAIMENT",
  "LEAD_ACCEPTED",
  "LEAD_UNATTENDED",
  "LEAD_REFUSED",
  "APPLICATION_UNATTENDED",
] as const;
export const deceasedIndividual = ["MAIN", "OTHER"] as const;
export const FuneralClaimType = ["ACCIDENT", "NATURAL"] as const;

export const deviceClaimType = [
  "SOFTWARE_DAMAGE",
  "HARDWARE_DAMAGE",
  "LOST",
  "SCREEN_DAMAGE",
] as const;

export const role = [
  "AGENT",
  "POLICY_ADMINISTRATOR",
  "CLAIM_ASSESSOR",
  "CLAIM_SUPERVISOR",
  "DEVELOPER",
  "SUPER_ADMIN",
] as const;

export const features = [
  "Admin",
  "Policy",
  "Leads",
  "Application",
  "Claim",
  "Complaints",
  "Payments",
  "Contacts",
] as const;

export const countries = [
  { name: "United States", code: "+1" },
  { name: "South Africa", code: "+27" },
];

export const paymentStatus = [
  "PENDING",
  "SUBMITTED",
  "PROCESSING",
  "SUCCESSFUL",
  "FAILED",
  "CANCLLED",
] as const;

export const Claimantrelations = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Aunt/Uncle",
  "Cousin",
  "Son in Law",
  "Daughter in Law",
  "Father in Law",
  "Mother in Law",
  "Credit Provider",
  "Cessionary",
  "Employer",
  "GrandParent",
  "GrandChild",
  "Gaurdian",
  "Main Member",
  "Funeral Parlour",
  "Niece",
  "Nephew",
  "Trust",
  "Policy Holder",
  "Friend",
  "Colleague",
  "Acquaintance",
  "Other",
];
export const reportType = ["TELKOM", "QSURE"] as const;
export const generateUniqueNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  const policyNumber = `${year}${random}${month}${day}`;
  return policyNumber;
};

export const removeNullProperties = (obj: any) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") {
      removeNullProperties(obj[key]);
    } else if (obj[key] === null) {
      delete obj[key];
    }
  });
  return obj;
};

export const applicationColumn: IColumn[] = [
  {
    key: ["policyholder.firstName", "policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "applicationData.packageName", label: "Package name" },
  { key: "status", label: "Status" },
  { key: "startDate", label: "Start date" },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
  { key: "createdAt", label: "Created at" },
];

export const policyColumn: IColumn[] = [
  {
    key: ["policyholder.firstName", "policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "policyData.packageName", label: "Package name" },
  { key: "status", label: "Status" },
  { key: "policyNumber", label: "Policy number" },
  { key: "startDate", label: "Start date" },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
  { key: "createdAt", label: "Created at" },
];

export const claimColumn: IColumn[] = [
  {
    key: ["policies.policyholder.firstName", "policies.policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "policies.policyData.packageName", label: "Package name" },
  { key: "policies.policyNumber", label: "Policy number" },
  { key: "claimNumber", label: "Claim number" },
  { key: "claimStatus", label: "Status" },
  { key: "approvalStatus", label: "Outcome" },
  { key: ["claimant.firstName", "claimant.lastName"], label: "Claimant" },
  { key: "claimDate", label: "Claim date" },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
  { key: "createdAt", label: "Created at" },
];

export const complaintColumn: IColumn[] = [
  {
    key: ["policy.policyholder.firstName", "policy.policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "policy.policyData.packageName", label: "Package name" },
  { key: "policy.policyNumber", label: "Policy number" },
  { key: "complaintNumber", label: "Complaint number" },
  { key: "status", label: "Status" },
  {
    key: ["complainantFirstName", "complainantLastName"],
    label: "Complainant",
  },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
  { key: "createdAt", label: "Created at" },
];

export const reportsColumn: IColumn[] = [
  { key: "packageName", label: "Package name" },
  { key: "reportType", label: "Report for" },
  { key: "createdAt", label: "Created at" },
];

export const claimPayoutColumn: IColumn[] = [
  {
    key: [
      "claim.policies.policyholder.firstName",
      "claim.policies.policyholder.lastName",
    ],
    label: "Policyholder",
  },
  { key: "claim.policies.policyData.packageName", label: "Package name" },
  { key: "claim.claimNumber", label: "Claim number" },
  { key: "amount", label: "Amount" },
  { key: "createdAt", label: "Created at" },
];

export const policyPremiumColumn: IColumn[] = [
  {
    key: ["policy.policyholder.firstName", "policy.policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "policy.policyData.packageName", label: "Package name" },
  { key: "policy.policyNumber", label: "Policy number" },
  { key: "amount", label: "Amount" },
  { key: "balance", label: "Balance" },
  { key: "createdAt", label: "Created at" },
];

export const policyholderColumn: IColumn[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "gender", label: "Gender" },
  { key: "email", label: "Mail" },
  { key: "citizenshipId", label: "Citizenship Id" },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
];

export const tabs = [
  { name: "summary", label: "Summary", key: "1", currentTab: false },
  {
    name: "paymentMethod",
    label: "Payment Method",
    key: "2",
    currentTab: false,
  },
  { name: "policyholder", label: "Policyholder", key: "3", currentTab: false },
  {
    name: "beneficiaries",
    label: "Beneficiaries",
    key: "4",
    currentTab: false,
  },
  { name: "documents", label: "Documents", key: "5", currentTab: false },
];
export const tabs2 = [
  { name: "activity", label: "Activity", key: "1", currentTab: false },
  { name: "notes", label: "Notes", key: "2", currentTab: false },
];

export const policyTabs = [
  {
    name: "policyDetails",
    label: "Policy Details",
    key: "1",
    currentTab: false,
  },
  {
    name: "paymentMethod",
    label: "Payment Method",
    key: "2",
    currentTab: false,
  },
  {
    name: "beneficiaries",
    label: "Beneficiaries",
    key: "3",
    currentTab: false,
  },
  { name: "documents", label: "Documents", key: "4", currentTab: false },
];

export const prospectTabs = [
  {
    name: "prospectDetails",
    label: "Prospect Details",
    key: "1",
    currentTab: false,
  },
  {
    name: "paymentMethod",
    label: "Payment Method",
    key: "2",
    currentTab: false,
  },
  {
    name: "beneficiaries",
    label: "Beneficiaries",
    key: "3",
    currentTab: false,
  },
  { name: "documents", label: "Documents", key: "4", currentTab: false },
];
export const claimTabs = [
  {
    name: "claimDetails",
    label: "Claim Details",
    key: "1",
    currentTab: true,
  },
  { name: "claimant", label: "Claimant", key: "2", currentTab: false },
  {
    name: "beneficiaries",
    label: "Beneficiaries",
    key: "3",
    currentTab: false,
  },
  {
    name: "claimDescription",
    label: "Claim Description",
    key: "4",
    currentTab: false,
  },
  {
    name: "checkList",
    label: "Check List",
    key: "5",
    currentTab: false,
  },
  {
    name: "documents",
    label: "Documents",
    key: "6",
    currentTab: false,
  },
];

export const complaintTabs = [
  {
    name: "complaintDetails",
    label: "Complaint details",
    key: "1",
    currentTab: false,
  },
  { name: "documents", label: "Documents", key: "2", currentTab: false },
];

export const menuItems = [
  { action: "Issue policy", href: "" },
  { action: "Archive", href: "" },
  { action: "set Archive", href: "" },
];

export const billingMenu = [{ action: "New payment method", href: "" }];

export const policyActionMenuItems = [
  { action: "Edit", href: "" },
  { action: "Remove", href: "" },
];

export const policyPaymentsMenuItems = [
  { action: "Submit collection request", href: "" },
  { action: "Allocate EFT payment", href: "" },
  { action: "Request payment holiday", href: "" },
];

export const policyholderTabs = [
  { name: "Policyholder", label: "Policyholder", currentTab: false },
  { name: "Applications", label: "Applications", currentTab: false },
  { name: "Policies", label: "Policies", currentTab: false },
  { name: "PaymentMethods", label: "Payment Methods", currentTab: false },
];

export const generatePDF = async (html: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    pdf.create(html).toBuffer((err: any, buffer: any) => {
      if (err) return reject(err);
      return resolve(buffer);
    });
  });
};

export const generatePassword = (length: number) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let password = "";

  for (var i = 0, n = characters.length; i < length; ++i) {
    password += characters.charAt(Math.floor(Math.random() * n));
  }

  return password;
};
export const generateOtp = (length: number) => {
  const characters = "0123456789";

  let password = "";

  for (var i = 0, n = characters.length; i < length; ++i) {
    password += characters.charAt(Math.floor(Math.random() * n));
  }

  return password;
};
export const digitArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const addNoteForm = [
  {
    label: "Title",
    type: "text",
    name: "title",
    required: true,
  },
  {
    label: "Description",
    type: "textarea",
    name: "description",
    required: true,
  },
];

export const policyholderActivitiesLabels = {
  created: "Policyholder created",
  updated: "Policyholder updated",
};

export const leadActivitiesLabels = {
  created: "Prospect created",
  updated: "Prospect updated",
  approved: "Prospect sent to applications",
  rejected: "Prospect refused",
  accepted: "Prospect accepted",
  issuePolicy: "Policy issued",
  onhold: "Application on hold",
  applicationRejected: "Application rejected",
  document: "Documents updated",
  documentArchived: "Document Archived",
  beneficiary: "Beneficiary updated",
  paymentUpdate: "Payment method updated",
};

export const applicationActivitiesLabels = {
  created: "Application created",
  updated: "Application updated",
  approved: "Application approved",
  rejected: "Application rejected",
  document: "Documents updated",
  documentArchived: "Document Archived",
  beneficiary: "Beneficiary updated",
  paymentUpdate: "Payment method updated",
};

export const policyActivitiesLabels = {
  created: "Policy created",
  updated: "Policy updated",
  activate: "Policy activated",
  cancelled: "Policy cancelled",
  document: "Documents updated",
  documentArchived: "Document Archived",
  beneficiary: "Beneficiary updated",
  status: "Policy status updated",
  updatedChildren: "Policy children updated",
  updatedExtendedFamily: "Policy extended families are updated",
  updatePayment: "Policy payment updated",
};

export const claimActivitiesLabels = {
  created: "Claim created",
  updated: "Claim updated",
  closed: "Claim closed",
  document: "Documents updated",
  documentArchived: "Document Archived",
};

export const complaintActivitiesLabels = {
  created: "Complaint created",
  updated: "Complaint updated",
  closed: "Complaint closed",
  document: "Documents updated",
  documentArchived: "Document Archived",
};

export const convertToObjectWithCreate = (obj: any) => {
  if (Array.isArray(obj)) {
    return { create: obj };
  }
  return { create: [obj] };
};

export const convertInputToUpdateObject = (inputObj: any) => {
  const { id } = inputObj;
  delete inputObj.id;
  const data = inputObj;
  const updateObj = { update: [{ where: { id }, data }] };
  return updateObj;
};

export const convertToObjectWithUpdate = (children: any) => {
  const update = [];
  const create = [];

  for (const child of children) {
    if (child.id) {
      update.push({
        where: { id: child.id },
        data: {
          minAge: child.minAge,
          maxAge: child.maxAge,
          isStudying: child.isStudying,
          isDisabled: child.isDisabled,
          coverageAmount: child.coverageAmount,
          premiumAmount: child.premiumAmount,
          premiumFrequency: child.premiumFrequency,
        },
      });
    } else {
      create.push({
        minAge: child.minAge,
        maxAge: child.maxAge,
        isStudying: child.isStudying,
        isDisabled: child.isDisabled,
        coverageAmount: child.coverageAmount,
        premiumAmount: child.premiumAmount,
        premiumFrequency: child.premiumFrequency,
      });
    }
  }

  const childrenUpsert: any = {};

  if (create.length > 0) {
    childrenUpsert.create = create;
  }

  if (update.length > 0) {
    childrenUpsert.update = update;
  }

  return childrenUpsert;
};

export const removeUndefined: any = (obj: any) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => [key, removeUndefined(value)])
  );
};

export const removeUndefinedAndAddUuid = (obj: any): any => {
  const filteredObj = Object.entries(obj)
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]: any) => {
      if (Array.isArray(value)) {
        if (value.length === 0 || typeof value[0] !== "object") {
          return [key, value];
        }
        let result: any = {};
        const updateItems = value
          .filter((item) => item.id !== undefined)
          .map(({ id, ...data }) => ({ where: { id }, data }));

        const createItems = value
          .filter((item) => item.id === undefined)
          .map(({ id, ...data }) => data);

        if (updateItems.length > 0) {
          result.update = updateItems;
        }

        if (createItems.length > 0) {
          result.create = createItems;
        }

        return [key, Object.keys(result).length > 0 ? result : null];
      } else {
        if (
          (key === "policyData" || key === "applicationData") &&
          value?.members
        ) {
          const { mainMember, spouse, children, extendedFamily } =
            value.members;
          if (Array.isArray(children) && children?.length > 0) {
            value.members.children = children
              .filter((child) => child && child !== undefined && child !== null)
              .map((child) =>
                child.id
                  ? { ...child, updatedAt: new Date() }
                  : {
                      ...child,
                      id: child.id || uuidv4(),
                      createdAt: new Date(),
                    }
              );
          }

          if (Array.isArray(extendedFamily) && extendedFamily?.length > 0) {
            value.members.extendedFamily = extendedFamily
              .filter(
                (extend) => extend && extend !== undefined && extend !== null
              )
              .map((extend) =>
                extend.id
                  ? { ...extend, updatedAt: new Date() }
                  : {
                      ...extend,
                      id: extend.id || uuidv4(),
                      createdAt: new Date(),
                    }
              );
          }

          if (Array.isArray(spouse) && spouse?.length > 0) {
            value.members.spouse = spouse
              .filter(
                (spouse: any) =>
                  spouse && spouse !== undefined && spouse !== null
              )
              .map((spouse: any) =>
                spouse.id
                  ? { ...spouse, updatedAt: new Date() }
                  : {
                      ...spouse,
                      id: spouse.id || uuidv4(),
                      createdAt: new Date(),
                    }
              );
          }
          if (mainMember) {
            value.members.mainMember = mainMember.id
              ? { ...mainMember, updatedAt: new Date() }
              : {
                  ...mainMember,
                  id: mainMember.id || uuidv4(),
                  createdAt: new Date(),
                };
          }
          return [key, value];
        }
        return [key, value];
      }
    })
    .filter(([key, value]) => value !== null);
  return Object.fromEntries(filteredObj);
};

export const removeIdFromArray = (obj: any): any => {
  const filteredObj = Object.entries(obj)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        let restData = value.map((obj) => {
          const {
            id,
            policyholderId,
            applicationId,
            policyId,
            leadsId,
            ...rest
          } = obj;
          return rest;
        });
        return [key, restData];
      } else {
        return [key, value];
      }
    });
  return Object.fromEntries(filteredObj);
};

export const appendUuidToObjectArray = (
  obj: Record<string, any>
): Record<string, any> => {
  const newObj = { ...obj };
  function traverse(obj: Record<string, any>): void {
    Object.entries(obj).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((el: Record<string, any>) => {
          el.id = uuidv4();
          traverse(el);
        });
      } else if (typeof val === "object" && val !== null) {
        traverse(val);
      }
    });
  }

  traverse(newObj);
  newObj.id = uuidv4();

  return newObj;
};

export const registerFormInputs = [
  {
    label: "First Name",
    type: "text",
    name: "firstName",
    required: true,
  },
  {
    label: "Last Name",
    type: "text",
    name: "lastName",
    required: true,
  },
  {
    label: "Email",
    type: "email",
    name: "email",
    required: true,
  },
  {
    label: "Password",
    type: "password",
    name: "password",
    required: false,
  },
  {
    label: "Confirm Password",
    type: "password",
    name: "confirmPassword",
    required: false,
  },
  {
    label: "Phone number",
    type: "phone",
    name: "phone",
    required: true,
  },
  {
    label: "Package Name",
    type: "multi-select",
    name: "packageName",
    required: true,
    multipleOptions: [
      {
        label: "Employee motor insurance",
        type: "checkbox",
        name: "EMPLOYEE_MOTOR_INSURANCE",
        required: false,
      },
      {
        label: "Employee funeral insurance",
        type: "checkbox",
        name: "EMPLOYEE_FUNERAL_INSURANCE",
        required: false,
      },
      {
        label: "Employee device insurance",
        type: "checkbox",
        name: "EMPLOYEE_DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Employee motor credit life",
        type: "checkbox",
        name: "EMPLOYEE_MOTOR_CREDITLIFE",
        required: false,
      },
      {
        label: "Employee device credit life",
        type: "checkbox",
        name: "EMPLOYEE_DEVICE_CREDITLIFE",
        required: false,
      },
      {
        label: "Device insurance",
        type: "checkbox",
        name: "DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Device creditlife",
        type: "checkbox",
        name: "DEVICE_CREDITLIFE",
        required: false,
      },
    ],
  },
  {
    label: "Roles",
    type: "multi-select",
    name: "roles",
    required: true,
    multipleOptions: [
      {
        label: "Agent",
        name: "AGENT",
        type: "checkbox",
        required: false,
      },
      {
        label: "Claim assessor",
        name: "CLAIM_ASSESSOR",
        type: "checkbox",
        required: false,
      },
      {
        label: "Developer",
        name: "DEVELOPER",
        type: "checkbox",
        required: false,
      },
      {
        label: "Policy administrator",
        name: "POLICY_ADMINISTRATOR",
        type: "checkbox",
        required: false,
      },
      {
        label: "Super admin",
        name: "SUPER_ADMIN",
        type: "checkbox",
        required: false,
      },
      {
        label: "Claim supervisor",
        name: "CLAIM_SUPERVISOR",
        type: "checkbox",
        required: false,
      },
    ],
  },
];

export const userFilterOptions = {
  id: "user",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "AGENT", label: "Agent", checked: false },
    { filterValue: "CLAIM_ASSESSOR", label: "Claim Assessor", checked: false },
    { filterValue: "DEVELOPER", label: "Developer", checked: false },
    {
      filterValue: "POLICY_ADMINISTRATOR",
      label: "Policy Administrator",
      checked: false,
    },
    {
      filterValue: "CLAIM_SUPERVISOR",
      label: "Claim Supervisor",
      checked: false,
    },
    { filterValue: "SUPER_ADMIN", label: "Super Admin", checked: false },
    { filterValue: "archived", label: "Show archived", checked: false },
  ],
};

export const appFilterOptions = {
  id: "application",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "APPROVED", label: "Approved", checked: false },
    { filterValue: "PENDING", label: "Pending", checked: false },
    { filterValue: "REJECTED", label: "Rejected", checked: false },
  ],
};

export const policyFilterOptions = {
  id: "policy",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "ACTIVE", label: "Active", checked: false },
    { filterValue: "CANCELLED", label: "Cancel", checked: false },
  ],
};

export const claimFilterOptions = {
  id: "claim",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "OPEN", label: "Open", checked: false },
    { filterValue: "CLOSED", label: "Closed", checked: false },
    { filterValue: "FINALIZED", label: "Finalized", checked: false },
    { filterValue: "ACKNOWLEDGED", label: "Acknowledged", checked: false },
  ],
};
export const claimSupervisorFilterOptions = {
  id: "claim",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "CLOSED", label: "Closed", checked: false },
    { filterValue: "FINALIZED", label: "Finalized", checked: false },
    { filterValue: "ACKNOWLEDGED", label: "Acknowledged", checked: false },
  ],
};

export const paymentFilterOptions = {
  id: "payment",
  name: "Filter",
  options: [
    { sortValue: "id:asc", label: "Sort By Date", checked: false },
    { filterValue: "PENDING", label: "Pending", checked: false },
    { filterValue: "SUBMITTED", label: "Submitted", checked: false },
    { filterValue: "PROCESSING", label: "Processing", checked: false },
    { filterValue: "SUCCESSFUL", label: "Successful", checked: false },
    { filterValue: "FAILED", label: "Failed", checked: false },
    { filterValue: "CANCELLED", label: "Cancelled", checked: false },
  ],
};

export const employeeDataFilter = {
  id: "employee",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  ],
};

export const vehicleDataFilter = {
  id: "vehicle",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  ],
};

export const userColumn: IUserColumn[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "roles", label: "Roles" },
  { key: "createdAt", label: "Created at" },
];

export const callCenterColumn: IUserColumn[] = [
  { key: "callCenterName", label: "Call Center Name" },
  { key: "callCenterId", label: "Call Center Id" },
  { key: "totalCallcenterLeads", label: "Total Prospects" },
  { key: "totalDraftLeads", label: "Draft Prospects" },
  { key: "totalAcceptedLeads", label: "Accepted Prospects" },
  { key: "totalDeclinedLeads", label: "Declined Prospects" },
  { key: "totalinReviewLeads", label: "Prospects Inreview" },
  { key: "conversionPercentage", label: "Conversion percentage" },
  { key: "totalPremiumGenerated", label: "Total Premium Generated" },
];

export const employeeDataHeaders = [
  [
    "CellPhone",
    "Email",
    "FullName",
    "IDNumber",
    "SalaryRef",
    "Initials",
    "Username",
    "PreferredName",
    "Rank",
    "Status",
    "Surname",
    "Title",
  ],
];

export const vehicleDataHeaders = [
  [
    "AreaOffice",
    "EngineNumber",
    "Make",
    "MarketValue",
    "MMNumber",
    "Model",
    "RecordId",
    "RegistrationNumber",
    "RetailPrice",
    "TradePrice",
    "TransactionNumber",
    "VehicleRef",
    "VINNumber",
    "WRTYEnd",
    "WRTYStart",
    "YearModel",
    "VehicleNumber",
  ],
];

export const empolyeeData: IEmployeeDataColumn[] = [
  { key: "FullName", label: "Full Name" },
  { key: "IDNumber", label: "ID Number" },
  { key: "Email", label: "Email" },
  { key: "Title", label: "Title" },
  { key: "SalaryRef", label: "Salary Ref " },
  { key: "createdAt", label: "Created at" },
];
export const vehicleData: IVehicleDataColumn[] = [
  { key: "AreaOffice", label: "AreaOffice" },
  { key: "EngineNumber", label: "EngineNumber" },
  { key: "Make", label: "Make" },
  { key: "MarketValue", label: "MarketValue" },
  { key: "MMNumber", label: "MM Number" },
  { key: "Model", label: "Model" },
  { key: "createdAt", label: "Created at" },
];

export const editEmployeeDetails: any = [
  {
    label: "Phone",
    type: "text",
    name: "CellPhone",
    required: false,
  },
  {
    label: "Email",
    type: "text",
    name: "Email",
    required: false,
  },
  {
    label: "Full name",
    type: "text",
    name: "FullName",
    required: false,
  },
  {
    label: "ID Number",
    type: "text",
    name: "IDNumber",
    required: false,
  },
  {
    label: "Salary Ref",
    type: "text",
    name: "SalaryRef",
    required: false,
  },
  {
    label: "Initials",
    type: "text",
    name: "Initials",
    required: false,
  },
  {
    label: "User name",
    type: "text",
    name: "Username",
    required: false,
  },
  {
    label: "Preferred name",
    type: "text",
    name: "PreferredName",
    required: false,
  },
  {
    label: "Rank",
    type: "text",
    name: "Rank",
    required: false,
  },
  {
    label: "Status",
    type: "text",
    name: "Status",
    required: false,
  },
  {
    label: "Sur name",
    type: "text",
    name: "Surname",
    required: false,
  },
  {
    label: "Title",
    type: "text",
    name: "Title",
    required: false,
  },
];

export const complaintFilterOptions = {
  id: "claim",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "OPEN", label: "Open", checked: false },
    { filterValue: "CLOSED", label: "Closed", checked: false },
  ],
};

export const reportsFilterOptions = {
  id: "claim",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  ],
};

export const convertStringToDateFormate = (obj: any) => {
  if (typeof obj === "object" && obj !== null) {
    for (var key in obj) {
      if (
        typeof obj[key] === "string" &&
        obj[key].match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        obj[key] = new Date(obj[key]);
      } else if (typeof obj[key] === "object") {
        obj[key] = convertStringToDateFormate(obj[key]); // Recursively convert nested objects
      }
    }
  }
  return obj;
};

export const statusColorCoding = (action: string) => {
  switch (action) {
    case "APPROVED":
    case "PAYOUT_PROCESSED":
    case "ACTIVE":
    case "OPEN":
    case "FINALIZED":
    case "SUBMITTED":
    case "SUCCESSFUL":
      return "font-bold text-green-500";
    case "ACKNOWLEDGED":
    case "PENDING":
    case "PROCESSING":
      return "font-bold text-orange-500";
    case "LAPSED":
    case "REJECTED":
    case "CANCELLED":
    case "CLOSED":
    case "REPUDIATED":
    case "PAYOUT_BLOCKED":
    case "FAILED":
      return "font-bold text-red-500";
    case "REJECTED":
      return "font-bold text-red-500";
    case "DRAFT":
      return "font-bold text-orange-500";
    case "INREVIEW":
      return "font-bold text-yellow-500";
    case "DECLINED":
      return "font-bold text-red-500";
    case "ACCEPTED":
      return "font-bold text-green-500";
    case "REFUSED":
      return "font-bold text-red-500";
    case "CALL_SCHEDULED":
      return "font-bold text-orange-500";
    case "INTERESTED":
      return "font-bold text-green-800";
    case "EXPIRED":
      return "font-bold text-red-500";
    case "NOT_INTERESTED":
      return "font-bold text-red-800";
    default:
      return;
  }
};
export const validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const pagination = {
  pageSize: 9,
  offset: 0,
};

export const filterData = (filter: any, req: any) => {
  return Object.keys(filter).reduce((filterObj: any, key: any) => {
    if (req.includes(key)) {
      filterObj[key] = filter[key];
    }
    return filterObj;
  }, {});
};

export const checkPercentageTotal = (beneficiaries: any[]) => {
  var sum = beneficiaries?.reduce(function (total, beneficiary) {
    return total + beneficiary.percentage;
  }, 0);
  return sum === 100;
};

export const checkPreviousCurrentPercentageTotal = (
  beneficiaries1: any[],
  beneficiaries2: any[]
) => {
  const updatedBeneficiaries1 = beneficiaries1?.filter((beneficiary1) => {
    return !beneficiaries2.some(
      (beneficiary2) => beneficiary2.id === beneficiary1.id
    );
  });
  const sum1 = updatedBeneficiaries1?.reduce(
    (total, beneficiary) => total + beneficiary.percentage,
    0
  );
  const sum2 = beneficiaries2?.reduce(
    (total, beneficiary) => total + beneficiary.percentage,
    0
  );

  return sum1 + sum2 === 100;
};

export const calculateAgeBasedOnDOB = (dateOfBirth: Date) => {
  var today = new Date();
  var birthDate = new Date(dateOfBirth);
  var age = today?.getFullYear() - birthDate?.getFullYear();
  var hasBirthdayPassed =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());
  if (hasBirthdayPassed) {
    age--;
  }
  return age;
};

export const calculateAgeBasedOnSaid = (idNumber: string) => {
  var year = parseInt(idNumber.substring(0, 2));
  var month = parseInt(idNumber.substring(2, 4));
  var day = parseInt(idNumber.substring(4, 6));
  var currentYear = new Date().getFullYear();
  const fullYear = year <= currentYear - 2000 ? 2000 + year : 1900 + year;
  const dateOfBirth = new Date(fullYear, month - 1, day);
  return calculateAgeBasedOnDOB(dateOfBirth);
};

export const buildMainMember = (
  policyholderData: Policyholder,
  id?: string
) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    email,
    citizenshipId,
    createdAt,
    updatedAt,
  } = policyholderData ?? {};

  return {
    id: id ?? "",
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    dateOfBirth: dateOfBirth ?? null,
    email: email ?? "",
    said: citizenshipId ?? "",
    createdAt: createdAt ?? "",
    updatedAt: updatedAt ?? "",
  };
};

export const removeUndefinedAndAddUuidForJSON = () => {};
export interface IEventRequest {
  eventName: string;
  eventCategory: string;
  packageName: string;
  reqData: any;
}
export interface IKey {
  key: any;
}
export const paymentType = [
  "policyPremium",
  "claimPayOut",
  "policyPremiuRefund",
] as const;

export const AccessLevelsDefinition = {
  AGENT: {
    Admin: {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Application: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Policy: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Claim: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Complaints: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Payments: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  },
  POLICY_ADMINISTRATOR: {
    Admin: {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Application: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Policy: {
      canView: true,
      canCreate: false,
      canUpdate: true,
      canDelete: false,
    },
    Claim: {
      canView: true,
      canCreate: true,
      canUpdate: false,
      canDelete: false,
    },
    Complaints: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Payments: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  },
  CLAIM_ASSESSOR: {
    Admin: {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Application: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Policy: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Claim: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Complaints: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Payments: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  },
  CLAIM_SUPERVISOR: {
    Admin: {
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Application: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Policy: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    Claim: {
      canView: true,
      canCreate: false,
      canUpdate: true,
      canDelete: false,
    },
    Complaints: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Payments: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  },
  DEVELOPER: {
    Admin: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Application: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Policy: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    },
    Claim: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Complaints: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Payments: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  },
  SUPER_ADMIN: {
    Admin: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Application: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Policy: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Claim: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Complaints: {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    },
    Payments: {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  },
};

interface AccessLevels {
  GET: boolean;
  POST: boolean;
  PUT: boolean;
  DELETE: boolean;
}
interface RoleAccessLevels {
  user: AccessLevels;
  application: AccessLevels;
  policy: AccessLevels;
  claim: AccessLevels;
  complaint: AccessLevels;
  payment: AccessLevels;
  upload: AccessLevels;
  policyholder: AccessLevels;
  premiumCalculator: AccessLevels;
  extendedFamilyPremiumCalculator: AccessLevels;
  quotation: AccessLevels;
  reports: AccessLevels;
  accessLevels: AccessLevels;
  twoFA: AccessLevels;
}

interface IApiAccessLevels {
  AGENT: RoleAccessLevels;
  POLICY_ADMINISTRATOR: RoleAccessLevels;
  CLAIM_ASSESSOR: RoleAccessLevels;
  CLAIM_SUPERVISOR: RoleAccessLevels;
  DEVELOPER: RoleAccessLevels;
  SUPER_ADMIN: RoleAccessLevels;
}
function generateAccessObject(
  getValue: boolean,
  postValue: boolean,
  putValue: boolean,
  deleteValue: boolean
) {
  return {
    GET: getValue,
    POST: postValue,
    PUT: putValue,
    DELETE: deleteValue,
  };
}

function generateAPILayerAccessLevels(trueValue: boolean, falseValue: boolean) {
  return {
    AGENT: {
      user: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      lead: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      application: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      policy: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      claim: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      complaint: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      payment: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      upload: generateAccessObject(
        trueValue,
        trueValue,
        falseValue,
        falseValue
      ),
      policyholder: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      quotation: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      premiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      extendedFamilyPremiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      reports: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      accessLevels: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      twoFA: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      paymentactions: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      callCenter: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      devicecatalog: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      employeedata: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
    },
    POLICY_ADMINISTRATOR: {
      user: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      lead: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      application: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      policy: generateAccessObject(
        trueValue,
        falseValue,
        trueValue,
        falseValue
      ),
      claim: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      complaint: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      payment: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      upload: generateAccessObject(
        trueValue,
        trueValue,
        falseValue,
        falseValue
      ),
      policyholder: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      quotation: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      premiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      extendedFamilyPremiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      reports: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      accessLevels: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      twoFA: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      paymentactions: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      callCenter: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      devicecatalog: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      employeedata: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
    },
    CLAIM_ASSESSOR: {
      user: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      lead: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      application: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      policy: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      claim: generateAccessObject(trueValue, trueValue, trueValue, falseValue),
      complaint: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      payment: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      upload: generateAccessObject(
        trueValue,
        trueValue,
        falseValue,
        falseValue
      ),
      policyholder: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      quotation: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      premiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      extendedFamilyPremiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      reports: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      accessLevels: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      twoFA: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      paymentactions: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      callCenter: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      devicecatalog: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      employeedata: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
    },
    CLAIM_SUPERVISOR: {
      user: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      lead: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      application: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      policy: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      claim: generateAccessObject(trueValue, trueValue, trueValue, falseValue),
      complaint: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      payment: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      upload: generateAccessObject(
        trueValue,
        trueValue,
        falseValue,
        falseValue
      ),
      policyholder: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      quotation: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      premiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      extendedFamilyPremiumCalculator: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      reports: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      accessLevels: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      twoFA: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      paymentactions: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      callCenter: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      devicecatalog: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
      employeedata: generateAccessObject(
        falseValue,
        falseValue,
        falseValue,
        falseValue
      ),
    },
    DEVELOPER: {
      user: generateAccessObject(trueValue, trueValue, trueValue, falseValue),
      lead: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      application: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      policy: generateAccessObject(trueValue, trueValue, trueValue, falseValue),
      claim: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      complaint: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      payment: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        falseValue
      ),
      upload: generateAccessObject(trueValue, trueValue, trueValue, falseValue),
      policyholder: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      quotation: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        falseValue
      ),
      premiumCalculator: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      extendedFamilyPremiumCalculator: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      reports: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      accessLevels: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      twoFA: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      paymentactions: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      callCenter: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      devicecatalog: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      employeedata: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
    },
    SUPER_ADMIN: {
      user: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      lead: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      application: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      policy: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      claim: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      complaint: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      payment: generateAccessObject(
        trueValue,
        falseValue,
        falseValue,
        trueValue
      ),
      upload: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      policyholder: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      quotation: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      premiumCalculator: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      extendedFamilyPremiumCalculator: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      reports: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      accessLevels: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      twoFA: generateAccessObject(trueValue, trueValue, trueValue, trueValue),
      paymentactions: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      callCenter: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      devicecatalog: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      employeedata: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
      contacts: generateAccessObject(
        trueValue,
        trueValue,
        trueValue,
        trueValue
      ),
    },
  };
}
export const APILayerAccessLevelsDefinition = generateAPILayerAccessLevels(
  true,
  false
);

export function combineAccessLevelsForRoles(
  roles: UserRole[],
  accessLevels: any
) {
  const combinedRoleAccessLevels = {} as any;

  for (const role of roles) {
    const roleAccessLevels = accessLevels[role];
    if (roleAccessLevels) {
      for (const key in roleAccessLevels) {
        if (!combinedRoleAccessLevels[key as any]) {
          combinedRoleAccessLevels[key] = {
            GET: false,
            POST: false,
            PUT: false,
            DELETE: false,
          };
        }

        for (const operation in roleAccessLevels[key]) {
          combinedRoleAccessLevels[key][operation] ||=
            roleAccessLevels[key][operation];
        }
      }
    }
  }

  return combinedRoleAccessLevels;
}

export const eventNotificationTemplate = async (
  ctx: any,
  eventRequest: IEventRequest,
  base64?: any,
  attachments?: any,
  mailid?: string
) => {
  try {
    const response = await ctx.prisma.eventNotification.findFirst({
      where: {
        eventName: eventRequest?.eventName,
        eventCategory: eventRequest?.eventCategory,
        packageName: eventRequest?.packageName,
        isArchived: false,
      },
    });

    if (response) {
      return await performEventAPIRequests(
        ctx,
        response,
        eventRequest?.reqData,
        base64,
        attachments,
        mailid
      );
    } else {
      throw "No event notification data found";
    }
  } catch (error) {
    logError(`Error log at email response ${JSON.stringify(error)}`);
    throw error;
  }
};

async function performEventAPIRequests(
  ctx: any,
  eventResponse: IEventNotification,
  reqData: any,
  base64: any,
  attachments: any,
  mailid?: string
) {
  const activityLogs: any[] = [];
  try {
    const promises = [];
    const { emails, phoneNumbers } = getEmailsAndPhoneNumbers(
      reqData,
      eventResponse.eventCategory
    );
    if (eventResponse.emailNotification) {
      const emailPromise = emailSendGenerator(
        reqData,
        mailid ?? emails,
        eventResponse,
        base64,
        attachments
      )
        .then((emailResponse) => {
          if (emailResponse.status) {
            activityLogs.push({
              id: reqData.id,
              name: "Mail sent successfully",
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            });
            return emailResponse;
          } else {
            activityLogs.push({
              id: reqData.id,
              name: "Mail sent failed",
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            });
            return emailResponse;
          }
        })
        .catch((error) => {
          activityLogs.push({
            id: reqData.id,
            name: "Mail sent failed",
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          });
          return null;
        });
      promises.push(emailPromise);
    }
    if (eventResponse.smsNotification) {
      const smsPromise: any = smsSendGenerator(
        reqData,
        phoneNumbers,
        eventResponse
      )
        .then((smsResponse) => {
          if (smsResponse) {
            activityLogs.push({
              id: reqData.id,
              name: "Sms sent successfully",
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            });
            return smsResponse;
          } else {
            activityLogs.push({
              id: reqData.id,
              name: "Sms sent failed",
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            });
            return smsPromise;
          }
        })
        .catch((error) => {
          activityLogs.push({
            id: reqData.id,
            name: "Sms sent failed",
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          });
          return null;
        });

      promises.push(smsPromise);
    }
    const promiseResponse = await Promise.all(promises);
    if (promiseResponse && promiseResponse?.length > 0) {
      await createActivities(
        ctx,
        eventResponse.eventCategory,
        activityLogs, //data
        promiseResponse
      );
      logInfo(
        `Response for EMAIL and  SMS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(activityLogs)}`
      );
      return {
        status: true,
        message: `Mail sent Successfully to ${promiseResponse}`,
      };
    }
    logError(
      `Error in EMAIL and  SMS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and response: ${JSON.stringify(activityLogs)}`
    );
    return { status: false, message: "No active events are there" };
  } catch (error) {
    logError(
      `Error in EMAIL and  SMS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and response: ${JSON.stringify(error)}`
    );
    return { status: false, message: error };
  }
}

async function createActivities(
  ctx: any,
  category: string,
  data: any[],
  promiseResponse: any
) {
  let activitiesResponse;
  switch (category) {
    case "POLICY":
      activitiesResponse = await ctx.prisma.policyActivity.createMany({
        data: data.map((item) => ({
          policyId: item.id,
          name: item.name,
          description: { data: promiseResponse },
          createdById: item.createdById,
        })),
      });
      break;
    case "APPLICATION":
      activitiesResponse = await ctx.prisma.applicationActivity.createMany({
        data: data.map((item) => ({
          applicationId: item.id,
          name: item.name,
          description: { data: promiseResponse },
          createdById: item.createdById,
        })),
      });
      break;
    case "LEAD":
      activitiesResponse = await ctx.prisma.leadActivity.createMany({
        data: data.map((item) => ({
          leadsId: item.id,
          name: item.name,
          description: { data: promiseResponse },
          createdById: item.createdById,
        })),
      });
      break;
    case "CLAIM":
      activitiesResponse = await ctx.prisma.claimActivity.createMany({
        data: data.map((item) => ({
          claimId: item.id,
          name: item.name,
          description: { data: promiseResponse },
          createdById: item.createdById,
        })),
      });
      break;
    case "POLICYHOLDER":
      activitiesResponse = await ctx.prisma.policyholderActivity.createMany({
        data: data.map((item) => ({
          policyholderId: item.id,
          name: item.name,
          createdById: item.createdById,
        })),
      });
      break;
    default:
      throw new Error("Invalid event category name");
  }
  return activitiesResponse;
}

export function exclude<User, Key extends keyof any>(
  user: any,
  keys: any[]
): any {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key))
  );
}
export const getEmailsAndPhoneNumbers = (
  reqData: {
    policies: {
      beneficiaries: any;
      policyholder: { email: string; phone: string };
    };
    policyholder: { email: string; phone: string };
  },
  eventCategory: string
) => {
  let emails = "";
  let phoneNumbers = "";

  if (eventCategory === "CLAIM") {
    const beneficiaries = reqData?.policies?.beneficiaries;
    const beneficiaryEmails =
      beneficiaries?.length > 0 &&
      beneficiaries.map((beneficiary: { email: string }) => beneficiary?.email);
    const beneficiaryPhoneNumbers =
      beneficiaries?.length > 0 &&
      beneficiaries.map((beneficiary: { phone: string }) => beneficiary?.phone);

    if (beneficiaryEmails) {
      const validBeneficiaryEmails = beneficiaryEmails.filter(
        (email: string) => email
      );
      const uniqueBeneficiaryEmails = Array.from(
        new Set(validBeneficiaryEmails)
      );
      emails += uniqueBeneficiaryEmails.join(",");
    }

    if (beneficiaryPhoneNumbers) {
      const validBeneficiaryPhoneNumbers = beneficiaryPhoneNumbers.filter(
        (phoneNumber: string) => phoneNumber
      );
      const uniqueBeneficiaryPhoneNumbers = Array.from(
        new Set(validBeneficiaryPhoneNumbers)
      ).map((phoneNumber: any) => phoneNumber.replace(/\s/g, ""));
      phoneNumbers += uniqueBeneficiaryPhoneNumbers.join(",");
    }

    const policyholderEmail = reqData?.policies?.policyholder?.email;
    const policyholderPhoneNumber = reqData?.policies?.policyholder?.phone;

    if (policyholderEmail) {
      const trimmedPolicyholderEmail = policyholderEmail.trim();
      if (!emails.includes(trimmedPolicyholderEmail)) {
        emails +=
          emails.length > 0
            ? "," + trimmedPolicyholderEmail
            : trimmedPolicyholderEmail;
      }
    }

    if (policyholderPhoneNumber) {
      const trimmedPolicyholderPhoneNumber = policyholderPhoneNumber
        .trim()
        .replace(/\s/g, "");
      if (!phoneNumbers.includes(trimmedPolicyholderPhoneNumber)) {
        phoneNumbers +=
          phoneNumbers.length > 0
            ? "," + trimmedPolicyholderPhoneNumber
            : trimmedPolicyholderPhoneNumber;
      }
    }
  } else {
    const policyholderEmail = reqData?.policyholder?.email;
    const policyholderPhoneNumber = reqData?.policyholder?.phone;

    if (policyholderEmail) {
      const trimmedPolicyholderEmail = policyholderEmail.trim();
      emails += trimmedPolicyholderEmail;
    }

    if (policyholderPhoneNumber) {
      const trimmedPolicyholderPhoneNumber = policyholderPhoneNumber
        .trim()
        .replace(/\s/g, "");
      phoneNumbers += trimmedPolicyholderPhoneNumber;
    }
  }

  const uniqueEmails = Array.from(new Set(emails.split(","))).join(",");
  const uniquePhoneNumbers = Array.from(new Set(phoneNumbers.split(","))).join(
    ","
  );

  return {
    emails: uniqueEmails,
    phoneNumbers: uniquePhoneNumbers,
  };
};

export const checkObjectValueInString = (inputString: string, data: any) => {
  return inputString?.replace(
    /\{\{(\w+(\.\w+)*)\}\}/g,
    (match, placeholder) => {
      const path = placeholder?.split(".");
      let currentObj = data;
      for (const prop of path) {
        if (currentObj && currentObj.hasOwnProperty(prop)) {
          currentObj = currentObj?.[prop];
        } else {
          return ""; // Return an empty string instead of the original placeholder
        }
      }
      return currentObj !== null && currentObj !== undefined ? currentObj : "";
    }
  );
};

export const NotificationHeader: IColumn[] = [
  { key: "event", label: "EVENT" },
  { key: "emailNotification ", label: "EMAIL NOTIFICATION" },
  { key: "", label: "" },
  { key: "smsNotification", label: "SMS NOTIFICATION" },
  { key: "", label: "" },
];

export const EventNames: any = {
  POLICY_ISSUED: "Policy issued",
  POLICY_BENEFICIARY_UPDATED: "Policy beneficiary updated",
  POLICY_POLICYHOLDER_UPDATED: "Policy policyholder updated",
  POLICY_UPDATED: "Policy updated",
  POLICY_CANCELLED: "Policy Canceled",
  CLAIM_APPROVED: "Claim approved",
  CLAIM_RECEIVED: "Claim received",
  CLAIM_REPUDIATED: "Claim repudiated",
  CLAIM_SENT_TO_REVIEW_CLAIMENT: "Claim sent to review claiment",
  LEAD_ACCEPTED: "Lead accepted",
  LEAD_UNATTENDED: "Lead is not attended",
  LEAD_REFUSED: "Lead refused",
  APPLICATION_UNATTENDED: "Application unattended",
};

export const notificationOptions = {
  id: "eventNotification",
  name: "Filter",
  options: [
    { filterValue: "POLICY", label: "Policy", checked: false },
    { filterValue: "CLAIM", label: "Claim", checked: false },
    { filterValue: "APPLICATION", label: "Application", checked: false },
    { filterValue: "COMPLAINT", label: "Complaint", checked: false },
    { filterValue: "POLICYHOLDER", label: "Policyholder", checked: false },
    { filterValue: "LEAD", label: "Leads", checked: false },
  ],
};

export const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export const pageTitle = "Telkom";

export const paymentTabs = [
  { id: "paymentDetails", label: "Payment Details" },
  { id: "prevAccountDetails", label: "Previous Account Details" },
];

export const employeeFuneralAges = {
  mainMember: {
    minAge: 18,
    maxAge: 64,
  },
  spouse: {
    minAge: 18,
    maxAge: 64,
  },
  children: {
    minAge: 0,
    maxAge: 21,
    studyingMinAge: 22,
    studyingMaxAge: 25,
    disabledMinAge: 26,
    disabledMaxAge: 100,
  },
  extendedFamily: {
    minAge: 0,
    maxAge: 74,
  },
};

export const defaultCallCenter = 0;

export const packageNameOptions = {
  label: "Package Name",
  type: "select",
  name: "packageName",
  required: true,
  options: [
    {
      label: "Employee Motor Insurance",
      value: "EMPLOYEE_MOTOR_INSURANCE",
    },
    {
      label: "Employee Funeral Insurance",
      value: "EMPLOYEE_FUNERAL_INSURANCE",
    },
    {
      label: "Employee Device Insurance",
      value: "EMPLOYEE_DEVICE_INSURANCE",
    },
    {
      label: "Employee Motor Credit life",
      value: "EMPLOYEE_MOTOR_CREDITLIFE",
    },
    {
      label: "Employee device credit life",
      value: "EMPLOYEE_DEVICE_CREDITLIFE",
    },
    {
      label: "Device insurance",
      value: "DEVICE_INSURANCE",
    },
    {
      label: "Device creditlife",
      value: "DEVICE_CREDITLIFE",
    },
  ],
};

export const inputPackageName = {
  label: "Package Name",
  type: "select",
  name: "packageName",
  required: true,
  options: [
    { label: "Select", value: "" },
    {
      label: "Employee Motor Insurance",
      value: "EMPLOYEE_MOTOR_INSURANCE",
    },
    {
      label: "Employee Funeral Insurance",
      value: "EMPLOYEE_FUNERAL_INSURANCE",
    },
    {
      label: "Employee Device Insurance",
      value: "EMPLOYEE_DEVICE_INSURANCE",
    },
    {
      label: "Device insurance",
      value: "DEVICE_INSURANCE",
    },
    {
      label: "Device creditlife",
      value: "DEVICE_CREDITLIFE",
    },
  ],
};

export const merge = (
  a: any,
  b: any,
  predicate = (a: any, b: any) => a === b
) => {
  const c = [...a];
  b.forEach((bItem: any) =>
    c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)
  );
  return c;
};

export const inputpackages = [
  {
    label: "Package Name",
    type: "select",
    name: "packageName",
    required: true,
    options: [] as IOption[],
  },
];

export const editPackageRulesInput = [
  {
    label: "Rule start date",
    type: "date",
    name: "ruleStartDate",
    required: true,
  },
];

export const packageRuleLimits = [
  {
    label: "Min value",
    type: "text",
    name: "minValue",
    required: true,
  },
  {
    label: "Max value",
    type: "text",
    name: "maxValue",
    required: true,
  },
  {
    label: "Free Cover Benefit Amount",
    type: "text",
    name: "freeCoverBenefitAmount",
    required: true,
  },
  {
    label: "Free Cover Premium",
    type: "text",
    name: "freeCoverPremium",
    required: true,
  },
  {
    label: "Additional Cover Percentage",
    type: "text",
    name: "aditionalCoverPercentage",
    required: true,
  },
];
export const updateInputpackages = [
  {
    label: "Package Name",
    type: "text",
    name: "packageName",
    required: true,
    disabled: true,
    // options: [] as IOption[],
  },
  {
    label: "Free Cover Benefit Amount",
    type: "text",
    name: "freeCoverBenefitAmount",
    required: true,
  },
  {
    label: "Free Cover Premium",
    type: "text",
    name: "freeCoverPremium",
    required: true,
  },
  {
    label: "Additional Cover Percentage",
    type: "text",
    name: "aditionalCoverPercentage",
    required: true,
  },
];

export const packageNames = {
  funeral: "EMPLOYEE_FUNERAL_INSURANCE",
  device: "EMPLOYEE_DEVICE_INSURANCE",
  motor: "EMPLOYEE_MOTOR_INSURANCE",
  creditLifeMotor: "EMPLOYEE_MOTOR_CREDITLIFE",
  creditLifeDevice: "EMPLOYEE_DEVICE_CREDITLIFE",
  retailDeviceInsurance: "DEVICE_INSURANCE",
  retailDeviceCreditLife: "DEVICE_CREDITLIFE",
};

export const PackageNamesObject: any = {
  EMPLOYEE_FUNERAL_INSURANCE: "Employee funeral package",
  EMPLOYEE_MOTOR_INSURANCE: "Employee motor package",
  EMPLOYEE_DEVICE_INSURANCE: "Employee device package",
  EMPLOYEE_MOTOR_CREDITLIFE: "Employee motor credit life",
  EMPLOYEE_DEVICE_CREDITLIFE: "Employee device credit life",
  DEVICE_INSURANCE: "Device insurance",
  DEVICE_CREDITLIFE: "Device creditlife",
};

export const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

export const twoFAEnabledString = "2FA Enabled";
export const wrongPasswordString = "Wrong Password";
export const smsEnabledString = "SMS Enabled";

export const maxFileSize = 8; //8mb

export const PaymentMethodType = [
  "DEBIT_FROM_SALARY",
  "DEBIT_FROM_BANK_ACCOUNT",
] as const;

// Function to generate a CSV file from the data
export const downloadCsv = (dataRows: any[], headings: string[]) => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent([headings, ...dataRows].join("\n"));
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", csvContent);
  downloadLink.setAttribute(
    "download",
    `data_${new Date().toLocaleDateString()}.csv`
  );
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export const extractMimeType = (dataUri: string) => {
  const parts = dataUri?.split(";");
  const mimeType = parts[0]?.split(":")[1];
  return mimeType;
};

export const b64toBlob = (b64Data: string, sliceSize = 512) => {
  const base64String = b64Data?.includes(",") ? b64Data?.split(",")[1] : "";
  const contentType = b64Data?.includes(",")
    ? extractMimeType(b64Data?.split(",")[0] as string)
    : "";

  const byteArrays = [];
  if (base64String) {
    const byteCharacters = atob(base64String);
    for (let offset = 0; offset < byteCharacters?.length; offset += sliceSize) {
      const slice = byteCharacters?.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice?.length; i++) {
        byteNumbers[i] = slice?.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const correctedLabels: any = {
  EMPLOYEE_DEVICE_CREDITLIFE: "EMPLOYEE_DEVICE_CREDIT_LIFE",
  DEVICE_CREDITLIFE: "DEVICE_CREDIT_LIFE",
  EMPLOYEE_MOTOR_CREDITLIFE: "EMPLOYEE_MOTOR_CREDIT_LIFE",
};

export const currencyLabels: any = [
  "requestedAmount",
  "grantedAmount",
  "loanSettlementAtInception",
  "outstandingSettlementBalance",
  "freeBenefitPremium",
  "totalPremium",
  "additionalPremium",
  "basePremium",
];
export const validateCSVData = (formData: string) => {
  const startMarker = "Content-Type: text/csv";
  const endMarker = "----------------------------";

  const startIndex = formData.indexOf(startMarker);
  const endIndex = formData.indexOf(endMarker, startIndex + startMarker.length);

  const validationConditions = [
    {
      condition: startIndex === -1,
      errorMessage: `Please selecte the valid 'Content-Type: text/csv' file.`,
    },
    {
      condition: endIndex === -1 || endIndex <= startIndex,
      errorMessage: "Invalid content format.",
    },
  ];

  for (const condition of validationConditions) {
    if (condition.condition) {
      throw new Error(condition.errorMessage);
    }
  }
  const csvContent = formData
    .substring(startIndex + startMarker.length, endIndex)
    .trim();
  return csvContent;
};

export const csvPaymentHeaders = [
  "amount",
  "freeBenefit",
  "balance",
  "policyNumber",
  "actionDate",
  "salaryReference",
  "status",
  "failureReason",
];

export const paymentState = {
  posted: "POSTED",
  notPosted: "NOT_POSTED",
};

export const paymentStatusObject = {
  submitted: "SUBMITTED",
  pending: "PENDING",
  processing: "PROCESSING",
  successful: "SUCCESSFUL",
  failed: "FAILED",
  cancelled: "CANCLLED",
};

export const listColumn: IColumn[] = [
  {
    key: ["policyholder.firstName", "policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "policyData.packageName", label: "Package name" },
  { key: "status", label: "Status" },
  { key: "policyNumber", label: "Policy number" },
  { key: "startDate", label: "Start date" },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
  { key: "createdAt", label: "Created at" },
];

export const leadListColumn: IColumn[] = [
  {
    key: ["policyholder.firstName", "policyholder.lastName"],
    label: "Policyholder",
  },
  { key: "applicationData.packageName", label: "Package name" },
  { key: "status", label: "Status" },
  { key: "leadNumber", label: "Lead number" },
  { key: "startDate", label: "Start date" },
  { key: ["createdBy.firstName", "createdBy.lastName"], label: "Created by" },
  { key: "createdAt", label: "Created at" },
];

export const leadFilterOptions = {
  id: "lead",
  name: "Filter",
  options: [
    { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "DRAFT", label: "Draft", checked: false },
    { filterValue: "REFUSED", label: "Refused", checked: false },
    { filterValue: "INREVIEW", label: "Inreview", checked: false },
    { filterValue: "DECLINED", label: "Declined", checked: false },
    { filterValue: "ACCEPTED", label: "Accepted", checked: false },
  ],
};
export const none = {
  label: "none",
  type: "checkbox",
  name: "addNone",
  required: false,
};

export const agent = {
  label: "Agent",
  type: "checkbox",
  name: "addAgent",
  required: false,
};

export const agentLead = {
  label: "Lead",
  type: "checkbox",
  name: "addLead",
  required: false,
};

export const agentManager = {
  label: "Manager",
  type: "checkbox",
  name: "addManager",
  required: false,
};

export const addUserFormInputs = [
  {
    label: "First Name",
    type: "text",
    name: "firstName",
    required: true,
  },
  {
    label: "Last Name",
    type: "text",
    name: "lastName",
    required: true,
  },
  {
    label: "Email",
    type: "email",
    name: "email",
    required: true,
  },
  {
    label: "Password",
    type: "password",
    name: "password",
    required: false,
  },
  {
    label: "Confirm Password",
    type: "password",
    name: "confirmPassword",
    required: false,
  },
  {
    label: "Phone number",
    type: "phone",
    name: "phone",
    required: true,
  },
  {
    label: "Package Name",
    type: "multi-select",
    name: "packageName",
    required: true,
    multipleOptions: [
      {
        label: "Employee motor insurance",
        type: "checkbox",
        name: "EMPLOYEE_MOTOR_INSURANCE",
        required: false,
      },
      {
        label: "Employee funeral insurance",
        type: "checkbox",
        name: "EMPLOYEE_FUNERAL_INSURANCE",
        required: false,
      },
      {
        label: "Employee device insurance",
        type: "checkbox",
        name: "EMPLOYEE_DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Employee motor credit life",
        type: "checkbox",
        name: "EMPLOYEE_MOTOR_CREDITLIFE",
        required: false,
      },
      {
        label: "Employee device credit life",
        type: "checkbox",
        name: "EMPLOYEE_DEVICE_CREDITLIFE",
        required: false,
      },
      {
        label: "Device insurance",
        type: "checkbox",
        name: "DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Device creditlife",
        type: "checkbox",
        name: "DEVICE_CREDITLIFE",
        required: false,
      },
    ],
  },
];

export const addUserCheckbox = [
  { label: "Agent", type: "checkbox", name: "agent", required: false },
  {
    label: "Lead",
    type: "checkbox",
    name: "lead",
    required: false,
  },
  {
    label: "Manager",
    type: "checkbox",
    name: "manager",
    required: false,
  },
];

export const agentColumn: IColumn[] = [
  { key: "agentName", label: "Agent Name" },
  { key: "agentId", label: "Agent Id" },
  { key: "agentRoleType", label: "Agent Role" },
  { key: "totalLeads", label: "Total Prospects" },
  { key: "acceptedLeads", label: "Accepted Prospects" },
  { key: "draftLeads", label: "Draft Prospects" },
  { key: "inReviewLeads", label: "Inreview Prospects" },
  { key: "declinedLeads", label: "Declined Prospects" },
  { key: "convertionRate", label: "Convertion Rate" },
  {
    key: "totalPremiumOfAcceptedLeads",
    label: "Total Premium of Accepted Prospects",
  },
];

export const leadTabs = [
  {
    name: "leadDetails",
    label: "Prospect Details",
    key: "1",
    currentTab: false,
  },
  {
    name: "paymentMethod",
    label: "Payment Method",
    key: "2",
    currentTab: false,
  },
  {
    name: "beneficiaries",
    label: "Beneficiaries",
    key: "3",
    currentTab: false,
  },
  { name: "documents", label: "Documents", key: "4", currentTab: false },
];

export const contactsColumn: IColumn[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  // { key: ["callCenter.name"], label: "Call center" },
  { key: "status", label: "status" },
  { key: "phone", label: "Phone" },
  { key: "typeOfDevice", label: "Type of device" },
  { key: "dateOfPurchase", label: "Date of purchase" },
  // { key: "planType", label: "Plan type" },
  { key: "model", label: "Model" },
  { key: "imei", label: "Imei" },
  // { key: "productCode", label: "Product code" },
  // { key: "order", label: "Order" },
  // { key: "masterDealer", label: "Master Dealer" },
  // { key: "dealerRegion", label: "Dealer Region" },
  // { key: "distribution", label: "Distribution" },
  // { key: "banNumber", label: "Ban number" },
];

export const contactStatus = [
  "OPEN",
  "INTERESTED",
  "NOT_INTERESTED",
  "CALL_SCHEDULED",
  "EXPIRED",
] as const;

export const contactFilterOptions = {
  id: "contacts",
  name: "Filter",
  options: [
    // { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
    { filterValue: "OPEN", label: "Open", checked: false },
    { filterValue: "INTERESTED", label: "Interested", checked: false },
    { filterValue: "NOT_INTERESTED", label: "Not interested", checked: false },
    { filterValue: "CALL_SCHEDULED", label: "Call scheduled", checked: false },
    { filterValue: "EXPIRED", label: "Expired", checked: false },
  ],
};

export const emplyoeePackageNames: string[] = [
  "EMPLOYEE_FUNERAL_INSURANCE",
  "EMPLOYEE_DEVICE_INSURANCE",
  "EMPLOYEE_DEVICE_CREDITLIFE",
  "EMPLOYEE_MOTOR_INSURANCE",
  "EMPLOYEE_MOTOR_CREDITLIFE",
];
