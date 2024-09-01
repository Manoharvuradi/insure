import { IMember, LeadStatus, PackageName } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import validator from "validator";
import { z } from "zod";
import { logError, logInfo } from "../constants/logger";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  PaymentMethodType,
  additionalPercentageInsured,
  applicationActivitiesLabels,
  applicationStatus,
  buildMainMember,
  calculateAgeBasedOnDOB,
  calculateAgeBasedOnSaid,
  checkPercentageTotal,
  checkPreviousCurrentPercentageTotal,
  convertToObjectWithCreate,
  coverageOptions,
  employeeFuneralAges,
  eventNotificationTemplate,
  familyRelationship,
  gender,
  generatePDF,
  generateUniqueNumber,
  leadActivitiesLabels,
  packageName,
  packageNames,
  pagination,
  phoneRegex,
  policyActivitiesLabels,
  premiumFrequency,
  relation,
  removeIdFromArray,
  removeNullProperties,
  removeUndefined,
  removeUndefinedAndAddUuid,
  schemeType,
  telkomFreeBenefit,
} from "~/utils/constants";
import {
  creditLifePremiumCalculation,
  deviceCreditLifePremiumCal,
  devicePremiumData,
  findChildrenAged20,
  premiumCalculations,
  retailDeviceCreditLifePremiumCal,
  retailDevicePremiumData,
  updateExistingDataWithNewMember,
} from "~/utils/constants/calculations";
import {
  LeadStatusValues,
  calculateNextBillingDate,
  calculateStartDate,
  generatePolicySchedule,
} from "~/utils/constants/policy";
import { dateSAIDvalidation, validateAge } from "~/utils/helpers/validations";
import {
  addMainPremiums,
  calculateExhaustDate,
  calculateNextAgeBandStartDate,
  calculateWarningDate,
  dateConversion,
  findLimit,
  findObjectDifferences,
  freeBenefitPremiumCalculation,
  getRuleForGivenDate,
  handleApiResponseError,
} from "~/utils/helpers";
import ReactDOMServer from "react-dom/server";
import AWS from "aws-sdk";
import PdfTemplate from "~/components/template/pdfTemplate";
import { roleValues } from "~/utils/constants/user";
import { pdfKit } from "~/utils/helpers/pdfkit";
import { creditLifePdfkit } from "~/utils/helpers/creditLifePdfkit";
import { env } from "~/env.mjs";
import { devicePdfkit } from "~/utils/helpers/devicePdfkit";
import {
  financedBy,
  getApplicationString,
  maxDaysForUnattendedApplication,
} from "~/utils/constants/application";
import { creditLifeDevicePdfkit } from "~/utils/helpers/creditLifeDevicePdfkit";
import { retailDevicePdfkit } from "~/utils/helpers/retailDevicePdfkit";
import { retailCreditLifeDevicePdf } from "~/utils/helpers/retailCreditLifePdf";

const s3 = new AWS.S3(
  env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
    ? {
        accessKeyId: env.AWS_KEY as string,
        secretAccessKey: env.AWS_SECRET as string,
        region: env.AWS_LOG_REGION as string,
      }
    : {
        region: env.AWS_LOG_REGION as string,
      }
);

export const applicationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          package: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: Retrieving LIST APPLICATION data, for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        let user;
        const queryOptions: any = {
          take: Number(input?.pageSize ? input.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
          where: {
            isArchived: false,
          },
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            policyholder: true,
            beneficiaries: true,
            Leads: {
              select: {
                status: true,
                applicationOnHold: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        };
        if (ctx.session?.user?.roles.includes(roleValues.agent)) {
          user = await ctx.prisma.credentialsUser.findFirst({
            where: {
              id: Number(ctx?.session?.user?.id),
            },
          });
          if (user?.callCenterId) {
            queryOptions.where = {
              ...queryOptions.where,
              createdBy: {
                callCenterId: user?.callCenterId,
              },
            };
          }
        }
        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          queryOptions.where = {
            isArchived: false,
            status: {
              in: filterArray,
            },
          };
        }
        if (ctx?.req?.query?.packageName) {
          let packageArray: string[] = ctx.req.query.packageName.split(",");
          if (input?.package) {
            if (packageArray.includes(input?.package)) {
              let packageFromInput = [];
              packageFromInput.push(input?.package);
              packageArray = [];
              packageArray = packageFromInput;
            } else {
              packageArray = [];
            }
          }
          queryOptions.where = {
            ...queryOptions.where,
            packageName: {
              in: packageArray,
            },
          };
        }
        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              {
                id: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                policyholderId: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                policyholder: {
                  firstName: { contains: input?.search, mode: "insensitive" },
                },
              },
              {
                policyholder: {
                  lastName: { contains: input?.search, mode: "insensitive" },
                },
              },
              {
                policyholder: {
                  citizenshipId: {
                    contains: input?.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                applicationData: {
                  path: ["packageName"],
                  string_contains: input?.search.toUpperCase(),
                },
              },
              {
                createdBy: {
                  firstName: { contains: input?.search, mode: "insensitive" },
                },
              },
              {
                createdBy: {
                  lastName: { contains: input?.search, mode: "insensitive" },
                },
              },
            ],
          };
        }
        if (input?.sort) {
          const [field, order]: any = input?.sort.split(":");
          queryOptions.orderBy = {
            [field]: order === "desc" ? "desc" : "asc",
          };
        }
        const totalCount = await ctx.prisma.application.count({
          where: {
            ...queryOptions.where,
          },
        });

        const response = await ctx.prisma.application.findMany(queryOptions);
        logInfo(
          `SUCCESS: Successfully retrieved LIST APPLICATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while retrieving LIST APPLICATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST: Retrieving SHOW APPLCATION data, for User Id: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } User Name: ${
        ctx?.session?.user.firstName
      } and ApplicationId: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.application.findFirst({
        where: {
          id: input,
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },

          updatedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          policy: true,
          paymentMethod: true,
          policyholder: {
            include: {
              identification: true,
            },
          },
          beneficiaries: true,
          fileIds: {
            include: {
              createdBy: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            where: {
              isArchived: false,
            },
          },
          Leads: true,
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved SHOW APPLICATION data for User ID: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${
          ctx?.session?.user.firstName
        } and ApplicationId: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error occured while retrieving SHOW APPLICATION data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User Name: ${
          ctx.session?.user.firstName
        } and ApplicationId: ${input} Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(createApplicationInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATING APPLICATION data, for packageName:${
          input.applicationData.packageName
        } for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName}, policyholderId: ${
          input.policyholderId
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const { options, applicationData, policyholderId } = input;
        // let childrenPremiumAmount = 0;
        let extendedFamilyPremiumAmount = 0;
        // let spousePremiumAmount = 0;
        let data: any = { ...input };
        if (data.paymentMethod) {
          data.paymentMethod = {
            ...data.paymentMethod,
            accountNumber: data?.paymentMethod?.accountNumber?.toString(),
          };
        }
        const totalBenefPercentage =
          data?.beneficiaries && checkPercentageTotal(data?.beneficiaries);

        if (totalBenefPercentage) {
          try {
            const packageActions = {
              EMPLOYEE_FUNERAL_INSURANCE: async () => {
                try {
                  const response = await ctx?.prisma?.package.findFirst({
                    where: {
                      packageName: packageNames?.funeral as PackageName,
                    },
                    include: {
                      packageRules: {
                        include: {
                          ruleLimits: true,
                        },
                      },
                    },
                  });
                  const matchedRule = getRuleForGivenDate(
                    input.startDate,
                    response?.packageRules
                  );
                  const matchedLimit = findLimit(matchedRule?.ruleLimits, 10);
                  if (!matchedRule || !matchedLimit) {
                    logError(
                      `FAILURE: Error occured while getting Package rules for: ${
                        input.applicationData.packageName
                      } user: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      }, policyholderId: ${input.policyholderId} `
                    );
                    throw new TRPCError({
                      message: `Package Rule does not exists`,
                      code: "BAD_REQUEST",
                      cause: 400,
                    });
                  }
                  const coverPremiumPercentage =
                    matchedLimit?.aditionalCoverPercentage;
                  const freeCoverPremium = input?.applicationData
                    .withFreeBenefit
                    ? matchedLimit?.freeCoverPremium
                    : 0;
                  try {
                    const policyholderData =
                      await prisma.policyholder.findFirst({
                        where: {
                          id: policyholderId,
                        },
                      });
                    if (policyholderData) {
                      const mainMember = buildMainMember(policyholderData);
                      data = {
                        ...data,
                        applicationData: {
                          ...applicationData,
                          members: {
                            ...applicationData.members,
                            mainMember,
                          },
                        },
                      };
                    } else {
                      logError(
                        `FAILURE: Error occured while CREATING APPLICATION for packageName:${
                          input.applicationData.packageName
                        } for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } User Name: ${
                          ctx.session?.user.firstName
                        } and policyholderId: ${input.policyholderId}  Error: ${
                          "Cannot find the policyholder details" +
                          JSON.stringify(policyholderData)
                        }`
                      );
                      return handleApiResponseError({
                        inputError: "Cannot find the policyholder details.",
                      });
                    }
                  } catch (error: any) {
                    logError(
                      `FAILURE:Error occured while CREATING APPLICATION for packageName: ${
                        input.applicationData.packageName
                      } for User Id: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } User name: ${
                        ctx?.session?.user?.firstName
                      } and policyholderId: ${
                        input.policyholderId
                      } Error: ${JSON.stringify(error)}`
                    );
                    return handleApiResponseError(error);
                  }
                  const premiumData = await premiumCalculations(data, ctx);
                  let mainMemberPremiumAmount = 0;
                  if (!input?.applicationData.withFreeBenefit) {
                    mainMemberPremiumAmount =
                      premiumData?.mainPremium?.mainMember?.coverageAmount;
                  }
                  if (
                    options !== telkomFreeBenefit &&
                    input.applicationData.withFreeBenefit
                  ) {
                    mainMemberPremiumAmount =
                      premiumData?.mainPremium?.mainMember?.coverageAmount;
                    const optionCPremiumData =
                      await freeBenefitPremiumCalculation(ctx);
                    const combinedMainPremium = addMainPremiums(
                      premiumData?.mainPremium,
                      optionCPremiumData
                    );
                    premiumData.mainPremium = combinedMainPremium;
                  }
                  if (
                    options == telkomFreeBenefit &&
                    !input.applicationData.withFreeBenefit
                  ) {
                    throw new Error(
                      "Cannot choose second policy with telkom free benefit"
                    );
                  }
                  const members = data?.applicationData?.members || {};
                  const extendedFamilyMembers = members.extendedFamily || {};
                  const childrenMembers = members.children || {};
                  const spouseMember = members.spouse || {};
                  let extendedFamily;
                  const hasExtendedFamilyAge =
                    extendedFamilyMembers?.length > 0 &&
                    extendedFamilyMembers.every(
                      (obj: any) =>
                        obj.hasOwnProperty("dateOfBirth") ||
                        obj.hasOwnProperty("said") ||
                        obj.hasOwnProperty("age")
                    );
                  if (hasExtendedFamilyAge) {
                    if (premiumData && premiumData?.extendedPremium) {
                      const hasExtendedFamily = Object.values(
                        extendedFamilyMembers
                      )
                        .filter(
                          (familyMember: any) =>
                            (familyMember.dateOfBirth || familyMember.said) &&
                            familyMember.options
                        )
                        .map((familyMember: any) => {
                          let familyAge = familyMember.dateOfBirth
                            ? calculateAgeBasedOnDOB(familyMember.dateOfBirth)
                            : familyMember.said
                            ? calculateAgeBasedOnSaid(familyMember.said)
                            : familyMember.age;
                          return { ...familyMember, age: familyAge };
                        });

                      extendedFamily =
                        hasExtendedFamily?.length > 0
                          ? hasExtendedFamily.map((family: any) => {
                              const matchingPremium =
                                premiumData?.extendedPremium?.find(
                                  (premium: any) =>
                                    premium.options === family.options
                                );
                              if (matchingPremium) {
                                let exhaustDate;
                                let warningDate;
                                const matchingFamily =
                                  matchingPremium?.extendedFamily?.find(
                                    (f: any) =>
                                      f.minAge <= family.age &&
                                      f.maxAge >= family.age
                                  );
                                if (matchingFamily) {
                                  exhaustDate =
                                    family?.dateOfBirth &&
                                    calculateExhaustDate(
                                      family?.dateOfBirth,
                                      matchingFamily
                                    );
                                  warningDate =
                                    exhaustDate &&
                                    calculateWarningDate(exhaustDate);
                                  extendedFamilyPremiumAmount +=
                                    matchingFamily.premiumAmount;
                                  return {
                                    ...family,
                                    accidentalDeathAmount:
                                      matchingFamily?.coverageAmount,
                                    naturalDeathAmount:
                                      matchingFamily?.coverageAmount,
                                    premiumAmount:
                                      matchingFamily?.premiumAmount,
                                    exhaustDate: exhaustDate,
                                    warningDate: warningDate,
                                  };
                                }
                              }
                              logError(
                                `FAILURE: Error occured while CREATING APPLICATION for package ${
                                  input?.applicationData.packageName
                                } for user: ${
                                  ctx?.session?.user?.id &&
                                  ctx?.session?.user?.id
                                } and policyholder: ${
                                  input.policyholderId
                                } User name: ${
                                  ctx?.session?.user?.firstName
                                } response: ${
                                  "Record to doesn't match with extended family" +
                                  JSON.stringify(matchingPremium)
                                }`
                              );
                              return handleApiResponseError({
                                inputError:
                                  "Record to doesn't match with extended family",
                              });
                            })
                          : undefined;
                    } else {
                      logError(
                        `FAILURE: Error occured while CREATING APPLICATION for package ${
                          input?.applicationData.packageName
                        } User Id: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } User Name: ${
                          ctx.session?.user.firstName
                        } and policyholderId: ${input.policyholderId} Error: ${
                          "Record to get extended family premium data does not exist." +
                          JSON.stringify(premiumData?.extendedPremium)
                        }`
                      );
                      return handleApiResponseError({
                        inputError:
                          "Record to get extended family premium data does not exist.",
                      });
                    }
                  }
                  if (premiumData && premiumData?.mainPremium) {
                    const { mainMember, spouse, children } =
                      premiumData.mainPremium;
                    const hasChildren = Object.values(childrenMembers)
                      .filter(
                        (child: any) =>
                          child.dateOfBirth ||
                          child.said ||
                          child.age ||
                          child.age === 0
                      )
                      .map((child: any) => {
                        let childAge = child.dateOfBirth
                          ? calculateAgeBasedOnDOB(child.dateOfBirth)
                          : child.said
                          ? calculateAgeBasedOnSaid(child.said)
                          : child.age;
                        return { ...child, age: childAge };
                      });
                    const childrenData =
                      hasChildren?.length > 0
                        ? hasChildren.map((child: any) => {
                            let matchingPlan = null;
                            let exhaustDate;
                            let warningDate;
                            if (child.isStudying || child.isDisabled) {
                              matchingPlan = children?.find(
                                (plan: any) =>
                                  plan.minAge <= child.age &&
                                  plan.maxAge >= child.age &&
                                  (plan.isStudying === child.isStudying ||
                                    plan.isDisabled === child.isDisabled) &&
                                  plan.isStillBorn === child.isStillBorn
                              );
                            } else {
                              matchingPlan = children?.find(
                                (plan: any) =>
                                  plan.minAge <= child.age &&
                                  plan.maxAge >= child.age &&
                                  plan.isStudying === child.isStudying &&
                                  plan.isDisabled === child.isDisabled &&
                                  plan.isStillBorn === child.isStillBorn
                              );
                            }
                            exhaustDate =
                              child?.dateOfBirth &&
                              calculateExhaustDate(
                                child?.dateOfBirth,
                                matchingPlan
                              );
                            warningDate =
                              exhaustDate && calculateWarningDate(exhaustDate);
                            if (matchingPlan && matchingPlan != undefined) {
                              // childrenPremiumAmount +=
                              //   matchingPlan?.premiumAmount;
                              return {
                                ...child,
                                age: child.age,
                                accidentalDeathAmount:
                                  matchingPlan?.coverageAmount,
                                naturalDeathAmount:
                                  matchingPlan?.coverageAmount,
                                // telkomFreeBenefitAmount:
                                //   matchingPlan?.freeCoverageAmount ??
                                //   matchingPlan?.coverageAmount,
                                // premiumAmount: matchingPlan?.premiumAmount,
                                isStudying: child?.isStudying,
                                isDisabled: child?.isDisabled,
                                isStillBorn: child?.isStillBorn,
                                exhaustDate: exhaustDate,
                                warningDate: warningDate,
                              };
                            } else {
                              return null;
                            }
                          })
                        : undefined;

                    const mainMemberData = {
                      naturalDeathAmount: mainMember.coverageAmount,
                      accidentalDeathAmount: mainMember.coverageAmount,
                      // telkomFreeBenefitAmount:
                      //   mainMember?.freeCoverageAmount ??
                      //   mainMember?.coverageAmount,
                      // premiumAmount: mainMember.premiumAmount,
                    };
                    const hasSpouse = Object.values(spouseMember)
                      .filter(
                        (spouse: any) =>
                          spouse.dateOfBirth ||
                          spouse.said ||
                          spouse.age ||
                          spouse.age === 0
                      )
                      .map((spouse: any) => {
                        let spouseAge = spouse.dateOfBirth
                          ? calculateAgeBasedOnDOB(spouse.dateOfBirth)
                          : spouse.said
                          ? calculateAgeBasedOnSaid(spouse.said)
                          : spouse.age;
                        return { ...spouse, age: spouseAge };
                      });
                    const spouseData =
                      hasSpouse &&
                      hasSpouse.length > 0 &&
                      Array.isArray(spouseMember)
                        ? hasSpouse.map((inputSpouse) => {
                            // spousePremiumAmount +=
                            //   (inputSpouse.age > 0 ||
                            //     inputSpouse.dateOfBirth ||
                            //     inputSpouse.said) &&
                            //   spouse
                            //     ? spouse.premiumAmount
                            //     : 0;
                            return (inputSpouse.age > 0 ||
                              inputSpouse.dateOfBirth ||
                              inputSpouse.said) &&
                              spouse
                              ? {
                                  ...inputSpouse,
                                  naturalDeathAmount: spouse.coverageAmount,
                                  accidentalDeathAmount: spouse.coverageAmount,
                                  // telkomFreeBenefitAmount:
                                  //   spouse?.freeCoverageAmount ??
                                  //   spouse?.coverageAmount,
                                  // premiumAmount: spouse.premiumAmount,
                                }
                              : {};
                          })
                        : undefined;

                    const extendedFamilyData = extendedFamily
                      ? {
                          extendedFamily: [...extendedFamily],
                        }
                      : {};

                    const membersData = {
                      ...members,
                      mainMember: {
                        ...members.mainMember,
                        ...mainMemberData,
                      },
                      ...(childrenData && { children: [...childrenData] }),
                      ...(spouseData && { spouse: [...spouseData] }),
                      ...extendedFamilyData,
                    };

                    const startDate = new Date(data?.startDate);
                    const endDate = new Date(data?.startDate);
                    endDate.setFullYear(startDate.getFullYear() + 1);
                    endDate.setDate(endDate.getDate() - 1);
                    const renewalDate = new Date(endDate);
                    renewalDate.setDate(endDate.getDate() + 1);

                    const mainMemberPremiumCost =
                      Math.floor(
                        mainMemberPremiumAmount * coverPremiumPercentage * 100
                      ) / 100;
                    const extendedFamilyPremiumCost = Number(
                      extendedFamilyPremiumAmount.toFixed(2)
                    );
                    const totalPremiumCost = parseFloat(
                      (
                        mainMemberPremiumCost + extendedFamilyPremiumAmount
                      ).toFixed(2)
                    );

                    data = {
                      ...data,
                      status: "PENDING",
                      sumAssured: mainMember.coverageAmount,
                      basePremium: mainMemberPremiumCost,
                      additionalPremium: extendedFamilyPremiumCost,
                      totalPremium: totalPremiumCost,
                      freeBenefitPremium: freeCoverPremium,
                      endDate: endDate,
                      renewalDate: renewalDate,
                      applicationData: {
                        ...data?.applicationData,
                        members: {
                          ...membersData,
                        },
                      },
                    };
                  } else {
                    logError(
                      `FAILURE: Error occured while CREATING APPLICATION for packageName:${
                        input.applicationData.packageName
                      } for User Id: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } User Name: ${
                        ctx.session?.user.firstName
                      } and policyholderId: ${input.policyholderId} Error: ${
                        "Record to get premium data does not exist." +
                        JSON.stringify(premiumData?.mainPremium)
                      }`
                    );
                    return handleApiResponseError({
                      inputError: "Record to get premium data does not exist.",
                    });
                  }
                } catch (error: any) {
                  logError(
                    `FAILURE:Error occured while CREATING APPLICATION for packageName: ${
                      input.applicationData.packageName
                    } for User Id: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    } User name: ${
                      ctx?.session?.user?.firstName
                    } and policyholderId: ${
                      input.policyholderId
                    } Error: ${JSON.stringify(error)}`
                  );
                  return handleApiResponseError(error);
                }
              },

              EMPLOYEE_MOTOR_CREDITLIFE: async () => {
                const premiumData = await creditLifePremiumCalculation(
                  input.applicationData,
                  ctx,
                  input?.startDate
                );
                const startDate = new Date(data?.startDate);
                const endDate = new Date(data?.startDate);
                endDate.setFullYear(startDate.getFullYear() + 1);
                endDate.setDate(endDate.getDate() - 1);
                const renewalDate = new Date(endDate);
                renewalDate.setDate(endDate.getDate() + 1);
                data = {
                  ...data,
                  packageName: input?.applicationData?.packageName,
                  status: "PENDING",
                  sumAssured: premiumData?.sumAssured,
                  basePremium: premiumData?.additionalPremium,
                  additionalPremium: 0,
                  totalPremium: premiumData?.additionalPremium,
                  endDate: endDate,
                  renewalDate: renewalDate,
                  freeBenefitPremium: premiumData?.freeCoverPremium,
                  applicationData: {
                    creditLife: {
                      ...premiumData,
                    },
                    packageName: input?.applicationData?.packageName,
                  },
                };
              },

              EMPLOYEE_MOTOR_INSURANCE: async () => {},

              EMPLOYEE_DEVICE_INSURANCE: async () => {
                const devicePremiumCal = await devicePremiumData(
                  ctx,
                  input.applicationData
                );
                const startDate = new Date(data?.startDate);
                const endDate = new Date(data?.startDate);
                endDate.setFullYear(startDate.getFullYear() + 1);
                endDate.setDate(endDate.getDate() - 1);
                const renewalDate = new Date(endDate);
                renewalDate.setDate(endDate.getDate() + 1);
                data = {
                  ...data,
                  packageName: input?.applicationData?.packageName,
                  status: "PENDING",
                  sumAssured: devicePremiumCal?.devicePrice,
                  basePremium: devicePremiumCal?.premiumAmount,
                  // additionalPremium: 0,
                  totalPremium: devicePremiumCal.premiumAmount,
                  endDate: endDate,
                  renewalDate: renewalDate,
                  // freeBenefitPremium: devicePremiumCal?.freeCoverPremium,
                  applicationData: {
                    packageName: input?.applicationData?.packageName,
                    deviceData: {
                      ...devicePremiumCal,
                    },
                  },
                };
              },

              EMPLOYEE_DEVICE_CREDITLIFE: async () => {
                const premiumData = await deviceCreditLifePremiumCal(
                  input.applicationData,
                  ctx,
                  input?.startDate
                );
                const startDate = new Date(data?.startDate);
                const endDate = new Date(data?.startDate);
                endDate.setFullYear(startDate.getFullYear() + 1);
                const renewalDate = new Date(endDate);
                renewalDate.setDate(endDate.getDate() + 1);
                data = {
                  ...data,
                  packageName: input?.applicationData?.packageName,
                  status: "PENDING",
                  sumAssured: premiumData?.sumAssured,
                  basePremium: premiumData?.additionalPremium,
                  additionalPremium: 0,
                  totalPremium: premiumData?.additionalPremium,
                  endDate: endDate,
                  renewalDate: renewalDate,
                  freeBenefitPremium: premiumData?.freeCoverPremium,
                  applicationData: {
                    deviceCreditLife: {
                      ...premiumData,
                    },
                    packageName: input?.applicationData?.packageName,
                  },
                };
              },
              DEVICE_INSURANCE: async () => {},
              DEVICE_CREDITLIFE: async () => {},
              // Add more package-specific actions here as needed
            };
            const selectedAction =
              packageActions[
                input?.applicationData?.packageName as PackageName
              ];

            if (selectedAction) {
              await selectedAction();
            } else {
              logError(
                `FAILURE: Error occured while CREATING APPLICATION for packageName:${
                  input.applicationData.packageName
                } for User Id: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User Name: ${
                  ctx.session?.user.firstName
                } and policyholderId: ${input.policyholderId} Error: ${
                  "Record to get premium data does not exist." +
                  JSON.stringify(
                    `Unknown package name: ${input?.applicationData?.packageName}`
                  )
                }`
              );
              throw new Error(
                `Unknown package name: ${input?.applicationData?.packageName}`
              );
            }
            if (data.paymentMethod) {
              const paymentMethodData = {
                ...data.paymentMethod,
                policyholderId: data.policyholderId,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              const formattedPaymentMethod =
                convertToObjectWithCreate(paymentMethodData);
              data = {
                ...data,
                paymentMethod: formattedPaymentMethod,
              };
            }

            const activitiesData = {
              name: applicationActivitiesLabels.created,
              description: { data: [applicationActivitiesLabels.created] },
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            };
            const formattedActivities =
              convertToObjectWithCreate(activitiesData);
            const newApplication = await prisma.application.create({
              include: {
                beneficiaries: true,
                paymentMethod: true,
              },
              data: {
                ...removeUndefinedAndAddUuid(data),
                applicationActivities: formattedActivities,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              },
            });
            logInfo(
              `SUCCESS: Successfully CREATED APPLICATION, for package ${
                input?.applicationData?.packageName
              }, for User Id: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user?.firstName} and Policyholder ${
                input.policyholderId
              } Response: ${JSON.stringify(newApplication)}`
            );
            return newApplication;
          } catch (error) {
            logError(
              `FAILURE:Error occured while CREATING APPLICATION  for package ${
                input?.applicationData?.packageName
              } for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user?.firstName} and policyholder: ${
                input.policyholderId
              } Error: ${JSON.stringify(error)}`
            );
            return handleApiResponseError(error);
          }
        } else {
          logError(
            `FAILURE: Error occured while CREATING APPLICATION for package ${
              input?.applicationData?.packageName
            } for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User Name: ${ctx?.session?.user?.firstName} and Error:${
              "Total beneficiaries percentage should be equal to 100." +
              JSON.stringify(totalBenefPercentage)
            } `
          );
          throw new TRPCError({
            message: `Total beneficiaries percentage should be equal to 100.`,
            code: "BAD_REQUEST",
            cause: 400,
          });
        }
      } catch (error) {
        logError(
          `FAILURE: Error occured while CREATING APPLICATION for package ${
            input?.applicationData?.packageName
          } for User Id: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and Policyholder ${
            input.policyholderId
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        body: updateApplicationInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE APPLICATION data, for packageName:${
          input.body.applicationData.packageName
        } for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User Name: ${ctx?.session?.user?.firstName}, ApplicationId: ${
          input.id
        }, policyholderId: ${
          input.body.policyholderId
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const { applicationData, policyholderId, paymentMethod, options } =
          input.body;
        const previousApplication = await ctx.prisma.application.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
            paymentMethod: true,
          },
        });
        const totalPreviousBenefPercentage = checkPercentageTotal(
          previousApplication?.beneficiaries
        );
        if (
          previousApplication?.status == "PENDING" &&
          totalPreviousBenefPercentage &&
          !previousApplication.isArchived
        ) {
          // let childrenPremiumAmount = 0;
          let extendedFamilyPremiumAmount = 0;
          // let spousePremiumAmount = 0;
          let data: any = {
            ...input.body,
          };
          if (data.paymentMethod) {
            data.paymentMethod = {
              ...data.paymentMethod,
              accountNumber: data.paymentMethod.accountNumber?.toString(),
            };
          }
          if (data.status === "APPROVED") {
            data.startDate = calculateStartDate(data?.startDate);
          }
          const packageActions = {
            EMPLOYEE_FUNERAL_INSURANCE: async () => {
              try {
                const response = await ctx?.prisma?.package.findFirst({
                  where: {
                    packageName: packageNames?.funeral as PackageName,
                  },
                  include: {
                    packageRules: {
                      include: {
                        ruleLimits: true,
                      },
                    },
                  },
                });
                const matchedRule = getRuleForGivenDate(
                  input?.body?.startDate,
                  response?.packageRules
                );
                const matchedLimit = findLimit(matchedRule?.ruleLimits, 1000);
                if (!matchedRule && !matchedLimit) {
                  logError(
                    `FAILURE: Error occured while getting Package rules for: ${
                      input.body.applicationData.packageName
                    } user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    }, policyholderId: ${input.body.policyholderId} `
                  );
                  throw new TRPCError({
                    message: `Package Rule does not exists`,
                    code: "BAD_REQUEST",
                    cause: 400,
                  });
                }
                const coverPremiumPercentage =
                  matchedLimit?.aditionalCoverPercentage;
                const freeCoverPremium = input?.body?.applicationData
                  .withFreeBenefit
                  ? matchedLimit?.freeCoverPremium
                  : 0;
                try {
                  const policyholderData = await prisma.policyholder.findFirst({
                    where: {
                      id: policyholderId,
                    },
                  });

                  if (policyholderData) {
                    const mainMember = buildMainMember(policyholderData);
                    data = {
                      ...data,
                      applicationData: {
                        ...applicationData,
                        members: {
                          ...applicationData.members,
                          mainMember,
                        },
                      },
                    };
                  } else {
                    logError(
                      `FAILURE: Error occured while UPDATING APPLICATION data for packageName:${
                        input.body.applicationData.packageName
                      } for User Id: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } User Name: ${
                        ctx.session?.user.firstName
                      } and ApplicationId: ${input.id}, policyholderId: ${
                        input.body.policyholderId
                      } Error: ${
                        "Cannot find the policyholder details." +
                        JSON.stringify(policyholderData)
                      }`
                    );
                    return handleApiResponseError({
                      inputError: "Cannot find the policyholder details.",
                    });
                  }

                  // Rest of the EMPLOYEE_FUNERAL_INSURANCE logic here
                  const premiumData = await premiumCalculations(data, ctx);
                  let mainMemberPremiumAmount = 0;
                  if (!input?.body?.applicationData.withFreeBenefit) {
                    mainMemberPremiumAmount =
                      premiumData?.mainPremium?.mainMember?.coverageAmount;
                  }
                  if (
                    options !== telkomFreeBenefit &&
                    input?.body?.applicationData.withFreeBenefit
                  ) {
                    mainMemberPremiumAmount =
                      premiumData?.mainPremium?.mainMember?.coverageAmount;
                    const optionCPremiumData =
                      await freeBenefitPremiumCalculation(ctx);
                    const combinedMainPremium = addMainPremiums(
                      premiumData?.mainPremium,
                      optionCPremiumData
                    );
                    premiumData.mainPremium = combinedMainPremium;
                  }
                  if (
                    options == telkomFreeBenefit &&
                    !input?.body?.applicationData.withFreeBenefit
                  ) {
                    throw new Error(
                      "Cannot choose second policy with telkom free benefit"
                    );
                  }
                  const members = data?.applicationData?.members || {};
                  const extendedFamilyMembers = members.extendedFamily || {};
                  const childrenMembers = members.children || {};
                  const spouseMember = members.spouse || {};
                  let extendedFamily;
                  const hasExtendedFamilyAge =
                    extendedFamilyMembers?.length > 0 &&
                    extendedFamilyMembers.every(
                      (obj: any) =>
                        obj.hasOwnProperty("dateOfBirth") ||
                        obj.hasOwnProperty("said") ||
                        obj.hasOwnProperty("age")
                    );
                  if (hasExtendedFamilyAge) {
                    if (premiumData && premiumData?.extendedPremium) {
                      const hasExtendedFamily = Object.values(
                        extendedFamilyMembers
                      )
                        .filter(
                          (familyMember: any) =>
                            (familyMember.dateOfBirth || familyMember.said) &&
                            familyMember.options
                        )
                        .map((familyMember: any) => {
                          let familyAge = familyMember.dateOfBirth
                            ? calculateAgeBasedOnDOB(familyMember.dateOfBirth)
                            : familyMember.said
                            ? calculateAgeBasedOnSaid(familyMember.said)
                            : familyMember.age;
                          return { ...familyMember, age: familyAge };
                        });

                      extendedFamily =
                        hasExtendedFamily?.length > 0
                          ? hasExtendedFamily.map((family: any) => {
                              const matchingPremium =
                                premiumData?.extendedPremium?.find(
                                  (premium: any) =>
                                    premium.options === family.options
                                );
                              if (matchingPremium) {
                                let exhaustDate;
                                let warningDate;
                                const matchingFamily =
                                  matchingPremium?.extendedFamily?.find(
                                    (f: any) =>
                                      f.minAge <= family.age &&
                                      f.maxAge >= family.age
                                  );
                                if (matchingFamily) {
                                  exhaustDate =
                                    family?.dateOfBirth &&
                                    calculateExhaustDate(
                                      family?.dateOfBirth,
                                      matchingFamily
                                    );
                                  warningDate =
                                    exhaustDate &&
                                    calculateWarningDate(exhaustDate);
                                  extendedFamilyPremiumAmount +=
                                    matchingFamily.premiumAmount;
                                  return {
                                    ...family,
                                    accidentalDeathAmount:
                                      matchingFamily?.coverageAmount,
                                    naturalDeathAmount:
                                      matchingFamily?.coverageAmount,
                                    premiumAmount:
                                      matchingFamily?.premiumAmount,
                                    exhaustDate: exhaustDate,
                                    warningDate: warningDate,
                                  };
                                }
                              }
                              logError(
                                `FAILURE: Error occured while UPDATING Application data for packageName:${
                                  input.body.applicationData.packageName
                                } for user: ${
                                  ctx?.session?.user?.id &&
                                  ctx?.session?.user?.id
                                } and applicationId: ${
                                  input.id
                                }, policyholderId: ${
                                  input.body.policyholderId
                                } User name: ${
                                  ctx?.session?.user?.firstName
                                } response: ${
                                  "Record to doesn't match with extended family" +
                                  JSON.stringify(matchingPremium)
                                }`
                              );
                              return handleApiResponseError({
                                inputError:
                                  "Record to doesn't match with extended family",
                              });
                            })
                          : undefined;
                    } else {
                      logError(
                        `FAILURE: Error occured while UPDATING APPLICATION data, for packageName: ${
                          input.body.applicationData.packageName
                        } for User Id: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } User Name: ${
                          ctx.session?.user.firstName
                        } and ApplicationId: ${input.id}, policyholderId: ${
                          input.body.policyholderId
                        } Error: ${
                          "Record to get extended family premium data does not exist." +
                          JSON.stringify(premiumData?.extendedPremium)
                        }`
                      );
                      return handleApiResponseError({
                        inputError:
                          "Record to get extended family premium data does not exist.",
                      });
                    }
                  }
                  if (premiumData && premiumData?.mainPremium) {
                    const { mainMember, spouse, children } =
                      premiumData.mainPremium;
                    const hasChildren = Object.values(childrenMembers)
                      .filter(
                        (child: any) =>
                          child.dateOfBirth ||
                          child.said ||
                          child.age ||
                          child.age === 0
                      )
                      .map((child: any) => {
                        let childAge = child.dateOfBirth
                          ? calculateAgeBasedOnDOB(child.dateOfBirth)
                          : child.said
                          ? calculateAgeBasedOnSaid(child.said)
                          : child.age;
                        return { ...child, age: childAge };
                      });
                    const childrenData =
                      hasChildren?.length > 0
                        ? hasChildren.map((child: any) => {
                            let matchingPlan = null;
                            let exhaustDate;
                            let warningDate;
                            if (child.isStudying || child.isDisabled) {
                              matchingPlan = children?.find(
                                (plan: any) =>
                                  plan.minAge <= child.age &&
                                  plan.maxAge >= child.age &&
                                  (plan.isStudying === child.isStudying ||
                                    plan.isDisabled === child.isDisabled) &&
                                  plan.isStillBorn === child.isStillBorn
                              );
                            } else {
                              matchingPlan = children?.find(
                                (plan: any) =>
                                  plan.minAge <= child.age &&
                                  plan.maxAge >= child.age &&
                                  plan.isStudying === child.isStudying &&
                                  plan.isDisabled === child.isDisabled &&
                                  plan.isStillBorn === child.isStillBorn
                              );
                            }
                            exhaustDate =
                              child?.dateOfBirth &&
                              calculateExhaustDate(
                                child?.dateOfBirth,
                                matchingPlan
                              );
                            warningDate =
                              exhaustDate && calculateWarningDate(exhaustDate);
                            if (matchingPlan && matchingPlan != undefined) {
                              // childrenPremiumAmount +=
                              //   matchingPlan?.premiumAmount;
                              return {
                                ...child,
                                age: child.age,
                                accidentalDeathAmount:
                                  matchingPlan?.coverageAmount,
                                naturalDeathAmount:
                                  matchingPlan?.coverageAmount,
                                // telkomFreeBenefitAmount:
                                //   matchingPlan?.freeCoverageAmount ??
                                //   matchingPlan?.coverageAmount,
                                // premiumAmount: matchingPlan?.premiumAmount,
                                isStudying: child?.isStudying,
                                isDisabled: child?.isDisabled,
                                isStillBorn: child?.isStillBorn,
                                exhaustDate: exhaustDate,
                                warningDate: warningDate,
                              };
                            } else {
                              return null;
                            }
                          })
                        : undefined;

                    const mainMemberData = {
                      naturalDeathAmount: mainMember.coverageAmount,
                      accidentalDeathAmount: mainMember.coverageAmount,
                      // telkomFreeBenefitAmount:
                      //   mainMember?.freeCoverageAmount ??
                      //   mainMember?.coverageAmount,
                      // premiumAmount: mainMember.premiumAmount,
                    };
                    const hasSpouse = Object.values(spouseMember)
                      .filter(
                        (spouse: any) =>
                          spouse.dateOfBirth ||
                          spouse.said ||
                          spouse.age ||
                          spouse.age === 0
                      )
                      .map((spouse: any) => {
                        let spouseAge = spouse.dateOfBirth
                          ? calculateAgeBasedOnDOB(spouse.dateOfBirth)
                          : spouse.said
                          ? calculateAgeBasedOnSaid(spouse.said)
                          : spouse.age;
                        return { ...spouse, age: spouseAge };
                      });
                    const spouseData =
                      hasSpouse &&
                      hasSpouse?.length > 0 &&
                      Array.isArray(spouseMember)
                        ? hasSpouse.map((inputSpouse) => {
                            // spousePremiumAmount +=
                            //   (inputSpouse.age > 0 ||
                            //     inputSpouse.dateOfBirth ||
                            //     inputSpouse.said) &&
                            //   spouse
                            //     ? spouse.premiumAmount
                            //     : 0;
                            return (inputSpouse.age > 0 ||
                              inputSpouse.dateOfBirth ||
                              inputSpouse.said) &&
                              spouse
                              ? {
                                  ...inputSpouse,
                                  naturalDeathAmount: spouse.coverageAmount,
                                  accidentalDeathAmount: spouse.coverageAmount,
                                  // telkomFreeBenefitAmount:
                                  //   spouse?.freeCoverageAmount ??
                                  //   spouse?.coverageAmount,
                                  // premiumAmount: spouse.premiumAmount,
                                }
                              : {};
                          })
                        : undefined;

                    const extendedFamilyData = extendedFamily
                      ? {
                          extendedFamily: [...extendedFamily],
                        }
                      : {};
                    const membersData = {
                      ...members,
                      mainMember: {
                        ...members.mainMember,
                        ...mainMemberData,
                      },
                      ...(childrenData && { children: [...childrenData] }),
                      ...(spouseData && { spouse: [...spouseData] }),
                      ...extendedFamilyData,
                    };

                    const mainMemberPremiumCost =
                      Math.floor(
                        mainMemberPremiumAmount * coverPremiumPercentage * 100
                      ) / 100;
                    const extendedFamilyPremiumCost = Number(
                      extendedFamilyPremiumAmount.toFixed(2)
                    );
                    const totalPremiumCost = parseFloat(
                      (
                        mainMemberPremiumCost + extendedFamilyPremiumAmount
                      ).toFixed(2)
                    );
                    data = {
                      ...data,
                      sumAssured: mainMember.coverageAmount,
                      basePremium: mainMemberPremiumCost,
                      additionalPremium: extendedFamilyPremiumCost,
                      totalPremium: totalPremiumCost,
                      freeBenefitPremium: freeCoverPremium,
                      applicationData: {
                        ...data?.applicationData,
                        members: {
                          ...membersData,
                        },
                      },
                    };
                  } else {
                    logError(
                      `FAILURE: Error occured while UPDATE APPLICATION, for packageName:${
                        input.body.applicationData.packageName
                      } for User Id: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } User Name: ${
                        ctx.session?.user.firstName
                      } and ApplicationId: ${input.id}, policyholderId: ${
                        input.body.policyholderId
                      } Error: ${
                        "Record to get premium data does not exist." +
                        JSON.stringify(premiumData?.mainPremium)
                      }`
                    );
                    return handleApiResponseError({
                      inputError: "Record to get premium data does not exist.",
                    });
                  }
                } catch (error: any) {
                  logError(
                    `FAILURE: Error occured while UPDATE APPLICATION for packageName:${
                      input.body.applicationData.packageName
                    } for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    } User name: ${
                      ctx?.session?.user.firstName
                    }, applicationId:${input.id}, policyholderId: ${
                      input.body.policyholderId
                    } Error: ${JSON.stringify(error)}`
                  );
                  return handleApiResponseError(error);
                }
              } catch (error: any) {
                logError(
                  `FAILURE:Error occured while UPDATE APPLICATION for packageName: ${
                    input.body.applicationData.packageName
                  } for User Id: ${
                    ctx?.session?.user?.id && ctx?.session?.user?.id
                  } User name: ${
                    ctx?.session?.user?.firstName
                  } and policyholderId: ${
                    input.body.policyholderId
                  } Error: ${JSON.stringify(error)}`
                );
                return handleApiResponseError(error);
              }
            },

            EMPLOYEE_MOTOR_CREDITLIFE: async () => {
              const premiumData = await creditLifePremiumCalculation(
                input?.body?.applicationData?.creditLife,
                ctx,
                input?.body?.startDate
              );

              data = {
                ...data,
                sumAssured: premiumData?.sumAssured,
                basePremium: premiumData?.additionalPremium,
                additionalPremium: 0,
                totalPremium: premiumData?.additionalPremium,
                freeBenefitPremium: premiumData?.freeCoverPremium,
                applicationData: {
                  creditLife: {
                    ...premiumData,
                  },
                  packageName: input?.body?.applicationData?.packageName,
                },
              };
            },

            EMPLOYEE_MOTOR_INSURANCE: async () => {},

            EMPLOYEE_DEVICE_INSURANCE: async () => {
              const devicePremiumCal = await devicePremiumData(
                ctx,
                input.body.applicationData.deviceData
              );
              data = {
                ...data,
                sumAssured: devicePremiumCal.devicePrice,
                basePremium: devicePremiumCal.premiumAmount,
                // additionalPremium: 0,
                totalPremium: devicePremiumCal.premiumAmount,
                // freeBenefitPremium: devicePremiumCal?.freeCoverPremium,
                applicationData: {
                  deviceData: {
                    ...devicePremiumCal,
                  },
                  packageName: input.body.applicationData.packageName,
                },
              };
            },

            EMPLOYEE_DEVICE_CREDITLIFE: async () => {
              const premiumData = await deviceCreditLifePremiumCal(
                input?.body?.applicationData.deviceCreditLife,
                ctx,
                input?.body?.startDate
              );
              data = {
                ...data,
                sumAssured: premiumData?.sumAssured,
                basePremium: premiumData?.additionalPremium,
                additionalPremium: 0,
                totalPremium: premiumData?.additionalPremium,
                freeBenefitPremium: premiumData?.freeCoverPremium,
                applicationData: {
                  deviceCreditLife: {
                    ...premiumData,
                  },
                  packageName: input?.body?.applicationData?.packageName,
                },
              };
            },
            DEVICE_INSURANCE: async () => {
              const devicePremiumCalculations = await retailDevicePremiumData(
                ctx,
                input?.body?.applicationData?.deviceData
              );
              const startDate = new Date(data?.startDate);
              const endDate = new Date(data?.startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              data = {
                ...data,
                packageName: input?.body?.applicationData?.packageName,
                sumAssured: devicePremiumCalculations?.devicePrice,
                basePremium: Number(devicePremiumCalculations?.totalPremium),
                totalPremium: Number(devicePremiumCalculations?.totalPremium),
                endDate: endDate,
                renewalDate: renewalDate,
                applicationData: {
                  packageName: input?.body?.applicationData?.packageName,
                  deviceData: {
                    ...devicePremiumCalculations,
                  },
                },
              };
            },

            DEVICE_CREDITLIFE: async () => {
              const deviceCreditlifePremiumCalculations =
                await retailDeviceCreditLifePremiumCal(
                  input.body?.applicationData?.deviceCreditLife,
                  ctx,
                  input?.body?.startDate
                );
              const startDate = new Date(data?.startDate);
              const endDate = new Date(data?.startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              data = {
                ...data,
                packageName: input?.body?.applicationData?.packageName,
                sumAssured: deviceCreditlifePremiumCalculations?.sumAssured,
                basePremium:
                  deviceCreditlifePremiumCalculations?.additionalPremium,
                additionalPremium: 0,
                totalPremium:
                  deviceCreditlifePremiumCalculations?.additionalPremium,
                endDate: endDate,
                renewalDate: renewalDate,
                freeBenefitPremium:
                  deviceCreditlifePremiumCalculations?.freeCoverPremium,
                applicationData: {
                  deviceCreditLife: {
                    ...deviceCreditlifePremiumCalculations,
                  },
                  packageName: input?.body?.applicationData?.packageName,
                },
              };
            },
          };
          try {
            const selectedAction =
              packageActions[
                input?.body?.applicationData?.packageName as PackageName
              ];

            if (selectedAction) {
              await selectedAction();
            } else {
              logError(
                `FAILURE: Error occured while UPDATING APPLICATION for packageName:${
                  input.body.applicationData.packageName
                } for User Id: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User Name: ${
                  ctx.session?.user.firstName
                } and applicationId: ${input.id}, policyholderId: ${
                  input.body.policyholderId
                } Error: ${
                  "Record to get premium data does not exist." +
                  JSON.stringify(
                    `Unknown package name: ${input?.body.applicationData?.packageName}`
                  )
                }`
              );
            }
            let formattedPaymentMethod;
            let request;
            if (paymentMethod) {
              const paymentMethodData = {
                ...data.paymentMethod,
                policyholderId: data.policyholderId,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              delete paymentMethodData.id;
              formattedPaymentMethod =
                convertToObjectWithCreate(paymentMethodData);
              request = {
                ...removeUndefinedAndAddUuid(data),
                paymentMethod: formattedPaymentMethod,
                updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
            } else {
              request = {
                ...removeUndefinedAndAddUuid(data),
                updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
            }
            const application = await prisma.application.update({
              where: {
                id: input.id,
              },
              include: {
                beneficiaries: true,
                paymentMethod: true,
                fileIds: true,
                Leads: true,
              },
              data: {
                ...removeUndefinedAndAddUuid(request),
              },
            });
            const docsExist = application.fileIds.length;
            let documentsOnIssuePolicy;
            if (docsExist > 0) {
              documentsOnIssuePolicy = application?.fileIds;
            }
            const explicitActivities = findObjectDifferences(
              previousApplication,
              application
            );
            const activityDescription = Object.keys(explicitActivities);
            const activitiesData = {
              applicationId: application.id,
              name: applicationActivitiesLabels.updated,
              description: { data: activityDescription },
              differences: explicitActivities,
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            };
            const activitiesResponse = await prisma.applicationActivity.create({
              data: activitiesData,
            });
            if (
              application &&
              application?.status == "APPROVED" &&
              !application.isArchived
            ) {
              const genUniqPolicyNumber = generateUniqueNumber();
              const nextBillingDate = calculateNextBillingDate(
                application?.billingDay,
                dateConversion(application?.startDate)
              );
              const endDate = new Date(application?.startDate);
              endDate.setFullYear(application?.startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              const data: any = {
                ...application,
                endDate: endDate,
                renewalDate: renewalDate,
                status: "ACTIVE",
                nextBillingDate: nextBillingDate,
                policyNumber: genUniqPolicyNumber,
                autoRenewal: true,
                applicationId: application.id,
                paymentMethod: formattedPaymentMethod,
                policyData: application.applicationData,
                createdAt: new Date(),
                ...(application?.Leads?.id && {
                  Leads: {
                    connect: {
                      id: application?.Leads?.id,
                    },
                  },
                }),
              };
              delete data.id;
              delete data.applicationData;
              delete data.fileIds;
              delete data.leadId;
              const restData = removeIdFromArray(data);
              const applicationResponse = removeUndefinedAndAddUuid(restData);
              try {
                const policy = await ctx.prisma.policy.create({
                  include: {
                    beneficiaries: true,
                    policyholder: true,
                  },
                  data: {
                    ...applicationResponse,
                    createdById:
                      ctx?.session?.user?.id && ctx?.session?.user?.id,
                  },
                });
                if (application?.Leads?.id) {
                  const activitiesData = {
                    name: leadActivitiesLabels.updated,
                    description: { data: [leadActivitiesLabels.issuePolicy] },
                    createdById:
                      ctx?.session?.user?.id && ctx?.session?.user?.id,
                  };
                  const formattedActivities =
                    convertToObjectWithCreate(activitiesData);
                  await prisma.leads.update({
                    where: {
                      id: application?.Leads?.id,
                    },
                    data: {
                      status: LeadStatusValues.accepted as LeadStatus,
                      LeadActivity: formattedActivities,
                    },
                  });
                }
                const updatedPolicy = await ctx.prisma.policy.findFirst({
                  where: { id: policy.id },
                  include: {
                    beneficiaries: true,
                    policyholder: true,
                    fileIds: true,
                  },
                });
                const getKeys = await prisma.package.findMany({
                  where: {
                    packageName: updatedPolicy?.packageName,
                  },
                  include: {
                    attachments: {
                      where: {
                        isArchived: false,
                      },
                    },
                  },
                });
                //For generating policy schedule
                let base64;
                if (policy && policy?.policyNumber) {
                  switch (policy.packageName) {
                    case "EMPLOYEE_FUNERAL_INSURANCE":
                      const childAge = findChildrenAged20(
                        ctx,
                        policy?.policyData?.members?.children,
                        policy.policyNumber
                      );
                      base64 = await pdfKit(policy);
                      break;
                    case "EMPLOYEE_MOTOR_CREDITLIFE":
                      const response = await ctx?.prisma?.package.findMany({
                        where: {
                          packageName: policy.packageName,
                        },
                      });
                      base64 = await creditLifePdfkit(policy, response);
                      break;
                    case packageNames.device:
                      base64 = await devicePdfkit(policy);
                      break;
                    case packageNames.creditLifeDevice:
                      const packageResponse =
                        await ctx?.prisma.package.findFirst({
                          where: {
                            packageName: policy.packageName,
                          },
                        });
                      base64 = await creditLifeDevicePdfkit(
                        policy,
                        packageResponse
                      );
                      break;
                    case packageNames.retailDeviceInsurance:
                      base64 = await retailDevicePdfkit(policy);
                      break;
                    case packageNames.retailDeviceCreditLife:
                      const packageData = await ctx?.prisma.package.findFirst({
                        where: {
                          packageName: policy.packageName,
                        },
                      });
                      base64 = await retailCreditLifeDevicePdf(
                        policy,
                        packageData
                      );
                      break;
                    default:
                      break;
                  }

                  if (base64) {
                    await generatePolicySchedule({
                      policy: policy,
                      ctx: ctx,
                      bucketName: env.AWS_BUCKET,
                      s3: s3,
                      prisma: prisma,
                      description: "Policy schedule created",
                      fileName: "Policy schedule- v1",
                      base64: base64,
                    });
                  }
                }

                const updatedPolicyData = await ctx.prisma.policy.findFirst({
                  where: {
                    id: policy.id,
                  },
                  include: {
                    policyholder: true,
                    beneficiaries: true,
                  },
                });
                //For event notification
                if (getKeys) {
                  const eventRequest = {
                    eventName: "POLICY_ISSUED",
                    eventCategory: "POLICY",
                    packageName: updatedPolicy.packageName as PackageName,
                    reqData: updatedPolicyData,
                  };
                  eventNotificationTemplate(
                    ctx,
                    eventRequest,
                    base64,
                    getKeys[0]?.attachments ? getKeys[0].attachments : undefined
                  );
                }

                //Description in Activities
                const explicitActivities = findObjectDifferences(
                  previousApplication,
                  application
                );
                const activityDescription = Object.keys(explicitActivities);
                const activitiesData = {
                  policyId: policy.id,
                  name: policyActivitiesLabels.activate,
                  description: { data: activityDescription },
                  differences: explicitActivities,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                };
                await prisma.policyActivity.create({
                  data: activitiesData,
                });

                //To export docs from application to Policy
                if (docsExist && documentsOnIssuePolicy) {
                  documentsOnIssuePolicy?.map(async (documents: any) => {
                    const payload = {
                      fileUrl: documents.fileUrl,
                      s3response: documents.s3response,
                      name: documents?.name,
                      type: documents?.type,
                      description: documents?.description,
                      isArchived: documents?.isArchived,
                      category: "policy",
                      policyIds: policy?.id,
                    };
                    try {
                      const newUploadFile = await prisma.uploadLibrary.create({
                        data: {
                          fileUrl: payload.fileUrl,
                          policyIds: payload.policyIds,
                          s3response: payload.s3response,
                          name: payload.name,
                          type: payload.type,
                          description: payload.description,
                          createdById:
                            ctx?.session?.user?.id && ctx?.session?.user?.id,
                        },
                        include: {
                          createdBy: {
                            select: {
                              firstName: true,
                              lastName: true,
                            },
                          },
                        },
                      });

                      logInfo(
                        `SUCCESS:  Successfully UPLOADED DOCUMENTS for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } and Response: ${JSON.stringify(newUploadFile)}`
                      );
                      return newUploadFile;
                    } catch (error) {
                      logError(
                        `FAILURE: Error in UPLOAD DOCUMENTS for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } and Error: ${JSON.stringify(error)}`
                      );
                      return handleApiResponseError(error);
                    }
                  });
                }
                return policy;
              } catch (error: any) {
                logError(
                  `FAILURE: Error occured while UPDATING APPLICATION for packageName: ${
                    input.body.applicationData.packageName
                  }  for user: ${
                    ctx?.session?.user?.id && ctx?.session?.user?.id
                  } User name: ${
                    ctx?.session?.user?.firstName
                  } and applicationId: ${input.id}, policyholderId: ${
                    input.body.policyholderId
                  } Error: ${JSON.stringify(error)}`
                );
                return handleApiResponseError(error);
              }
            }
            logInfo(
              `SUCCESS: Successfully UPDATED APPLICATION data, for packageName: ${
                input.body.applicationData.packageName
              } User ID: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user.firstName}, applicatinId: ${
                input.id
              } Response: ${JSON.stringify(application)}`
            );
            return application;
          } catch (error) {
            logError(
              `FAILURE: Error occured while in UPDATATING APPLICATION for packageName: ${
                input.body.applicationData.packageName
              } getting premium for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user?.firstName} applicationId: ${
                input.id
              }, policyholderId: ${
                input.body.policyholderId
              } and  Error: ${JSON.stringify(error)}`
            );
            return handleApiResponseError(error);
          }
        } else {
          logError(
            `FAILURE: Error occured while in UPDATATING APPLCATION for packageName: ${
              input.body.applicationData.packageName
            } user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName},applicationId: ${
              input.id
            }, policyholderId: ${input.body.policyholderId} and Error: ${
              "Total beneficiaries percentage should be equal to 100." +
              JSON.stringify(totalPreviousBenefPercentage)
            } or Policy is not in ACTIVE state.`
          );
          throw new TRPCError({
            message: `Total beneficiaries percentage is not equal to 100 or Policy is not in ACTIVE state or Policy is Archived.`,
            code: "BAD_REQUEST",
            cause: 400,
          });
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while UPDATAING APPLICATION for packageName: ${
            input.body.applicationData.packageName
          } for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName}, applicationId: ${
            input.id
          }, policyholderId: ${
            input.body.policyholderId
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  updateBeneficiary: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        body: updateBeneficiaryInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE BENEFICIARY, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const { beneficiaries } = input.body;
        const previousApplication = await ctx.prisma.application.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
          },
        });
        const totalPreviousBenefPercentage =
          checkPreviousCurrentPercentageTotal(
            previousApplication?.beneficiaries,
            beneficiaries
          );
        if (previousApplication?.status == "PENDING") {
          const totalBenefPercentage =
            beneficiaries?.length > 0
              ? checkPercentageTotal(beneficiaries)
              : true;
          if (totalBenefPercentage && totalPreviousBenefPercentage) {
            try {
              let request = {
                ...removeUndefinedAndAddUuid(input.body),
                updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };

              const application: any = await prisma.application.update({
                where: {
                  id: input.id,
                },
                data: {
                  ...request,
                },
                include: {
                  beneficiaries: true,
                },
              });
              const explicitActivities = findObjectDifferences(
                previousApplication,
                application
              );
              const activityDescription = Object.keys(explicitActivities);
              const activitiesData = {
                applicationId: previousApplication.id,
                name: applicationActivitiesLabels.beneficiary,
                description: { data: activityDescription },
                differences: explicitActivities,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              const activitiesResponse =
                await prisma.applicationActivity.create({
                  data: activitiesData,
                });
              logInfo(
                `SUCCESS: Successfully UPDATED BENEFICIARY Data, in Application for User Id: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User Name: ${
                  ctx.session?.user.firstName
                } and ApplicationId: ${input.id} Error: ${JSON.stringify(
                  application
                )}`
              );
              return application;
            } catch (error) {
              logError(
                `FAILURE: Error in UPDATE BENEFICIARY in Application, for User Id: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User Name: ${
                  ctx.session?.user.firstName
                } and ApplicationId: ${input.id} Error: ${JSON.stringify(
                  error
                )}`
              );
              return handleApiResponseError(error);
            }
          } else {
            logError(
              `FAILURE: Error in UPDATE BENEFICIARY in Application, for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user?.firstName} and Error: ${
                "Total beneficiaries percentage should be equal to 100." +
                JSON.stringify(totalBenefPercentage)
              }`
            );
            throw new TRPCError({
              message: `Total beneficiaries percentage should be equal to 100.`,
              code: "BAD_REQUEST",
              cause: 400,
            });
          }
        } else {
          logError(
            `FAILURE: Error in UPDATE BENEFICIARY in Application, for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} and ApplicationId: ${
              input.id
            } and Error: ${JSON.stringify(
              "Don't have access to update beneficiaries" + previousApplication
            )}`
          );
          throw new Error("Don't have access to update beneficiaries");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE BENEFICIARY in Application, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
            input.id
          } response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  archived: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for ARCHIVE APPLICATION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.application.update({
          where: {
            id: input.id,
          },
          data: {
            status: "REJECTED",
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully ARCHIVE APPLICATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
            input.id
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE APPLICATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  updatePayment: protectedProcedure
    .input(z.object({ id: z.string(), body: updatePolicyPaymentInputSchema() }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: for UPDATE PAYMENT in Application for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const previousApplication = await ctx.prisma.application.findFirst({
          where: {
            id: input.id,
          },
          include: {
            policyholder: true,
            paymentMethod: true,
          },
        });
        if (previousApplication && previousApplication?.policyholderId) {
          const paymentMethodData = {
            ...input.body,
            policyholderId: previousApplication?.policyholderId,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          delete paymentMethodData?.id;

          let request = {
            paymentMethod: convertToObjectWithCreate(paymentMethodData),
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };

          const application: any = await prisma.application.update({
            where: {
              id: input.id,
            },
            data: {
              ...request,
            },
            include: {
              paymentMethod: true,
              policyholder: true,
            },
          });
          const explicitActivities = findObjectDifferences(
            previousApplication,
            application
          );
          const activityDescription = Object.keys(explicitActivities);
          const activitiesData = {
            name: applicationActivitiesLabels.paymentUpdate,
            description: { data: activityDescription },
            differences: explicitActivities,
            applicationId: previousApplication.id,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          const activitiesResponse = await prisma.applicationActivity.create({
            data: activitiesData,
          });
          logInfo(
            `SUCCESS: Successfully PAYMENT UPDATED in Application, for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} And applicationId ${
              input.id
            } Response: ${JSON.stringify(application)}`
          );
          return application;
        } else {
          logError(
            `FAILURE: Error occured in PAYMENT UPDATE in Application for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} And applicationId ${
              input.id
            } Error: ${"Failed to fetch policy data"}`
          );
          throw new Error("Failed to fetch policy data");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error occured in PAYMENT UPDATE in Application for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} And applicationId ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  status: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(applicationStatus),
        leadId: z.string().optional(),
        applicationOnhold: z.boolean().optional(),
        applicationRejected: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for STATUS Application for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const currentApplication = await ctx.prisma.application.findFirst({
          where: {
            id: input.id,
          },

          include: {
            paymentMethod: true,
          },
        });

        if (!currentApplication) {
          logError(
            `FAILURE: Error in STATUS Application for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
              input.id
            } Error: ${
              "Cannot change status" + JSON.stringify(currentApplication)
            }`
          );
          throw new Error("Cannot change status");
        }

        if (input.status === "APPROVED" && currentApplication) {
          logError(
            `FAILURE: Error in STATUS Application for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
              input.id
            } Error: ${
              "Cannot change status to APPROVED , update application" +
              JSON.stringify(currentApplication)
            }`
          );
          throw new Error(
            "Cannot change status to APPROVED , update application"
          );
        }

        if (input.leadId) {
          await prisma.leads.update({
            where: {
              id: input.leadId,
            },
            data: {
              ...(input.status === "PENDING" && input?.applicationOnhold
                ? {
                    applicationOnHold: true,
                    LeadActivity: {
                      create: [
                        {
                          name: leadActivitiesLabels.onhold,
                          createdBy: {
                            connect: {
                              id: ctx?.session?.user?.id
                                ? parseInt(ctx?.session?.user?.id)
                                : 0,
                            },
                          },
                        },
                      ],
                    },
                  }
                : input.status === "REJECTED" && {
                    applicationRejected: true,
                    status: LeadStatusValues.declined as LeadStatus,
                    LeadActivity: {
                      create: [
                        {
                          name: leadActivitiesLabels.applicationRejected,
                          createdBy: {
                            connect: {
                              id: ctx?.session?.user?.id
                                ? parseInt(ctx?.session?.user?.id)
                                : 0,
                            },
                          },
                        },
                      ],
                    },
                  }),
            },
          });
        }

        const application = await prisma.application.update({
          where: {
            id: input.id,
          },
          data: {
            status: input.status,
          },
          include: {
            paymentMethod: true,
          },
        });

        const explicitActivities = findObjectDifferences(
          currentApplication,
          application
        );
        const activityDescription = Object.keys(explicitActivities);
        const activitiesData = {
          applicationId: application.id,
          name: applicationActivitiesLabels.updated,
          description: { data: activityDescription },
          differences: explicitActivities,
          // createdById: ctx?.session?.user?.id && Number(ctx?.session?.user?.id),
        };
        const activitiesResponse = await prisma.applicationActivity.create({
          data: activitiesData,
        });
        logInfo(
          `SUCCESS: Successfully changed STATUS of the Application to ${
            input.status
          } for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
            input.id
          } Response: ${JSON.stringify(application)}`
        );
        return application;
      } catch (error: any) {
        logError(
          `FAILURE: Error in STATUS Application for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and applicationId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );

        return handleApiResponseError(error);
      }
    }),

  checkunattendedApplications: protectedProcedure.mutation(
    async ({ ctx, input }: any) => {
      logInfo(`Checking UNATTENDED Applications as  on ${new Date()}`);
      try {
        let result = {
          count: 0,
          data: [] as any,
        };
        const today = new Date();
        const UnattendedApplicationthreshold = new Date(today);
        UnattendedApplicationthreshold.setDate(
          today.getDate() - maxDaysForUnattendedApplication
        );
        const unattendedApplication = await prisma.application.findMany({
          where: {
            status: "PENDING",
            leadId: {
              not: "null",
            },
            createdAt: {
              lte: UnattendedApplicationthreshold,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            policyholder: true,
          },
        });
        if (unattendedApplication.length > 0) {
          result.count = unattendedApplication.length;
          result.data = unattendedApplication;
          const applicationData = getApplicationString(unattendedApplication);
          const eventRequest = {
            eventName: "APPLICATION_UNATTENDED",
            eventCategory: "APPLICATION",
            packageName: "EMPLOYEE_FUNERAL_INSURANCE",
            reqData: { table: applicationData },
          };
          eventNotificationTemplate(
            ctx,
            eventRequest,
            undefined,
            undefined,
            env.ADMINSTRATOR_MAIL
          );
          logInfo(
            `SUCCESS: Successfully fetched unattended leads Response: ${result}`
          );
          return result;
        } else {
          return result;
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in STATUS Application for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and leadId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );

        return handleApiResponseError(error);
      }
    }
  ),
});

function createApplicationInputSchema() {
  const applicationData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_FUNERAL_INSURANCE"),
      withFreeBenefit: z.boolean().optional(),
      members: z.object({
        mainMember: z
          .object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            dateOfBirth: z.date(),
            said: z.string().length(13),
            age: z
              .number()
              .min(employeeFuneralAges.mainMember.minAge)
              .max(employeeFuneralAges.mainMember.maxAge)
              .optional(),
            email: z.string().email().optional(),
            naturalDeathAmount: z.number().optional(),
            accidentalDeathAmount: z.number().optional(),
            // telkomFreeBenefitAmount: z.number().optional(),
            premiumAmount: z.number().optional(),
          })
          .optional(),
        spouse: z
          .array(
            z.object({
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              dateOfBirth: z.date(),
              said: z.string().length(13),
              age: z
                .number()
                .min(employeeFuneralAges.spouse.minAge)
                .max(employeeFuneralAges.spouse.maxAge)
                .optional(),
              email: z.string().email().optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              // telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
            })
          )
          .max(4)
          .optional(),
        children: z
          .array(
            z
              .object({
                id: z.string().optional(),
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                dateOfBirth: z.date().optional(),
                said: z.string().length(13).optional(),
                age: z.number().optional(),
                email: z.string().email().optional(),
                naturalDeathAmount: z.number().optional(),
                accidentalDeathAmount: z.number().optional(),
                // telkomFreeBenefitAmount: z.number().optional(),
                premiumAmount: z.number().optional(),
                isStudying: z.boolean(),
                isStillBorn: z.boolean(),
                isDisabled: z.boolean(),
              })
              .superRefine((schema, ctx): any => {
                if (!!schema.dateOfBirth) {
                  const age = validateAge(schema.dateOfBirth);
                  if (
                    age >= employeeFuneralAges.children.minAge &&
                    age <= employeeFuneralAges.children.maxAge
                  ) {
                    return z.NEVER;
                  } else if (
                    (age > employeeFuneralAges.children.maxAge &&
                      age <= employeeFuneralAges.children.studyingMaxAge &&
                      schema.isStudying == true) ||
                    schema.isDisabled == true
                  ) {
                    schema.age = age;
                    return schema.age;
                  } else if (
                    age > employeeFuneralAges.children.studyingMaxAge &&
                    age <= employeeFuneralAges.children.disabledMaxAge &&
                    schema.isDisabled
                  ) {
                    return z.NEVER;
                  } else if (
                    age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                      fatal: false,
                    });
                  }
                } else if (!!schema.said) {
                  const dob = dateSAIDvalidation(schema.said);
                  const age = validateAge(dob);
                  if (
                    age >= employeeFuneralAges.children.minAge &&
                    age <= employeeFuneralAges.children.maxAge
                  ) {
                    return z.NEVER;
                  } else if (
                    (age > employeeFuneralAges.children.maxAge &&
                      age <= employeeFuneralAges.children.studyingMaxAge &&
                      schema.isStudying == true) ||
                    schema.isDisabled == true
                  ) {
                    return z.NEVER;
                  } else if (
                    age > employeeFuneralAges.children.studyingMaxAge &&
                    age <= employeeFuneralAges.children.disabledMaxAge &&
                    schema.isDisabled
                  ) {
                    return z.NEVER;
                  } else if (
                    age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                      fatal: false,
                    });
                  }
                } else if (
                  schema.age ||
                  schema.age == employeeFuneralAges.children.minAge
                ) {
                  if (
                    schema.age == employeeFuneralAges.children.minAge &&
                    schema.isStillBorn
                  ) {
                    return z.NEVER;
                  } else if (
                    schema.age >= employeeFuneralAges.children.minAge &&
                    schema.age <= employeeFuneralAges.children.maxAge
                  ) {
                    return z.NEVER;
                  } else if (
                    (schema.age > employeeFuneralAges.children.maxAge &&
                      schema.age <=
                        employeeFuneralAges.children.studyingMaxAge &&
                      schema.isStudying == true) ||
                    schema.isDisabled == true
                  ) {
                    return z.NEVER;
                  } else if (
                    schema.age > employeeFuneralAges.children.studyingMaxAge &&
                    schema.age <= employeeFuneralAges.children.disabledMaxAge &&
                    schema.isDisabled
                  ) {
                    return z.NEVER;
                  } else if (
                    schema.age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                      fatal: false,
                    });
                  }
                } else {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                    fatal: false,
                  });
                }
              })
          )
          .optional(),
        extendedFamily: z
          .array(
            z.object({
              options: z.enum(coverageOptions),
              id: z.string().optional(),
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              dateOfBirth: z.date(),
              said: z.string().length(13),
              age: z
                .number()
                .min(employeeFuneralAges.extendedFamily.minAge)
                .max(employeeFuneralAges.extendedFamily.maxAge)
                .optional(),
              email: z.string().email().optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              // telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              relation: z.enum(relation),
            })
          )
          .max(14)
          .optional(),
        mainMemberPremium: z.number().optional(),
        extendedFamilyPremium: z.number().optional(),
      }),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_INSURANCE"),
      members: z.string(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_INSURANCE"),
      deviceType: z.string(),
      isRecentPurchase: z.boolean(),
      devicePrice: z.number(),
      deviceUniqueNumber: z.string().optional(),
      deviceBrand: z.string().optional(),
      deviceModel: z.string().optional(),
      deviceStorage: z.string().optional(),
      deviceModelColor: z.string().optional(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_CREDITLIFE"),
      vinNumber: z.string(),
      additionalPercentageInsured: z
        .enum(additionalPercentageInsured)
        .optional(),
      vehicleFinancedBy: z.enum(financedBy),
      outstandingSettlementBalance: z.number(),
      loanSettlementAtInception: z.number().optional(),
    }),

    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_CREDITLIFE"),
      deviceUniqueNumber: z.string(),
      additionalPercentageInsured: z
        .enum(additionalPercentageInsured)
        .optional(),
      deviceFinancedBy: z.enum(financedBy),
      outstandingSettlementBalance: z.number(),
      loanSettlementAtInception: z.number().optional(),
    }),
    z.object({
      packageName: z.literal("DEVICE_INSURANCE"),
      deviceData: z.object({
        deviceType: z.string().optional(),
        isRecentPurchase: z.boolean().optional(),
        devicePrice: z.number().optional(),
        deviceUniqueNumber: z.string().optional(),
        deviceBrand: z.string().optional(),
        deviceModel: z.string().optional(),
        deviceStorage: z.string().optional(),
        deviceModelColor: z.string().optional(),
      }),
    }),
    z.object({
      packageName: z.literal("DEVICE_CREDITLIFE"),
      deviceCreditLife: z.object({
        deviceUniqueNumber: z.string().optional(),
        additionalPercentageInsured: z
          .enum(additionalPercentageInsured)
          .optional(),
        deviceFinancedBy: z.enum(financedBy),
        outstandingSettlementBalance: z.number().optional(),
        loanSettlementAtInception: z.number().optional(),
      }),
    }),
  ]);

  return z.object({
    // packageName: z.enum(packageName),
    billingDay: z.number(),
    status: z.enum(applicationStatus).optional(),
    options: z.enum(coverageOptions).optional(),
    billingFrequency: z.enum(premiumFrequency),
    applicationData: applicationData,
    startDate: z.date().refine((date) => new Date() < date, {
      message: "start date should be after current date",
    }),
    sumAssured: z.number().optional(),
    basePremium: z.number().optional(),
    billingAmount: z.number().optional(),
    nextBillingDate: z.date().optional(),
    nextBillingAmount: z.number().optional(),
    balance: z.number().optional(),
    endDate: z.date().optional(),
    schemeType: z.enum(schemeType).optional(),
    renewalDate: z.date().optional(),
    autoRenewal: z.boolean().optional(),
    beneficiaries: z
      .array(
        z.object({
          id: z.number().optional(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          percentage: z.number(),
          relation: z.string(),
          identification: z.object({
            country: z.string(),
            passportNumber: z.string().optional(),
            said: z.string().length(13).optional(),
            trustNumber: z.string().optional(),
          }),
          gender: z.enum(gender),
          dateOfBirth: z.date().optional(),
          phone: z.string().refine(validator.isMobilePhone),
        })
      )
      .optional(),
    appData: z.record(z.unknown()).optional(),
    isArchived: z.boolean().optional(),
    policyholderId: z.string(),
    policyholder: z
      .object({
        id: z.string(),
      })
      .optional(),
    fileIds: z.array(z.string()).optional(),
    paymentMethod: z
      .object({
        id: z.number().optional(),
        collectionType: z.string().optional(),
        accountHolder: z.string().optional(),
        bank: z.string().optional(),
        branchCode: z.string().optional(),
        accountNumber: z.string().optional(),
        accountType: z.string().optional(),
        externalReference: z.string().optional(),
        billingAddress: z.string().optional(),
        paymentMethodType: z.enum(PaymentMethodType).optional(),
      })
      .optional(),
  });
}

function updateApplicationInputSchema() {
  const applicationData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_FUNERAL_INSURANCE"),
      members: z.object({
        mainMember: z
          .object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            dateOfBirth: z.date().optional(),
            said: z.string().length(13).optional(),
            age: z
              .number()
              .min(employeeFuneralAges.mainMember.minAge)
              .max(employeeFuneralAges.mainMember.maxAge)
              .optional(),
            email: z.string().email().optional(),
            naturalDeathAmount: z.number().optional(),
            accidentalDeathAmount: z.number().optional(),
            // telkomFreeBenefitAmount: z.number().optional(),
            premiumAmount: z.number().optional(),
            createdAt: z.date().optional(),
            updatedAt: z.date().optional(),
          })
          .optional(),
        spouse: z
          .array(
            z.object({
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              dateOfBirth: z.date().optional(),
              said: z.string().length(13).optional(),
              age: z
                .number()
                .min(employeeFuneralAges.spouse.minAge)
                .max(employeeFuneralAges.spouse.maxAge)
                .optional(),
              email: z.string().email().optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              // telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              createdAt: z.date().optional(),
              updatedAt: z.date().optional(),
            })
          )
          .max(4)
          .optional(),
        children: z
          .array(
            z
              .object({
                id: z.string().optional(),
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                dateOfBirth: z.date().optional(),
                said: z.string().length(13).optional(),
                age: z.number().optional(),
                email: z.string().email().optional(),
                naturalDeathAmount: z.number().optional(),
                accidentalDeathAmount: z.number().optional(),
                // telkomFreeBenefitAmount: z.number().optional(),
                premiumAmount: z.number().optional(),
                isStudying: z.boolean(),
                isDisabled: z.boolean(),
                isStillBorn: z.boolean(),
                createdAt: z.date().optional(),
                updatedAt: z.date().optional(),
              })
              .superRefine((schema, ctx): any => {
                if (!!schema.dateOfBirth) {
                  const age = validateAge(schema.dateOfBirth);
                  if (
                    age >= employeeFuneralAges.children.minAge &&
                    age <= employeeFuneralAges.children.maxAge
                  ) {
                    return z.NEVER;
                  } else if (
                    (age > employeeFuneralAges.children.maxAge &&
                      age <= employeeFuneralAges.children.studyingMaxAge &&
                      schema.isStudying == true) ||
                    schema.isDisabled == true
                  ) {
                    schema.age = age;
                    return schema.age;
                  } else if (
                    age > employeeFuneralAges.children.studyingMaxAge &&
                    age <= employeeFuneralAges.children.disabledMaxAge &&
                    schema.isDisabled
                  ) {
                    return z.NEVER;
                  } else if (
                    age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                      fatal: false,
                    });
                  }
                } else if (!!schema.said) {
                  const dob = dateSAIDvalidation(schema.said);
                  const age = validateAge(dob);
                  if (
                    age >= employeeFuneralAges.children.minAge &&
                    age <= employeeFuneralAges.children.maxAge
                  ) {
                    return z.NEVER;
                  } else if (
                    (age > employeeFuneralAges.children.maxAge &&
                      age <= employeeFuneralAges.children.studyingMaxAge &&
                      schema.isStudying == true) ||
                    schema.isDisabled == true
                  ) {
                    return z.NEVER;
                  } else if (
                    age > employeeFuneralAges.children.studyingMaxAge &&
                    age <= employeeFuneralAges.children.disabledMaxAge &&
                    schema.isDisabled
                  ) {
                    return z.NEVER;
                  } else if (
                    age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                      fatal: false,
                    });
                  }
                } else if (
                  schema.age ||
                  schema.age == employeeFuneralAges.children.minAge
                ) {
                  if (
                    schema.age == employeeFuneralAges.children.minAge &&
                    schema.isStillBorn
                  ) {
                    return z.NEVER;
                  } else if (
                    schema.age >= employeeFuneralAges.children.minAge &&
                    schema.age <= employeeFuneralAges.children.maxAge
                  ) {
                    return z.NEVER;
                  } else if (
                    (schema.age > employeeFuneralAges.children.maxAge &&
                      schema.age <=
                        employeeFuneralAges.children.studyingMaxAge &&
                      schema.isStudying == true) ||
                    schema.isDisabled == true
                  ) {
                    return z.NEVER;
                  } else if (
                    schema.age > employeeFuneralAges.children.studyingMaxAge &&
                    schema.age <= employeeFuneralAges.children.disabledMaxAge &&
                    schema.isDisabled
                  ) {
                    return z.NEVER;
                  } else if (
                    schema.age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                      fatal: false,
                    });
                  }
                } else {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                    fatal: false,
                  });
                }
              })
          )
          .optional(),
        extendedFamily: z
          .array(
            z.object({
              id: z.string().optional(),
              options: z.enum(coverageOptions),
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              dateOfBirth: z.date().optional(),
              said: z.string().length(13).optional(),
              age: z
                .number()
                .min(employeeFuneralAges.extendedFamily.minAge)
                .max(employeeFuneralAges.extendedFamily.maxAge)
                .optional(),
              email: z.string().email().optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              // telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              relation: z.enum(relation),
              createdAt: z.date().optional(),
              updatedAt: z.date().optional(),
            })
          )
          .max(14)
          .optional(),
        mainMemberPremium: z.number().optional(),
        extendedFamilyPremium: z.number().optional(),
      }),
      withFreeBenefit: z.boolean().optional(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_INSURANCE"),
      members: z.string(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_INSURANCE"),
      deviceData: z.object({
        deviceType: z.string().optional(),
        devicePrice: z.number(),
        deviceUniqueNumber: z.string().optional(),
        deviceBrand: z.string().optional(),
        deviceModel: z.string().optional(),
        deviceStorage: z.string().optional(),
        deviceModelColor: z.string().optional(),
      }),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_CREDITLIFE"),
      creditLife: z.object({
        vinNumber: z.string().optional(),
        additionalPercentageInsured: z
          .enum(additionalPercentageInsured)
          .optional(),
        vehicleFinancedBy: z.enum(financedBy),
        outstandingSettlementBalance: z.number().optional(),
        loanSettlementAtInception: z.number().optional(),
      }),
    }),

    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_CREDITLIFE"),
      deviceCreditLife: z.object({
        deviceUniqueNumber: z.string().optional(),
        additionalPercentageInsured: z
          .enum(additionalPercentageInsured)
          .optional(),
        deviceFinancedBy: z.enum(financedBy),
        outstandingSettlementBalance: z.number().optional(),
        loanSettlementAtInception: z.number().optional(),
      }),
    }),

    z.object({
      packageName: z.literal("DEVICE_INSURANCE"),
      deviceData: z.object({
        deviceType: z.string().optional(),
        isRecentPurchase: z.boolean().optional(),
        devicePrice: z.number().optional(),
        deviceUniqueNumber: z.string().optional(),
        deviceBrand: z.string().optional(),
        deviceModel: z.string().optional(),
        deviceStorage: z.string().optional(),
        deviceModelColor: z.string().optional(),
      }),
    }),
    z.object({
      packageName: z.literal("DEVICE_CREDITLIFE"),
      deviceCreditLife: z.object({
        deviceUniqueNumber: z.string().optional(),
        additionalPercentageInsured: z
          .enum(additionalPercentageInsured)
          .optional(),
        deviceFinancedBy: z.enum(financedBy),
        outstandingSettlementBalance: z.number().optional(),
        loanSettlementAtInception: z.number().optional(),
      }),
    }),
  ]);

  return z.object({
    billingDay: z.number(),
    status: z.enum(applicationStatus),
    options: z.enum(coverageOptions)?.optional(),
    billingFrequency: z.enum(premiumFrequency),
    applicationData: applicationData,
    startDate: z.date(),
    sumAssured: z.number().optional(),
    basePremium: z.number().optional(),
    billingAmount: z.number().optional(),
    nextBillingDate: z.date().optional(),
    nextBillingAmount: z.number().optional(),
    balance: z.number().optional(),
    endDate: z.date().optional(),
    schemeType: z.enum(schemeType).optional(),
    renewalDate: z.date().optional(),
    autoRenewal: z.boolean().optional(),
    appData: z.record(z.unknown()).optional(),
    isArchived: z.boolean().optional(),
    policyholderId: z.string(),
    fileIds: z.array(z.string()).optional(),
    paymentMethod: z
      .object({
        id: z.number().optional(),
        collectionType: z.string().optional(),
        accountHolder: z.string().optional(),
        bank: z.string().optional(),
        branchCode: z.string().optional(),
        accountNumber: z.string().optional(),
        accountType: z.string().optional(),
        externalReference: z.string().optional(),
        billingAddress: z.string().optional(),
        paymentMethodType: z.enum(PaymentMethodType).optional(),
      })
      .optional(),
  });
}

function updateBeneficiaryInputSchema() {
  return z.object({
    beneficiaries: z.array(
      z.object({
        id: z.number().optional(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        percentage: z.number(),
        relation: z.string(),
        identification: z.object({
          country: z.string(),
          passportNumber: z.string().optional(),
          said: z.string().length(13).optional(),
          trustNumber: z.string().optional(),
        }),
        gender: z.enum(gender),
        dateOfBirth: z.date().optional(),
        phone: z.string().refine(validator.isMobilePhone),
      })
    ),
  });
}

function getApplicationFamilyInputSchema() {
  return z.object({
    familyRelation: z.enum(familyRelationship),
    children: z
      .array(
        z
          .object({
            id: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            dateOfBirth: z.date().optional(),
            said: z.string().length(13).optional(),
            age: z.number().optional(),
            isDisabled: z.boolean().optional(),
            isStudying: z.boolean().optional(),
            isStillBorn: z.boolean().optional(),
            email: z.string().email().optional(),
            naturalDeathAmount: z.number().optional(),
            accidentalDeathAmount: z.number().optional(),
            // telkomFreeBenefitAmount: z.number().optional(),
            premiumAmount: z.number().optional(),
          })
          .superRefine((schema, ctx): any => {
            if (!!schema.dateOfBirth) {
              const age = validateAge(schema.dateOfBirth);
              if (
                age >= employeeFuneralAges.children.minAge &&
                age <= employeeFuneralAges.children.maxAge
              ) {
                return z.NEVER;
              } else if (
                (age > employeeFuneralAges.children.maxAge &&
                  age <= employeeFuneralAges.children.studyingMaxAge &&
                  schema.isStudying == true) ||
                schema.isDisabled == true
              ) {
                schema.age = age;
                return schema.age;
              } else if (
                age > employeeFuneralAges.children.studyingMaxAge &&
                age <= employeeFuneralAges.children.disabledMaxAge &&
                schema.isDisabled
              ) {
                return z.NEVER;
              } else if (age > employeeFuneralAges.children.disabledMaxAge) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                  fatal: false,
                });
              }
            } else if (!!schema.said) {
              const dob = dateSAIDvalidation(schema.said);
              const age = validateAge(dob);
              if (
                age >= employeeFuneralAges.children.minAge &&
                age <= employeeFuneralAges.children.maxAge
              ) {
                return z.NEVER;
              } else if (
                (age > employeeFuneralAges.children.maxAge &&
                  age <= employeeFuneralAges.children.studyingMaxAge &&
                  schema.isStudying == true) ||
                schema.isDisabled == true
              ) {
                return z.NEVER;
              } else if (
                age > employeeFuneralAges.children.studyingMaxAge &&
                age <= employeeFuneralAges.children.disabledMaxAge &&
                schema.isDisabled
              ) {
                return z.NEVER;
              } else if (age > employeeFuneralAges.children.disabledMaxAge) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                  fatal: false,
                });
              }
            } else if (
              schema.age ||
              schema.age == employeeFuneralAges.children.minAge
            ) {
              if (
                schema.age == employeeFuneralAges.children.minAge &&
                schema.isStillBorn
              ) {
                return z.NEVER;
              } else if (
                schema.age >= employeeFuneralAges.children.minAge &&
                schema.age <= employeeFuneralAges.children.maxAge
              ) {
                return z.NEVER;
              } else if (
                (schema.age > employeeFuneralAges.children.maxAge &&
                  schema.age <= employeeFuneralAges.children.studyingMaxAge &&
                  schema.isStudying == true) ||
                schema.isDisabled == true
              ) {
                return z.NEVER;
              } else if (
                schema.age > employeeFuneralAges.children.studyingMaxAge &&
                schema.age <= employeeFuneralAges.children.disabledMaxAge &&
                schema.isDisabled
              ) {
                return z.NEVER;
              } else if (
                schema.age > employeeFuneralAges.children.disabledMaxAge
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                  fatal: false,
                });
              }
            } else {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,

                fatal: false,
              });
            }
          })
      )
      .optional(),
    extendedFamily: z
      .array(
        z.object({
          id: z.number().optional(),
          options: z.enum(coverageOptions),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          dateOfBirth: z.date().optional(),
          said: z.string().length(13).optional(),
          age: z
            .number()
            .min(employeeFuneralAges.extendedFamily.minAge)
            .max(employeeFuneralAges.extendedFamily.maxAge)
            .optional(),
          email: z.string().email().optional(),
          naturalDeathAmount: z.number().optional(),
          accidentalDeathAmount: z.number().optional(),
          // telkomFreeBenefitAmount: z.number().optional(),
          premiumAmount: z.number().optional(),
          relation: z.enum(relation),
        })
      )
      .max(14)
      .optional(),
    mainMemberPremium: z.number().optional(),
    extendedFamilyPremium: z.number().optional(),
  });
}

function updatePolicyPaymentInputSchema() {
  return z.object({
    id: z.number().optional(),
    collectionType: z.string().optional(),
    accountHolder: z.string().optional(),
    bank: z.string().optional(),
    branchCode: z.string().optional(),
    accountNumber: z.string().optional(),
    accountType: z.string().optional(),
    externalReference: z.string().optional(),
    billingAddress: z.string().optional(),
    paymentMethodType: z.enum(PaymentMethodType).optional(),
  });
}

type IPolicyMemberDetails = {
  id: number;
  options: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  said: string;
  age: number;
  email: string;
  naturalDeathAmount: number;
  accidentalDeathAmount: number;
  telkomFreeBenefitAmount: number;
  premiumAmount: number;
  relation: string;
};
