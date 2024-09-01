import { TRPCError } from "@trpc/server";
import { packageName, pagination, telkomFreeBenefit } from "../constants";
import { IQueryOptions, ISearchKeys, ISearchParams } from "~/interfaces/common";
import { prisma } from "~/server/db";
import { PackageName, Prisma, UserRole } from "@prisma/client";
import { IOption } from "~/interfaces/common/form";
import { api } from "../api";
import fs from "fs";
import path from "path";
import { logError, logInfo } from "~/server/api/constants/logger";
import * as XLSX from "xlsx";
const os = require("os");

export function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export const generateMonthArray = () => {
  let arr: any = [{ label: "Select", value: "" }];
  for (let i = 1; i < 31; i++) {
    arr.push({ label: i, value: i });
  }
  return arr;
};

export const dateConversion = (date: any) => {
  // if(date === null || date === undefined){
  //   return null;
  // }
  const dateOfBirth = date;
  const dob = new Date(dateOfBirth);
  const year = dob.getFullYear();
  const month = String(dob.getMonth() + 1).padStart(2, "0");
  const day = String(dob.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  // if(date === null){
  //   return null;
  // }
  return formattedDate;
};

export const checkString = (arr: number[], input: any) => {
  for (let i = 0; i < arr.length; i++) {
    if (input?.startsWith(arr[i])) {
      return true;
    }
  }
  return false;
};

export const dateFormatRegex =
  /^([A-Za-z]{3})\s([A-Za-z]{3})\s(\d{2})\s(\d{4})\s(\d{2}):(\d{2}):(\d{2})\sGMT[+-]\d{4}\s\([A-Za-z\s]+\)$/;

export const valueChecker = (value: any) => {
  if (
    value !== "" &&
    value?.length !== 0 &&
    value !== "null" &&
    value !== undefined
  ) {
    return true;
  } else {
    return false;
  }
};

export const capitalizedConvertion = (str: any) => {
  if (str == "otp_enabled") {
    return "OTP Enabled";
  }
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^\s*/, "")
    .replace(/(?:^|\s)\S/g, function (match: any) {
      return match.toUpperCase();
    });
};

export function Capitalize(input: any) {
  // Remove special characters using regular expression
  const cleanedString = input.replace(/[^\w\s]/g, "");

  // Capitalize the first letter of each word and convert underscores to spaces
  const words = cleanedString.split("_");
  const capitalizedWords = words.map(
    (word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  return capitalizedWords.join(" ");
}

export const calculateDaysBetweenDates = (startDate: any, endDate: any) => {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const timeDiff = endDateObj.getTime() - startDateObj.getTime();
  const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
  const daysInMonth = 30.4375;
  const months = Math.floor(daysDiff / daysInMonth);
  return months <= 0 ? 1 : months;
};

export const handleApiResponseError = (error: any): void => {
  if (error === null) {
    if (error.inputError != "") {
      throw new TRPCError({
        message: error.inputError,
        code: "NOT_FOUND",
        cause: 404,
      });
    } else {
      throw new TRPCError({
        message: "No data found",
        code: "NOT_FOUND",
        cause: 404,
      });
    }
  }
  switch (error.code) {
    case "P2002":
      throw new TRPCError({
        message: `Duplicate entry for ${error.meta.target[0]}`,
        code: "CONFLICT",
        cause: 409,
      });
    case "P2025":
      throw new TRPCError({
        message: `${error.meta.cause}`,
        code: "NOT_FOUND",
        cause: 404,
      });
    default:
      throw error;
  }
};

export const listSearchParams = (
  searchValues: ISearchParams,
  searchKeys: ISearchKeys
) => {
  const filters = searchValues?.filter.split(",");
  function checkAndRemoveArchived(array: string[]) {
    const hasArchived = array.includes("archived");
    const newArray = array.filter((item) => item !== "archived");
    return { hasArchived, newArray };
  }
  const { hasArchived, newArray } = checkAndRemoveArchived(filters);
  const queryOptions: IQueryOptions = {
    take: Number(
      searchValues?.pageSize ? searchValues?.pageSize : pagination.pageSize
    ),
    skip: Number(
      searchValues?.offset ? searchValues?.offset : pagination.offset
    ),
    orderBy: {
      createdAt: "desc",
    },
    where: {
      ...(hasArchived ? { isArchived: true } : { isArchived: false }),
    },
    include: {
      reportingUsers: true,
      reportsTo: true,
    },
  };
  if (searchValues?.filter) {
    const filterName = searchKeys.filter as string;
    // const filterArray = searchValues?.filter.split(",");
    queryOptions.where = {
      ...queryOptions.where,
      [filterName]: {
        hasSome: newArray,
      },
    };
  }
  if (searchValues?.packageName) {
    const filterName = searchKeys.packageName as string;
    const filterArray = searchValues?.filter.split(",");
    queryOptions.where = {
      ...queryOptions.where,
      [filterName]: {
        in: filterArray,
      },
    };
  }

  if (searchValues?.companyId) {
    queryOptions.where = {
      ...queryOptions.where,
      callCenterId: {
        equals: searchValues?.companyId,
      },
    };
  }

  if (
    searchValues?.search &&
    searchKeys?.search &&
    searchKeys?.search?.length > 0
  ) {
    searchKeys?.search.forEach((key) => {
      queryOptions.where = {
        ...queryOptions.where,
        OR: [
          ...(queryOptions.where?.OR || []),
          {
            [key]: {
              contains: searchValues?.search,
              mode: "insensitive",
            },
          },
        ],
      };
    });
  }

  if (searchValues?.sort) {
    const [field, order]: any = searchValues?.sort.split(":");
    queryOptions.orderBy = {
      [field]: order === "desc" ? "desc" : "asc",
    };
  }
  return queryOptions;
};

export const removeSpecialCharsAndTitleCase = (input: any) => {
  const cleanedString = input?.replace(/[^A-Za-z0-9\s]/g, "").toLowerCase();

  const spaceSeparatedString = cleanedString?.replace(/_/g, " ");

  const titleCaseString = spaceSeparatedString?.replace(/\b\w/g, (match: any) =>
    match.toUpperCase()
  );

  return titleCaseString;
};

export const freeBenefitPremiumCalculation = async (ctx: any) => {
  try {
    const response: any = await ctx.prisma.premiumCalculator.findFirst({
      where: {
        options: telkomFreeBenefit,
      },
      include: {
        children: true,
      },
    });

    if (!response) {
      return handleApiResponseError(response);
    }
    return response;
  } catch (error: any) {
    logError(`Error in option C Quotation ${JSON.stringify(error)}`);
    return handleApiResponseError(error);
  }
};

export const calculateAge = (dateOfBirth: any) => {
  const currentDate = new Date();

  const [year, month, day] = dateOfBirth.split("-").map(Number);

  const birthDate = new Date(year, month - 1, day);

  const age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    return age - 1;
  }

  return age;
};

const flattenObject: any = (obj: any, prefix = "") => {
  const flattened: any = {};

  for (const key in obj) {
    if (typeof obj[key] === "object") {
      if (Array.isArray(obj[key])) {
        flattened[prefix + key] = JSON.stringify(obj[key]);
      } else {
        const nested = flattenObject(obj[key], prefix + key + ".");
        Object.assign(flattened, nested);
      }
    } else {
      flattened[prefix + key] = obj[key];
    }
  }

  return flattened;
};

export const findObjectDifferences = (obj1: any, obj2: any) => {
  const flatObj1 = flattenObject(obj1);
  const flatObj2 = flattenObject(obj2);

  const keys = new Set([...Object.keys(flatObj1), ...Object.keys(flatObj2)]);
  const differences: any = {};

  keys.forEach((key) => {
    const oldValue = flatObj1[key];
    const newValue = flatObj2[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      differences[key] = {
        old_value: typeof oldValue !== "undefined" ? oldValue : "",
        new_value: newValue,
      };

      // Parse arrays if necessary
      try {
        const parsedOldValue = JSON.parse(oldValue);
        const parsedNewValue = JSON.parse(newValue);
        differences[key].old_value = parsedOldValue;
        differences[key].new_value = parsedNewValue;
      } catch (error) {
        // Parsing error, keep original values
      }
    }
  });

  return differences;
};
export function addMainPremiums(mainPremium1: any, mainPremium2: any) {
  // Deep copy the first mainPremium object
  const result = JSON.parse(JSON.stringify(mainPremium1));
  const result2 = JSON.parse(JSON.stringify(mainPremium2));

  // Add coverageAmount and premiumAmount for mainMember
  result.mainMember.coverageAmount += mainPremium2.mainMember.coverageAmount;
  // result.mainMember.premiumAmount += mainPremium2.mainMember.premiumAmount;
  result.mainMember.freeCoverageAmount = mainPremium2.mainMember.coverageAmount;

  // Add coverageAmount and premiumAmount for spouse
  result.spouse.coverageAmount += mainPremium2.spouse.coverageAmount;
  // result.spouse.premiumAmount += mainPremium2.spouse.premiumAmount;
  result.spouse.freeCoverageAmount = mainPremium2.spouse.coverageAmount;

  // Assuming children arrays are of the same length and in the same order
  for (let i = 0; i < result.children.length; i++) {
    for (let j = 0; j < result2.children.length; j++) {
      if (
        Number(result?.children[i]?.minAge) ===
          Number(result2?.children[j]?.minAge) &&
        Number(result?.children[i]?.maxAge) ===
          Number(result2?.children[j]?.maxAge)
      ) {
        result.children[i].coverageAmount +=
          mainPremium2.children[j].coverageAmount;
        // result.children[i].premiumAmount +=
        //   mainPremium2.children[j].premiumAmount;
        result.children[i].freeCoverageAmount =
          mainPremium2.children[j].coverageAmount;
      }
    }
  }

  return result;
}

export const removeCreatedAtUpdatedAt: any = (obj: any) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeCreatedAtUpdatedAt(item));
  }

  const newObj: any = {};
  for (const key in obj) {
    if (key !== "createdAt" && key !== "updatedAt") {
      newObj[key] = removeCreatedAtUpdatedAt(obj[key]);
    }
  }

  return newObj;
};

export const necessaryFields: any = (data: any) => {
  const cleanedData: any = {};
  for (const key in data) {
    cleanedData[key] = removeCreatedAtUpdatedAt(data[key]);
  }
  return cleanedData;
};

export const excludeActivityOnClick: string[] = [
  "Application created",
  "Application on hold",
  "Policy activated",
  "Claim created",
  "Documents updated",
  "Document Archived",
  "Complaint created",
  "Prospect created",
];

export const inputPasswords = [
  {
    label: "Old Password",
    type: "password",
    name: "oldPassword",
    required: true,
  },
  {
    label: "New Password",
    type: "password",
    name: "newPassword",
    required: true,
  },
  {
    label: "Confirm Password",
    type: "password",
    name: "confirmPassword",
    required: true,
  },
];

export const inputProfile = [
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
    disabled: true,
  },
  {
    label: "Roles",
    type: "multi-select",
    name: "roles",
    required: false,
    disabled: true,
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
  {
    label: "Package name",
    type: "multi-select",
    name: "packageName",
    required: true,
    disabled: true,
    multipleOptions: [
      {
        label: "Employee funeral insurance",
        name: "EMPLOYEE_FUNERAL_INSURANCE",
        type: "checkbox",
        required: false,
        checked: false,
      },
      {
        label: "Employee device insurance",
        name: "EMPLOYEE_DEVICE_INSURANCE",
        type: "checkbox",
        required: false,
        checked: false,
      },
      {
        label: "Employee motor credit life",
        name: "EMPLOYEE_MOTOR_CREDITLIFE",
        type: "checkbox",
        required: false,
        checked: false,
      },
      {
        label: "Employee motor insurance",
        name: "EMPLOYEE_MOTOR_INSURANCE",
        type: "checkbox",
        required: false,
        checked: false,
      },
      {
        label: "Device insurance",
        type: "checkbox",
        name: "DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Device credit life",
        type: "checkbox",
        name: "DEVICE_CREDITLIFE",
        required: false,
      },
    ],
  },
];

export const getPackageKey = (packageName: string) => {
  const pdfFilePath = "/files/funeralDisclosureNotice.pdf";
  const absolutePath = path.join(process.cwd(), "public", pdfFilePath);
  try {
    const pdfBuffer = fs.readFileSync(absolutePath);
    const b64 = pdfBuffer.toString("base64");

    return b64;
  } catch (error: any) {
    console.error("Error reading the PDF file:", error);
  }
};

export const getPackagesModified = (packages: any) => {
  const modifiedArray = packages?.map((item: any) => ({
    label: item.packageName
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c: any) => c.toUpperCase()),
    value: item.packageName,
  }));

  return modifiedArray;
};

// Function to calculate when the current age band will exhaust
export function calculateExhaustDate(dateOfBirth: Date, ageBand: any) {
  const birthDate = new Date(dateOfBirth);
  birthDate.setFullYear(birthDate.getFullYear() + ageBand?.maxAge);
  birthDate.setDate(birthDate.getDate() - 1);
  return birthDate;
}

export function calculateWarningDate(exhaustDate: Date) {
  const warningDate = new Date(exhaustDate);
  warningDate.setMonth(exhaustDate.getMonth() - 3);
  return warningDate;
}

// Function to calculate the start date of the next age band
export function calculateNextAgeBandStartDate(exhaustDate: any) {
  const nextStartDate = new Date(exhaustDate);
  nextStartDate.setDate(nextStartDate.getDate() + 1);
  return nextStartDate;
}

export const getExistPackages = (packages: any) => {
  const data = [
    {
      packageName: "EMPLOYEE_MOTOR_INSURANCE",
    },
    {
      packageName: "EMPLOYEE_FUNERAL_INSURANCE",
    },
    {
      packageName: "EMPLOYEE_DEVICE_INSURANCE",
    },
    {
      packageName: "EMPLOYEE_MOTOR_CREDITLIFE",
    },
    {
      packageName: "EMPLOYEE_DEVICE_CREDITLIFE",
    },
    {
      packageName: "DEVICE_INSURANCE",
    },
    {
      packageName: "DEVICE_CREDITLIFE",
    },
  ];

  const missingElements = data.filter((dataItem) => {
    return !packages?.some(
      (packageItem: any) => packageItem?.packageName === dataItem?.packageName
    );
  });
  let modifiedArray = [{ label: "Select", value: "" }];
  missingElements.forEach((item) =>
    modifiedArray.push({
      label: item?.packageName
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()),
      value: item?.packageName,
    })
  );

  return modifiedArray;
};

export function getMultipleAccessRoles(roles: UserRole[], props: any) {
  const mergedAccessLevels: any = {};
  const accessLevels = props.accessLevels;
  for (const role of roles) {
    const roleAccess = accessLevels[role];
    if (roleAccess) {
      for (const feature in roleAccess) {
        if (!mergedAccessLevels[feature]) {
          mergedAccessLevels[feature] = {};
        }
        for (const permission in roleAccess[feature]) {
          if (mergedAccessLevels[feature][permission] === undefined) {
            mergedAccessLevels[feature][permission] =
              roleAccess[feature][permission];
          } else {
            // Merge permissions using logical OR
            mergedAccessLevels[feature][permission] =
              mergedAccessLevels[feature][permission] ||
              roleAccess[feature][permission];
          }
        }
      }
    }
  }
  return mergedAccessLevels;
}

export function formatBranchCode(code: string): string {
  let sanitizedCode = String(code);
  sanitizedCode = sanitizedCode?.replace(/\D/g, "");
  if (sanitizedCode?.length !== 6) {
    const leadingZeros = "0".repeat(6 - sanitizedCode?.length);
    return leadingZeros + sanitizedCode;
  } else {
    return sanitizedCode;
  }
}

export function formatAccountNumber(accountNumber: string): string {
  const accountNumberLength = 11;
  const accountNumberString = String(accountNumber);
  const sanitizedAccountNumber = accountNumberString?.replace(/\D/g, "");

  if (sanitizedAccountNumber?.length < accountNumberLength) {
    const trailingZeros = "0".repeat(
      accountNumberLength - sanitizedAccountNumber?.length
    );
    return sanitizedAccountNumber + trailingZeros;
  } else if (sanitizedAccountNumber?.length === accountNumberLength) {
    return sanitizedAccountNumber;
  } else {
    return sanitizedAccountNumber?.slice(0, accountNumberLength);
  }
}

export function formatAmount(value: string): number {
  // const sanitizedValue = valueInRands?.replace(/[\s,.]/g, "");
  const centsValue = parseInt(value, 10);

  return centsValue;
}

export function formatName(name: string): string {
  const maxLength = 30;
  const sanitizedName = name?.toUpperCase()?.replace(/,/g, "");
  const paddedName = sanitizedName?.padEnd(maxLength, " ");
  return paddedName;
}

export function formatPolicyNumber(policyNumber: string): string {
  const maxLength = 15;
  if (policyNumber.length > maxLength) {
    const paddedPolicyNumber = policyNumber?.padStart(maxLength, "0");
    return paddedPolicyNumber;
  } else {
    return policyNumber;
  }
}

export function revertTrailingZeros(policyNumber: string): string {
  return policyNumber.replace(/0+$/, "");
}

export function formatDateForDebit(dateString: string): string {
  // const currentDate = new Date();
  const inputDate = new Date(dateString);
  // if (inputDate > currentDate) {
  //     throw new Error("Invalid date. Please provide a future date.");
  // }
  const year = inputDate
    ?.getFullYear()
    ?.toString()
    ?.slice(-2)
    ?.padStart(2, "0");
  const month = (inputDate?.getMonth() + 1)?.toString()?.padStart(2, "0");
  const day = inputDate?.getDate()?.toString()?.padStart(2, "0");

  return year + "/" + month + "/" + day;
}

export enum BankAccountType {
  CurrentCheque = "Current / Cheque Account",
  Savings = "Savings Account",
  Transmission = "Transmission Account",
}

export function formatBankAccountType(accountType: string): number {
  switch (accountType) {
    case BankAccountType.CurrentCheque:
      return 1;
    case BankAccountType.Savings:
      return 2;
    case BankAccountType.Transmission:
      return 3;
    default:
      // throw new Error("Invalid bank account type.");
      return 0;
  }
}

export function getRuleForGivenDate(givenDate: any, rulesArray: any) {
  // Filter the rules array to find rules with 'ruleStartDate' less than the given date
  const filteredRules = rulesArray.filter((rule: any) => {
    return new Date(rule.ruleStartDate) <= new Date(givenDate);
  });

  // Sort the filtered rules by 'ruleStartDate' in descending order
  filteredRules.sort(
    (a: any, b: any) => b.ruleStartDate.getTime() - a.ruleStartDate.getTime()
  );

  // Return the first rule from the sorted array (the one with the latest 'ruleStartDate')
  return filteredRules[0];
}

export function findLimit(limits: any, sumAssured: number) {
  return (
    limits.find(
      (limit: any) =>
        sumAssured >= limit.minValue && sumAssured <= limit.maxValue
    ) || null
  );
}

export const removeUnderScores = (input: any) => {
  const words = input.toLowerCase().split("_");
  const capitalizedWords = words.map(
    (word: any) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  const output = capitalizedWords.join(" ");
  return output;
};

export type CallCenterTypes = {
  id: number;
  name: string;
  description: string;
  user: Array<Object | any>;
};

export const callCenterPerformance = async (
  ctx: any,
  callCenter: CallCenterTypes,
  apiType: boolean
) => {
  let totalAgentPerformance: any[] = [];
  let callCenterStats;
  if (callCenter) {
    const usersId = callCenter?.user.map((user) => {
      return user.id;
    });
    const usersByLeads = await ctx.prisma.credentialsUser.findMany({
      where: {
        id: {
          in: usersId,
        },
      },
      include: {
        LeadsCreatedBy: true,
      },
      orderBy: {
        LeadsCreatedBy: {
          _count: "desc",
        },
      },
    });
    let totalCallcenterLeads = 0;
    let totalAcceptedLeads = 0;
    let totalDeclinedLeads = 0;
    let totalinReviewLeads = 0;
    let totalPremiumGenerated = 0;
    let totalDraftLeads = 0;

    usersByLeads.map((user: any) => {
      let acceptedLeads = 0;
      let declinedLeads = 0;
      let inReviewLeads = 0;
      let totalPremiumOfAcceptedLeads = 0;
      let draftLeads = 0;
      const response = user.LeadsCreatedBy;
      if (!response.length) {
        totalAgentPerformance.push({
          agentId: user.id,
          agentName: user?.firstName + " " + user?.lastName,
          agentRoleType: user.agentRoletype,
          totalLeads: response.length,
          acceptedLeads: acceptedLeads,
          inReviewLeads: inReviewLeads,
          draftLeads: draftLeads,
          declinedLeads: declinedLeads,
          convertionRate: (
            Number((acceptedLeads / totalAgentPerformance.length) * 100) ?? 0
          ).toFixed(2),
          totalPremiumOfAcceptedLeads: totalPremiumOfAcceptedLeads,
        });
      } else {
        totalCallcenterLeads = totalCallcenterLeads + response.length;
        const statusCount = response.map((item: any) => {
          const { status } = item;

          switch (status) {
            case "ACCEPTED":
              acceptedLeads++;
              totalAcceptedLeads++;
              totalPremiumOfAcceptedLeads =
                totalPremiumOfAcceptedLeads + Number(item.totalPremium);
              totalPremiumGenerated =
                totalPremiumGenerated + Number(item.totalPremium);
              break;
            case "DECLINED":
              declinedLeads++;
              totalDeclinedLeads++;
              break;
            case "INREVIEW":
              inReviewLeads++;
              totalinReviewLeads++;
              break;
            case "DRAFT":
              draftLeads++;
              totalDraftLeads++;
          }
          return {
            agentId: user.id,
            agentName: user?.firstName + " " + user?.lastName,
            agentRoleType: user.agentRoletype,
            totalLeads: response.length,
            acceptedLeads: acceptedLeads,
            inReviewLeads: inReviewLeads,
            declinedLeads: declinedLeads,
            convertionRate: (
              Number(acceptedLeads / response.length) * 100
            ).toFixed(2),
            totalPremiumOfAcceptedLeads: totalPremiumOfAcceptedLeads,
          };
        });
        totalAgentPerformance.push(statusCount[statusCount.length - 1]);
      }
    });

    callCenterStats = {
      callCenterName: callCenter.name,
      callCenterId: callCenter.id,
      totalCallcenterLeads: totalCallcenterLeads,
      totalDraftLeads: totalDraftLeads,
      totalAcceptedLeads: totalAcceptedLeads,
      totalDeclinedLeads: totalDeclinedLeads,
      totalinReviewLeads: totalinReviewLeads,
      conversionPercentage:
        Number(totalAcceptedLeads / totalCallcenterLeads) * 100
          ? (Number(totalAcceptedLeads / totalCallcenterLeads) * 100).toFixed(2)
          : 0,
      totalPremiumGenerated: totalPremiumGenerated,
    };
  }
  if (apiType) {
    return callCenterStats;
  }
  return totalAgentPerformance;
};

export const dashboardFilters = (listOfPackageNames: Array<String>) => {
  return {
    id: "dashboard",
    name: "Filter",
    options: listOfPackageNames.map((filterValue: any) => ({
      filterValue,
      label: removeUnderScores(`${filterValue}`),
      checked: true,
    })),
  };
};

export const displayRenewal = (renewDate: any) => {
  // Get today's date
  const today = new Date();

  // Set the renewal date
  const renewalDate = new Date(dateConversion(renewDate)); // Format: YYYY-MM-DD

  // Calculate the difference in months between today's date and the renewal date
  const monthDiff =
    (renewalDate.getFullYear() - today.getFullYear()) * 12 +
    renewalDate.getMonth() -
    today.getMonth();

  // Check if the difference is exactly one month
  if (monthDiff === 1 || monthDiff === 0) {
    return true;
  } else {
    return false;
  }
};

export const checkIsRecentPurchase = (
  purchaseDate: any,
  deviceType: string
) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const currentDate = new Date();

  // Convert purchaseDate to a Date object if it's not already
  const parsedPurchaseDate =
    typeof purchaseDate === "string" ? new Date(purchaseDate) : purchaseDate;

  // Check if parsedPurchaseDate is a valid Date object
  if (isNaN(parsedPurchaseDate)) {
    // Handle invalid date
    console.error("Invalid purchaseDate:", purchaseDate);
    return false;
  }

  const differenceInTime = Math.abs(
    currentDate.getTime() - parsedPurchaseDate.getTime()
  );
  const differenceBetweenDays = Math.ceil(differenceInTime / oneDay);

  if (differenceBetweenDays > 21) {
    if (
      nonPortableDevices.includes(deviceType) &&
      differenceBetweenDays < 365
    ) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

export const contactsFilters = (listOfPackageNames: any) => {
  const contactsFilters = listOfPackageNames?.data.map((item: any) => ({
    filterValue: item?.callCenterId,
    label:
      item?.callCenterName?.toLowerCase().charAt(0).toUpperCase() +
      item?.callCenterName?.toLowerCase().slice(1), // Correctly formatting the label
    checked: false,
  }));
  return {
    id: "contacts",
    name: "Filter",
    options: contactsFilters,
  };
};

export const contactStatusNames = {
  open: "OPEN",
  interested: "INTERESTED",
  notInterested: "NOT_INTERESTED",
  callScheduled: "CALL_SCHEDULED",
  expired: "EXPIRED",
};

export const nonPortableDevices: string[] = [
  "Mini Humidifier",
  "Mifi Device",
  "Multiport Hub",
  "Wi-Fi System",
  "Lithium Trolley Inverter",
  "Lithium Inverter Trolley",
  "DECT Handset",
  "IP DECT Phone",
  "WiFi UPS",
  "Mini DC UPS",
  "DECT Phone",
  "Router & Mifi Bundle",
  "SIP ATA",
  "Power Adapter",
  "Antenna",
  "UPS (Uninterruptible Power Supply)",
  "IP Phone",
  "Wi-Fi Extender",
  "Wi-Fi Mesh",
  "other",
];

export const processFileContentAndEmpData = async (
  filePath: string,
  ctx: any
) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    let rows = data.split("\n").map((row) => row.split("|"));

    rows.shift(); // Remove header row

    const columnsToRemove = [
      0, 1, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 23, 26, 28, 29, 30,
      31, 32, 33, 34, 35, 36,
    ];

    rows = rows.map((row) =>
      row
        .filter((_, index) => !columnsToRemove.includes(index))
        .map((cell, index) => {
          if (index === 6) {
            // Replace non-alphanumeric characters in the Email column
            return cell.replace(/[^0-9a-zA-Z@. \n\r]/g, "") || "";
          } else {
            // Replace non-alphanumeric characters in other columns
            return cell.replace(/[^0-9a-zA-Z \n\r]/g, "") || "";
          }
        })
    );

    rows.forEach((row) => {
      const surname = row[1] || ""; // Assuming Surname is at index 1
      const preferredName = row[2] || ""; // Assuming PreferredName is at index 2
      const fullName = `${surname} ${preferredName}`.trim();
      row.splice(3, 0, fullName); // Insert FullName (combined value) at index 3
    });

    const processedData = rows.map((row) => ({
      SalaryRef: row[0],
      Surname: row[1],
      PreferredName: row[2],
      FullName: row[3],
      Initials: row[4],
      Title: row[5],
      Email: row[6],
      CellPhone: row[7],
      Rank: row[8],
      Username: row[9],
      Status: row[10],
      IDNumber: row[11],
    }));

    await ctx?.prisma.employeeData
      .deleteMany({})
      .then(async () => {
        logInfo("Delete operation succeeded");
        await ctx.prisma.employeeData
          .createMany({
            data: processedData,
          })
          .then(() => {
            logInfo("Create operation succeeded");
          })
          .catch((error: any) => {
            logError(`CreateMany operation failed. Error: ${error}`);
          });
      })
      .catch((error: any) => {
        logError(`Delete operation failed. Error: ${error}`);
      });

    return {
      status: processedData.length > 0 ? true : false,
      data: `found ${processedData.length} records`,
    };
  } catch (error) {
    logError(
      `Error occured in the processFileContentAndEmpData error ${error}`
    );
  }
};
