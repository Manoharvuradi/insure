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
  buildMainMember,
  calculateAgeBasedOnDOB,
  calculateAgeBasedOnSaid,
  checkPercentageTotal,
  checkPreviousCurrentPercentageTotal,
  convertInputToUpdateObject,
  convertToObjectWithCreate,
  coverageOptions,
  employeeFuneralAges,
  eventNotificationTemplate,
  familyRelationship,
  gender,
  generatePDF,
  generateUniqueNumber,
  packageNames,
  pagination,
  phoneRegex,
  policyActivitiesLabels,
  policyStatus,
  premiumFrequency,
  relation,
  removeUndefinedAndAddUuid,
  removeUndefinedAndAddUuidForJSON,
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
import { dateSAIDvalidation, validateAge } from "~/utils/helpers/validations";
import {
  findObjectDifferences,
  addMainPremiums,
  freeBenefitPremiumCalculation,
  handleApiResponseError,
  calculateExhaustDate,
  calculateWarningDate,
  getRuleForGivenDate,
  findLimit,
  capitalizedConvertion,
  Capitalize,
} from "~/utils/helpers";
import ReactDOMServer from "react-dom/server";
import PdfTemplate from "~/components/template/pdfTemplate";
import AWS from "aws-sdk";
import { pdfKit } from "~/utils/helpers/pdfkit";
import { generatePolicySchedule } from "~/utils/constants/policy";
import { roleValues } from "~/utils/constants/user";
import { PackageName } from "@prisma/client";
import { creditLifePdfkit } from "~/utils/helpers/creditLifePdfkit";
import { env } from "~/env.mjs";
import { devicePdfkit } from "~/utils/helpers/devicePdfkit";
import { financedBy } from "~/utils/constants/application";
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

export const policyRouter = createTRPCRouter({
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
        `REQUEST for LIST POLICY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        let user;
        const queryOptions: any = {
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
          where: {
            isArchived: false,
          },
          include: {
            beneficiaries: true,
            policyholder: true,
            paymentMethod: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        };
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
                policyNumber: { contains: input?.search, mode: "insensitive" },
              },
              {
                id: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                applicationId: { contains: input?.search, mode: "insensitive" },
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
                policyData: {
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
        if (ctx.session?.user?.roles.includes(roleValues.agent)) {
          user = await ctx.prisma.credentialsUser.findFirst({
            where: {
              id: Number(ctx?.session?.user?.id),
            },
          });
          if (user?.callCenterId) {
            queryOptions.where = {
              ...queryOptions.where,
              application: {
                createdBy: {
                  callCenterId: user?.callCenterId,
                },
              },
            };
          }
        }
        if (input?.sort) {
          const [field, order]: any = input?.sort.split(":");
          queryOptions.orderBy = {
            [field]: order === "desc" ? "desc" : "asc",
          };
        }

        const totalCount = await ctx.prisma.policy.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.policy.findMany(queryOptions);
        logInfo(
          `SUCCESS: LIST POLICY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }  User name: ${
            ctx?.session?.user?.firstName
          } and Response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error LIST POLICY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }  User name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  show: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW POLICY for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } User name: ${
        ctx?.session?.user?.firstName
      } and policyId: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.policy.findFirst({
        where: {
          id: input,
        },
        include: {
          Leads: true,
          paymentMethod: true,
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
          beneficiaries: true,
          policyholder: true,
          policyPayments: true,
          payments: true,
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
          claims: {
            select: {
              claimStatus: true,
              approvalStatus: true,
            },
          },
        },
      });
      logInfo(
        `SUCCESS: SHOW POLICY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${
          ctx?.session?.user?.firstName
        }, policyId: ${input} and Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error log in SHOW POLICY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${
          ctx?.session?.user?.firstName
        }, policyId: ${input} and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),

  create: protectedProcedure
    .input(createPolicyInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE POLICY for packageName: ${
          input.policyData.packageName
        } for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and policyholderId: ${
          input.policyholderId
        } and policyNumber: ${input.policyNumber} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const { policyData, policyholderId, options } = input;
        // let childrenPremiumAmount = 0;
        let extendedFamilyPremiumAmount = 0;
        // let spousePremiumAmount = 0;

        let data: any = { ...input };

        const totalBenefPercentage = checkPercentageTotal(data?.beneficiaries);
        if (totalBenefPercentage) {
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
                  input?.startDate,
                  response?.packageRules
                );
                const matchedLimit = findLimit(matchedRule?.ruleLimits, 1000);
                if (!matchedRule || !matchedLimit) {
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
                const freeCoverPremium = matchedLimit?.freeCoverPremium;
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
                      policyData: {
                        ...policyData,
                        members: {
                          ...policyData.members,
                          mainMember,
                        },
                      },
                    };
                  } else {
                    logError(
                      `FAILURE: Error in CREATE POLICY for packageName: ${
                        input.policyData.packageName
                      } for user: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } User name: ${
                        ctx?.session?.user?.firstName
                      } , policyholderId: ${
                        input.policyholderId
                      } and policyNumber: ${input.policyNumber} Error: ${
                        "Cannot find policyholder details" +
                        JSON.stringify(policyholderData)
                      }`
                    );
                    throw new Error("Cannot find policyholder details");
                  }
                } catch (error: any) {
                  logError(
                    `FAILURE: Error in CREATE POLICY for packageName: ${
                      input.policyData.packageName
                    } for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    } User name: ${
                      ctx?.session?.user?.firstName
                    } , policyholderId: ${
                      input.policyholderId
                    } and policyNumber: ${
                      input.policyNumber
                    } Error: ${JSON.stringify(error)}`
                  );
                  return handleApiResponseError(error);
                }
                try {
                  const premiumData = await premiumCalculations(data, ctx);
                  let mainMemberPremiumAmount = 0;
                  if (options !== telkomFreeBenefit) {
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
                  const members = data?.policyData?.members || {};
                  const extendedFamilyMembers = members.extendedFamily || {};
                  const childrenMembers = members.children || {};
                  const spouseMember = members.spouse || {};
                  let extendedFamily;
                  const hasExtendedFamilyAge =
                    extendedFamilyMembers?.length > 0 &&
                    extendedFamilyMembers.every(
                      (obj: any) =>
                        obj.hasOwnProperty("dateOfBirth") ||
                        obj.hasOwnProperty("said")
                    );
                  if (hasExtendedFamilyAge) {
                    if (premiumData && premiumData?.extendedPremium) {
                      const hasExtendedFamily = Object.values(
                        extendedFamilyMembers
                      )
                        .filter(
                          (familyMember: any) =>
                            (familyMember.dateOfBirth ||
                              familyMember.said ||
                              familyMember.age) &&
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
                                `FAILURE: Error occured while log UPDATE POLICY for user: ${
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
                        `FAILURE: Error occured while in CREATE POLICY for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } User name: ${
                          ctx?.session?.user?.firstName
                        } , policyholderId: ${
                          input.policyholderId
                        } and policyNumber: ${input.policyNumber} Error: ${
                          "Failed to get extended premium data. " +
                          JSON.stringify(premiumData)
                        }`
                      );
                      throw new Error("Failed to get extended premium data.");
                    }
                  }

                  if (premiumData && premiumData?.mainPremium) {
                    const { mainMember, spouse, children } =
                      premiumData.mainPremium;
                    const hasChildren = Object.values(childrenMembers)
                      .filter(
                        (child: any) =>
                          child.dateOfBirth || child.said || child.age
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
                                telkomFreeBenefitAmount:
                                  matchingPlan?.freeCoverageAmount ??
                                  matchingPlan?.coverageAmount,
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
                      telkomFreeBenefitAmount: mainMember?.coverageAmount,
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
                                  telkomFreeBenefitAmount:
                                    spouse?.coverageAmount,
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
                      status: "ACTIVE",
                      policyNumber: generateUniqueNumber(),
                      sumAssured: mainMember.coverageAmount,
                      basePremium: mainMemberPremiumCost,
                      additionalPremium: extendedFamilyPremiumCost,
                      totalPremium: totalPremiumCost,
                      freeBenefitPremium: freeCoverPremium,
                      policyData: {
                        ...data?.policyData,
                        members: {
                          ...membersData,
                        },
                      },
                    };
                  } else {
                    logError(
                      `FAILURE: Error occured while log in CREATE POLICY for user: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } and policyholder: ${input.policyholderId} User name: ${
                        ctx?.session?.user?.firstName
                      } Error: ${
                        "Record to get premium data does not exist." +
                        JSON.stringify(premiumData?.mainPremium)
                      }`
                    );
                    return handleApiResponseError({
                      inputError: "Record to get premium data does not exist.",
                    });
                  }

                  const activitiesData = {
                    name: policyActivitiesLabels.created,
                    description: { data: [policyActivitiesLabels.created] },
                    createdById:
                      ctx?.session?.user?.id && ctx?.session?.user?.id,
                  };
                  const formattedActivities =
                    convertToObjectWithCreate(activitiesData);
                  const newPolicy = await prisma.policy.create({
                    data: {
                      ...removeUndefinedAndAddUuid(data),
                      policyActivities: formattedActivities,
                      createdById:
                        ctx?.session?.user?.id && ctx?.session?.user?.id,
                    },
                    include: {
                      beneficiaries: true,
                    },
                  });
                  logInfo(
                    `SUCCESS: Successfully CREATED POLICY for packageName ${
                      input.policyData.packageName
                    } for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    } User name: ${
                      ctx?.session?.user?.firstName
                    } , policyholderId: ${
                      input.policyholderId
                    } and policyNumber: ${
                      input.policyNumber
                    } Response: ${JSON.stringify(newPolicy)}`
                  );
                  return newPolicy;
                } catch (error) {
                  logError(
                    `FAILURE: Error occured in CREATE POLICY for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    }, User name: ${
                      ctx?.session?.user?.firstName
                    }, policyholderId: ${
                      input.policyholderId
                    } and policyNumber: ${
                      input.policyNumber
                    } Error: ${JSON.stringify(error)}`
                  );
                  return handleApiResponseError(error);
                }
              } catch (error: any) {
                logError(
                  `FAILURE:Error occured while CREATING POLICY for packageName: ${
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
                input?.policyData,
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
                packageName: input?.policyData?.packageName,
                sumAssured: premiumData?.sumAssured,
                basePremium: premiumData?.additionalPremium,
                additionalPremium: 0,
                totalPremium: premiumData?.additionalPremium,
                endDate: endDate,
                renewalDate: renewalDate,
                freeBenefitPremium: premiumData?.freeCoverPremium,
                policyData: {
                  creditLife: {
                    ...premiumData,
                  },
                  packageName: input?.policyData?.packageName,
                },
              };
            },

            EMPLOYEE_MOTOR_INSURANCE: async () => {},

            EMPLOYEE_DEVICE_INSURANCE: async () => {
              const devicePremiumCal = await devicePremiumData(
                ctx,
                input.policyData
              );
              const startDate = new Date(data?.startDate);
              const endDate = new Date(data?.startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              data = {
                ...data,
                packageName: input?.policyData?.packageName,
                sumAssured: devicePremiumCal?.devicePrice,
                basePremium: devicePremiumCal?.premiumAmount,
                // additionalPremium: 0,
                totalPremium: devicePremiumCal.premiumAmount,
                endDate: endDate,
                renewalDate: renewalDate,
                // freeBenefitPremium: devicePremiumCal?.freeCoverPremium,
                policyData: {
                  packageName: input?.policyData?.packageName,
                  deviceData: {
                    ...devicePremiumCal,
                  },
                },
              };
            },

            EMPLOYEE_DEVICE_CREDITLIFE: async () => {},

            DEVICE_INSURANCE: async () => {},
            DEVICE_CREDITLIFE: async () => {},
          };
          const selectedAction =
            packageActions[input?.policyData?.packageName as PackageName];

          if (selectedAction) {
            await selectedAction();
          } else {
            logError(
              `FAILURE: Error occured while CREATE POLICY for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } and Error: ${
                "Total beneficiaries percentage should be equal to 100." +
                JSON.stringify(
                  `Unknown package name: ${input?.policyData?.packageName}`
                )
              }`
            );
            throw new Error(
              `Unknown package name: ${input?.policyData?.packageName}`
            );
          }
        } else {
          logError(
            `FAILURE: Error log CREATE POLICY for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and Error: ${
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
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE POLICY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} , policyholderId: ${
            input.policyholderId
          } and policyNumber: ${input.policyNumber} Error: ${JSON.stringify(
            error
          )}`
        );
        return handleApiResponseError(error);
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        body: updatePolicyInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE POLICY for packageName: ${
          input.body.policyData.packageName
        } for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName}, policyId: ${
          input.id
        } , policyholderId: ${input.body.policyholderId}, and policyNumber: ${
          input.body.policyNumber
        }  Request: ${JSON.stringify(input)}`
      );
      try {
        // if (input.body.paymentMethod) {
        //   input.body.paymentMethod = {
        //     ...input.body.paymentMethod,
        //     accountNumber: input.body.paymentMethod.accountNumber?.toString(),
        //   };
        // }
        const { policyData, policyholderId, options } = input.body;
        const previousPolicy = await ctx.prisma.policy.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
            paymentMethod: true,
            policyholder: true,
            fileIds: true,
          },
        });
        const totalPreviousBenefPercentage = checkPercentageTotal(
          previousPolicy?.beneficiaries
        );
        if (
          previousPolicy?.status == "ACTIVE" &&
          totalPreviousBenefPercentage &&
          !previousPolicy.isArchived
        ) {
          // let childrenPremiumAmount = 0;
          let extendedFamilyPremiumAmount = 0;
          // let spousePremiumAmount = 0;
          let data: any = {
            ...input.body,
          };

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

                if (!matchedRule || !matchedLimit) {
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
                const freeCoverPremium = input?.body?.policyData.withFreeBenefit
                  ? matchedLimit?.freeCoverPremium
                  : 0;
                try {
                  const policyholderData = await prisma.policyholder.findFirst({
                    where: {
                      id: policyholderId,
                    },
                  });
                  if (policyholderData) {
                    const mainMember = buildMainMember(
                      policyholderData,
                      data?.policyData?.members?.mainMember?.id
                    );
                    data = {
                      ...data,
                      policyData: {
                        ...policyData,
                        members: {
                          ...policyData.members,
                          mainMember,
                        },
                      },
                    };
                  } else {
                    throw new Error("Cannot find policyholder details");
                  }
                } catch (error: any) {
                  logError(
                    `FAILURE: Error occured while UPDATING POLICY for packageName: ${
                      input.body.policyData.packageName
                    } for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    } User name: ${ctx?.session?.user?.firstName}, policyId: ${
                      input.id
                    }, policyholderId: ${
                      input.body.policyholderId
                    }, and policyNumber: ${
                      input.body.policyNumber
                    } and Error: ${JSON.stringify(error)}`
                  );
                  return handleApiResponseError(error);
                }
                try {
                  const premiumData = await premiumCalculations(data, ctx);
                  let mainMemberPremiumAmount = 0;
                  if (!input?.body?.policyData.withFreeBenefit) {
                    mainMemberPremiumAmount =
                      premiumData?.mainPremium?.mainMember?.coverageAmount;
                  }
                  if (
                    options !== telkomFreeBenefit &&
                    input?.body?.policyData.withFreeBenefit
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
                    !input.body?.policyData.withFreeBenefit
                  ) {
                    throw new Error(
                      "Cannot choose second policy with telkom free benefit"
                    );
                  }
                  const members = data?.policyData?.members || {};
                  const extendedFamilyMembers = members.extendedFamily || {};
                  const childrenMembers = members.children || {};
                  const spouseMember = members.spouse || {};
                  let extendedFamily;
                  const hasExtendedFamilyAge =
                    extendedFamilyMembers?.length > 0 &&
                    extendedFamilyMembers.every(
                      (obj: any) =>
                        obj.hasOwnProperty("dateOfBirth") ||
                        obj.hasOwnProperty("said")
                    );
                  if (hasExtendedFamilyAge) {
                    if (premiumData && premiumData?.extendedPremium) {
                      const hasExtendedFamily = Object.values(
                        extendedFamilyMembers
                      )
                        .filter(
                          (familyMember: any) =>
                            (familyMember.dateOfBirth ||
                              familyMember.said ||
                              familyMember.age) &&
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
                                      f.minAge <= family.age && family.id
                                        ? true
                                        : f.maxAge >= family.age
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
                                `FAILURE: Error occured while UPDATING POLICY for packageName: ${
                                  input.body.policyData.packageName
                                } for user: ${
                                  ctx?.session?.user?.id &&
                                  ctx?.session?.user?.id
                                } and policyholder: ${
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
                        `FAILURE: Error occured while UPDATING POLICY for packageName: ${
                          input.body.policyData.packageName
                        } for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        } and policyholder: ${
                          input.body.policyholderId
                        } User name: ${ctx?.session?.user?.firstName} Error: ${
                          "Record to get extended family premium data does not exist." +
                          JSON.stringify(premiumData)
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
                                telkomFreeBenefitAmount:
                                  matchingPlan?.freeCoverageAmount ??
                                  matchingPlan?.coverageAmount,
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
                                  telkomFreeBenefitAmount:
                                    spouse?.freeCoverageAmount ??
                                    spouse?.coverageAmount,
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
                      policyData: {
                        ...data?.policyData,
                        members: {
                          ...membersData,
                        },
                      },
                    };
                  } else {
                    logError(
                      `FAILURE: Error occured while UPDATING POLICY for packageName: ${
                        input.body.policyData.packageName
                      } for user: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } and policyholder: ${
                        input.body.policyholderId
                      }, policyId: ${input.id} User name: ${
                        ctx?.session?.user?.firstName
                      } Error: ${
                        "Record to get premium data does not exist." +
                        JSON.stringify(premiumData)
                      }`
                    );
                    return handleApiResponseError({
                      inputError: "Record to get premium data does not exist.",
                    });
                  }
                } catch (error) {
                  logError(
                    `FAILURE: Error occured while UPDATING POLICY for packageName: ${
                      input.body.policyData.packageName
                    } for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
                      input.id
                    }, policyholderId: ${
                      input.body.policyholderId
                    }, policyNumber: ${
                      input.body.policyNumber
                    } and Error: ${JSON.stringify(error)}`
                  );
                  return handleApiResponseError(error);
                }
              } catch (error: any) {
                logError(
                  `FAILURE:Error occured while UPDATE POLICY for packageName: ${
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
                input?.body?.policyData?.creditLife,
                ctx,
                input?.body?.startDate
              );
              const startDate = new Date(data?.startDate);
              const endDate = new Date(data?.startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              data = {
                ...data,
                packageName: input?.body.policyData?.packageName,
                sumAssured: premiumData?.sumAssured,
                basePremium: premiumData?.additionalPremium,
                additionalPremium: 0,
                totalPremium: premiumData?.additionalPremium,
                endDate: endDate,
                renewalDate: renewalDate,
                freeBenefitPremium: premiumData?.freeCoverPremium,
                policyData: {
                  creditLife: {
                    ...premiumData,
                  },
                  packageName: input?.body?.policyData?.packageName,
                },
              };
            },

            EMPLOYEE_MOTOR_INSURANCE: async () => {},

            EMPLOYEE_DEVICE_INSURANCE: async () => {
              const devicePremiumCal = await devicePremiumData(
                ctx,
                input.body.policyData.deviceData
              );
              const startDate = new Date(data?.startDate);
              const endDate = new Date(data?.startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              data = {
                ...data,
                packageName: input.body.policyData.packageName,
                sumAssured: devicePremiumCal.devicePrice,
                basePremium: devicePremiumCal.premiumAmount,
                // additionalPremium: 0,
                totalPremium: devicePremiumCal.premiumAmount,
                // freeBenefitPremium: devicePremiumCal?.freeCoverPremium
                policyData: {
                  deviceData: {
                    ...devicePremiumCal,
                  },
                  packageName: input.body.policyData.packageName,
                },
              };
            },

            EMPLOYEE_DEVICE_CREDITLIFE: async () => {
              const premiumData = await deviceCreditLifePremiumCal(
                input?.body?.policyData.deviceCreditLife,
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
                policyData: {
                  deviceCreditLife: {
                    ...premiumData,
                  },
                  packageName: input?.body?.policyData?.packageName,
                },
              };
            },

            DEVICE_INSURANCE: async () => {
              const devicePremiumCal = await retailDevicePremiumData(
                ctx,
                input.body.policyData.deviceData
              );
              const startDate = new Date(data?.startDate);
              const endDate = new Date(data?.startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              data = {
                ...data,
                packageName: input.body.policyData.packageName,
                sumAssured: devicePremiumCal.devicePrice,
                basePremium: Number(devicePremiumCal.totalPremium),
                totalPremium: Number(devicePremiumCal.totalPremium),
                policyData: {
                  deviceData: {
                    ...devicePremiumCal,
                  },
                  packageName: input.body.policyData.packageName,
                },
              };
            },
            DEVICE_CREDITLIFE: async () => {
              const premiumData = await retailDeviceCreditLifePremiumCal(
                data.policyData.deviceCreditLife,
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
                packageName: input?.body?.policyData?.packageName,
                sumAssured: premiumData?.sumAssured,
                basePremium: premiumData?.additionalPremium,
                additionalPremium: 0,
                totalPremium: premiumData?.additionalPremium,
                endDate: endDate,
                renewalDate: renewalDate,
                freeBenefitPremium: premiumData?.freeCoverPremium,
                policyData: {
                  deviceCreditLife: {
                    ...premiumData,
                  },
                  packageName: input?.body?.policyData?.packageName,
                },
              };
            },
          };
          const selectedAction =
            packageActions[input?.body?.policyData?.packageName as PackageName];

          if (selectedAction) {
            await selectedAction();
          } else {
            logError(
              `FAILURE: Error occured while UPDATING POLICY for packageName: ${
                input.body.policyData.packageName
              } for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
                input.id
              }, policyholderId: ${input.body.policyholderId}, policyNumber: ${
                input.body.policyNumber
              } and Error: ${JSON.stringify(
                `Unknown package name: ${input?.body?.policyData?.packageName}`
              )}`
            );
            throw new Error(
              `Unknown package name: ${input?.body?.policyData?.packageName}`
            );
          }
          let formattedPaymentMethod;
          let request;
          // if (paymentMethod) {
          //   const paymentMethodData = {
          //     ...data.paymentMethod,
          //     policyholderId: data.policyholderId,
          //     createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          //   };
          //   delete paymentMethodData?.id;
          //   formattedPaymentMethod =
          //     convertToObjectWithCreate(paymentMethodData);
          //   request = {
          //     ...removeUndefinedAndAddUuid(data),
          //     paymentMethod: formattedPaymentMethod,
          //     updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          //   };
          // }
          //  else {
          request = {
            ...removeUndefinedAndAddUuid(data),
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          // }
          const policy: any = await ctx.prisma.policy.update({
            where: {
              id: input.id,
            },
            data: {
              ...request,
            },
            include: {
              beneficiaries: true,
              paymentMethod: true,
              policyholder: true,
              fileIds: true,
            },
          });
          if (policy && policy?.policyNumber) {
            const pdfCount = policy.fileIds.filter(
              (item: any) => item.type === "application/pdf"
            ).length;

            let base64;
            let packageData;
            let childWithAge20;
            switch (policy.packageName) {
              case "EMPLOYEE_FUNERAL_INSURANCE":
                const childAge = findChildrenAged20(
                  ctx,
                  policy.policyData.members.children,
                  policy.policyNumber
                );
                childWithAge20 =
                  await ctx.prisma.actionRequiredPolices.findMany({
                    where: {
                      policyNumber: policy.policyNumber,
                    },
                  });
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
                packageData = await ctx?.prisma.package.findFirst({
                  where: {
                    packageName: policy.packageName,
                  },
                });
                base64 = await creditLifeDevicePdfkit(policy, packageData);
                break;
              case packageNames.retailDeviceInsurance:
                base64 = await retailDevicePdfkit(policy);
                break;
              case packageNames.retailDeviceCreditLife:
                packageData = await ctx?.prisma.package.findFirst({
                  where: {
                    packageName: policy.packageName,
                  },
                });
                base64 = await retailCreditLifeDevicePdf(policy, packageData);
                break;
              default:
                break;
            }

            await generatePolicySchedule({
              policy: policy,
              ctx: ctx,
              bucketName: env.AWS_BUCKET,
              s3: s3,
              prisma: prisma,
              description: "Policy updated",
              fileName: `Policy schedule- v${pdfCount + 1}.pdf`,
              base64: base64,
            });
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
            const eventName =
              previousPolicy.status === "ACTIVE" ? "POLICY_UPDATED" : "";
            const eventRequest = {
              eventName: eventName,
              eventCategory: "POLICY",
              packageName: updatedPolicy.packageName,
              reqData: updatedPolicy,
            };
            eventNotificationTemplate(
              ctx,
              eventRequest,
              base64,
              getKeys[0]?.attachments ? getKeys[0].attachments : undefined,
              undefined
            );
            const explicitActivities = findObjectDifferences(
              previousPolicy,
              policy
            );
            const activityDescription = Object.keys(explicitActivities);
            const activitiesData: any = {
              policyId: policy.id,
              name: policyActivitiesLabels.updated,
              description: { data: activityDescription },
              differences: explicitActivities,
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            };
            const activitiesResponse = await prisma.policyActivity.create({
              data: activitiesData,
            });
          }
          logInfo(
            `SUCCESS: Successfully UPDATED POLICY for packageName: ${
              input.body.policyData.packageName
            } for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and policyholderId: ${input.body.policyholderId}, policyId: ${
              input.id
            } User name: ${
              ctx?.session?.user?.firstName
            } Response: ${JSON.stringify(policy)}`
          );
          return policy;
        } else {
          logError(
            `FAILURE: Error log UPDATE POLICY for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and policyholderId: ${input.body.policyholderId}, policyId: ${
              input.id
            } User name: ${ctx?.session?.user?.firstName} Error: ${
              "Total beneficiaries percentage should be equal to 100." +
              JSON.stringify(totalPreviousBenefPercentage)
            } or Policy is not in ACTIVE state.`
          );
          throw new TRPCError({
            message: `Total beneficiaries percentage should be equal to 100 or Policy is not in ACTIVE state or Policy is Archived.`,
            code: "BAD_REQUEST",
            cause: 400,
          });
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE POLICY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName}, policyId: ${
            input.id
          } , policyholderId: ${input.body.policyholderId}, and policyNumber: ${
            input.body.policyNumber
          } and Error: ${JSON.stringify(error)} `
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
        `REQUEST for UPDATE BENEFICIARY in Policy for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName}, policyId: ${
          input.id
        } Request: ${JSON.stringify(input)} `
      );
      try {
        const { beneficiaries } = input.body;
        const previousPolicy = await ctx.prisma.policy.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
            policyholder: true,
          },
        });
        const totalPreviousBenefPercentage =
          checkPreviousCurrentPercentageTotal(
            previousPolicy?.beneficiaries,
            beneficiaries
          );
        if (previousPolicy?.status == "ACTIVE") {
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
              const policy: any = await prisma.policy.update({
                where: {
                  id: input.id,
                },
                data: {
                  ...request,
                },
                include: {
                  beneficiaries: true,
                  policyholder: true,
                  fileIds: true,
                },
              });
              const explicitActivities = findObjectDifferences(
                previousPolicy,
                policy
              );
              const activityDescription = Object.keys(explicitActivities);
              const activitiesData = {
                policyId: policy.id,
                name: policyActivitiesLabels.beneficiary,
                description: { data: activityDescription },
                differences: explicitActivities,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              const activitiesResponse = await prisma.policyActivity.create({
                data: activitiesData,
              });
              if (policy && policy?.policyNumber) {
                const pdfCount = policy.fileIds.filter(
                  (item: any) => item.type === "application/pdf"
                )?.length;
                let base64;

                switch (policy.packageName) {
                  case packageNames.funeral:
                    base64 = await pdfKit(policy);
                    break;
                  case packageNames.creditLifeMotor:
                    const response = await ctx?.prisma?.package.findMany({
                      where: {
                        packageName: policy.packageName,
                      },
                    });
                    base64 = await creditLifePdfkit(policy, response);
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
                await generatePolicySchedule({
                  policy: policy,
                  ctx: ctx,
                  bucketName: env.AWS_BUCKET,
                  s3: s3,
                  prisma: prisma,
                  description: "Policy updated",
                  fileName: `Policy schedule - v${pdfCount + 1}.pdf`,
                  base64: base64,
                });
                const updatedPolicy = await ctx.prisma.policy.findFirst({
                  where: { id: policy.id },
                  include: {
                    beneficiaries: true,
                    policyholder: true,
                    fileIds: true,
                  },
                });
                const eventRequest = {
                  eventName: "POLICY_BENEFICIARY_UPDATED",
                  eventCategory: "POLICY",
                  packageName: policy.packageName,
                  reqData: updatedPolicy,
                };
                eventNotificationTemplate(ctx, eventRequest, base64);
              }
              logInfo(
                `SUCCESS: Successfully UPDATED BENEFICIARY in Policy for user: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
                  input.id
                }, and Response: ${JSON.stringify(policy)} `
              );
              return policy;
            } catch (error) {
              logError(
                `FAILURE: Error occured while UPDATING BENEFICIARY in Policy for user: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
                  input.id
                } and Error: ${JSON.stringify(error)} `
              );
              return handleApiResponseError(error);
            }
          } else {
            logError(
              `FAILURE: Error occured while UPDATING BENEFICIARY in Policy for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
                input.id
              } and Error: ${"Total beneficiaries percentage should be equal to 100."} `
            );
            throw new TRPCError({
              message: `Total beneficiaries percentage should be equal to 100.`,
              code: "BAD_REQUEST",
              cause: 400,
            });
          }
        } else {
          logError(
            `FAILURE: Error occured while UPDATING BENEFICIARY in Policy  for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
              input.id
            } and Error: ${
              "Don't have access to update beneficiaries " +
              JSON.stringify(previousPolicy)
            } `
          );
          throw new Error("Don't have access to update beneficiaries");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while UPDATING BENEFICIARY in Policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
            input.id
          } Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),

  updateMany: protectedProcedure
    .input(z.array(updateManyInputchema()))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for UPDATE MANY in policy for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        } Request: ${JSON.stringify(input)} `
      );
      try {
        const updatedRecords = await Promise.all(
          input.map(async (policy) => {
            const updatedPolicy = await ctx.prisma.policy.update({
              where: {
                id: policy.id,
              },
              data: {
                ...policy,
              },
            });
            return updatedPolicy;
          })
        );
        logInfo(
          `SUCCESS: Successfully in UPDATE MANY in Policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, Response: ${JSON.stringify(updatedRecords)} `
        );
        return updatedRecords;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE MANY in Policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),

  // delete: protectedProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     logInfo(
  //       `REQUEST for DELETE in Policy for user: ${
  //         ctx?.session?.user?.id && ctx?.session?.user?.id
  //       }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
  //         input.id
  //       } Request: ${JSON.stringify(input)} `
  //     );
  //     try {
  //       const response = await prisma.policy.delete({
  //         where: {
  //           id: input.id,
  //         },
  //       });
  //       logInfo(
  //         `SUCCESS: Successfully DELETED POLICY for user: ${
  //           ctx?.session?.user?.id && ctx?.session?.user?.id
  //         }, User name: ${ctx?.session?.user?.firstName}, and policyId: ${
  //           input.id
  //         } Response: ${JSON.stringify(response)} `
  //       );
  //       return response;
  //     } catch (error: any) {
  //       logError(
  //         `FAILURE: Error in DELETE POLICY for user: ${
  //           ctx?.session?.user?.id && ctx?.session?.user?.id
  //         }, User name: ${ctx?.session?.user?.firstName}, and policyId: ${
  //           input.id
  //         } Error: ${JSON.stringify(error)} `
  //       );
  //       return handleApiResponseError(error);
  //     }
  //   }),

  archived: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for ARCHIVE POLICY for user Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and policyId: ${
          input.id
        } Request: ${JSON.stringify(input)} `
      );
      try {
        const response = await prisma.policy.update({
          where: {
            id: input.id,
          },
          data: {
            status: "CANCELLED",
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully ARCHIVED POLICY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and policyId: ${
            input.id
          } Response: ${JSON.stringify(response)} `
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while ARCHIVE POLICY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and policyId: ${
            input.id
          } Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),

  status: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(policyStatus) }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST for STATUS UPDATE in Policy for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and policyId: ${
          input.id
        } Request: ${JSON.stringify(input)} `
      );
      try {
        const previousPolicy = await ctx.prisma.policy.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
            policyholder: true,
          },
        });
        const policy = await prisma.policy.update({
          where: {
            id: input.id,
          },
          data: {
            status: input.status,
          },
          include: {
            beneficiaries: true,
            policyholder: true,
          },
        });
        if (policy && policy?.policyNumber) {
          const eventName =
            input.status === "ACTIVE" ? "POLICY_UPDATED" : "POLICY_CANCELLED";
          const eventRequest = {
            eventName: eventName,
            eventCategory: "POLICY",
            packageName: policy.packageName as string,
            reqData: policy,
          };
          let base64;

          switch (policy.packageName) {
            case "EMPLOYEE_FUNERAL_INSURANCE":
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
            default:
              break;
          }
          eventNotificationTemplate(ctx, eventRequest, base64);
        }
        const explicitActivities = findObjectDifferences(
          previousPolicy,
          policy
        );
        const activityDescription = Object.keys(explicitActivities);
        const activitiesData = {
          policyId: policy.id,
          name: policyActivitiesLabels.status,
          description: { data: activityDescription },
          differences: explicitActivities,
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        const activitiesResponse = await prisma.policyActivity.create({
          data: activitiesData,
        });
        logInfo(
          `SUCCESS: Successfully STATUS UPDATED in policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName} and policyId: ${
            input.id
          } Response: ${JSON.stringify(policy)} `
        );
        return policy;
      } catch (error: any) {
        logError(
          `FAILURE: Error in STATUS UPDATE in policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName} and policyId: ${
            input.id
          } Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),

  updatePayment: protectedProcedure
    .input(z.object({ id: z.string(), body: updatePolicyPaymentInputSchema() }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE PAYMENT in policy for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
          input.id
        }, Request: ${JSON.stringify(input)} `
      );
      try {
        const previousPolicy: any = await ctx.prisma.policy.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
            paymentMethod: true,
            policyholder: true,
          },
        });
        if (previousPolicy && previousPolicy?.policyholderId) {
          const paymentMethodData = {
            ...input.body,
            policyholderId: previousPolicy?.policyholderId,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          delete paymentMethodData?.id;
          let request = {
            paymentMethod: convertToObjectWithCreate(paymentMethodData),
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };

          const policy: any = await prisma.policy.update({
            where: {
              id: input.id,
            },
            data: {
              ...request,
            },
            include: {
              beneficiaries: true,
              paymentMethod: true,
              policyholder: true,
            },
          });
          if (policy && policy?.policyNumber) {
            const policyDetails = policy;
            policyDetails.PaymentMethod =
              policyDetails?.paymentMethod[
                policyDetails?.paymentMethod.length - 1
              ];
            delete policyDetails?.paymentMethod;
            policyDetails.PaymentMethod = {
              ...policyDetails?.PaymentMethod,
              paymentMethodType: Capitalize(
                policyDetails?.PaymentMethod?.paymentMethodType
              ),
            };
            const eventRequest = {
              eventName: "POLICY_POLICYHOLDER_UPDATED",
              eventCategory: "POLICY",
              packageName: policy.packageName,
              reqData: policyDetails,
            };
            let base64;

            switch (policy.packageName) {
              case "EMPLOYEE_FUNERAL_INSURANCE":
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
              default:
                break;
            }
            eventNotificationTemplate(ctx, eventRequest, base64);
          }
          const explicitActivities = findObjectDifferences(
            previousPolicy,
            policy
          );
          const activityDescription = Object.keys(explicitActivities);
          const activitiesData = {
            policyId: policy.id,
            name: policyActivitiesLabels.updatePayment,
            description: { data: activityDescription },
            differences: explicitActivities,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          const activitiesResponse = await prisma.policyActivity.create({
            data: activitiesData,
          });
          logInfo(
            `SUCCESS: Successfully PAYMENT UPDATED in policy for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, and polidyId: ${
              input.id
            } Response: ${JSON.stringify(policy)} `
          );
          return policy;
        } else {
          logError(
            `FAILURE: Error in PAYMENT UPDATE in policy for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, and polidyId: ${
              input.id
            } Error: ${
              "Failed to fetch policy data" + JSON.stringify(previousPolicy)
            } `
          );
          throw new Error("Failed to fetch policy data");
        }
        // }
      } catch (error: any) {
        logError(
          `FAILURE: Error in PAYMENT UPDATE in policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and polidyId: ${
            input.id
          } Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),
  renewalPolicy: publicProcedure
    .input(
      z.object({
        id: z.string(),
        renewalDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        logInfo(
          `REQUEST for UPDATE RENEWAL policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, policyId: ${
            input.id
          }, Request: ${JSON.stringify(input)} `
        );
        const renewalDate = await ctx?.prisma.policy.update({
          where: {
            id: input.id,
          },
          data: {
            renewalDate: input.renewalDate,
            endDate: input.endDate,
          },
        });
        return renewalDate;
      } catch (error) {
        logError(
          `FAILURE: Error in RENEWAL UPDATE in policy for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and polidyId: ${
            input.id
          } Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),
});

function createPolicyInputSchema() {
  const policyData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_FUNERAL_INSURANCE"),
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
            telkomFreeBenefitAmount: z.number().optional(),
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
              telkomFreeBenefitAmount: z.number().optional(),
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
                isDisabled: z.boolean(),
                isStudying: z.boolean(),
                isStillBorn: z.boolean(),

                email: z.string().email().optional(),
                naturalDeathAmount: z.number().optional(),
                accidentalDeathAmount: z.number().optional(),
                telkomFreeBenefitAmount: z.number().optional(),
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
                  } else if (
                    age > employeeFuneralAges.children.disabledMaxAge
                  ) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
                      fatal: false,
                    });
                  }
                } else {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
                    fatal: false,
                  });
                }
              })
          )
          .optional(),
        extendedFamily: z
          .array(
            z.object({
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
              telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              relation: z.enum(relation),
              options: z.enum(coverageOptions),
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
      members: z.string(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_CREDITLIFE"),
      deviceUniqueNumber: z.string(),
      additionalPercentageInsured: z
        .enum(additionalPercentageInsured)
        .optional(),
      vehcileFinancedBy: z.enum(financedBy).optional(),
      outstandingSettlementBalance: z.number(),
      loanSettlementAtInception: z.number().optional(),
    }),
    z.object({
      packageName: z.literal("DEVICE_INSURANCE"),
      members: z.string(),
    }),
    z.object({
      packageName: z.literal("DEVICE_CREDITLIFE"),
      members: z.string(),
    }),
  ]);
  return z.object({
    // packageName: z.enum(packageName),
    billingDay: z.number(),
    status: z.enum(policyStatus),
    options: z.enum(coverageOptions).optional(),
    billingFrequency: z.enum(premiumFrequency),
    policyData: policyData,
    startDate: z.date().refine((date) => new Date() < date, {
      message: "start date should be after current date",
    }),
    policyNumber: z.string().optional(),
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
    applicationId: z.string(),
    application: z
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
        billingAddress: z.string().optional(),
        accountType: z.string().optional(),
        externalReference: z.string().optional(),
        paymentMethodType: z.enum(PaymentMethodType).optional(),
      })
      .optional(),
  });
}

function updatePolicyInputSchema() {
  const policyData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_FUNERAL_INSURANCE"),
      withFreeBenefit: z.boolean().optional(),
      members: z.object({
        mainMember: z
          .object({
            id: z.string().optional(),
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
            telkomFreeBenefitAmount: z.number().optional(),
            premiumAmount: z.number().optional(),
            createdAt: z.date().optional(),
            updatedAt: z.date().optional(),
          })
          .optional(),
        spouse: z
          .array(
            z.object({
              id: z.string().optional(),
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              dateOfBirth: z.date().optional(),
              said: z.string().length(13).optional(),
              age: z.number().optional(),
              email: z.string().email().optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              createdAt: z.date().optional(),
              updatedAt: z.date().optional(),
            })
          )
          .max(4)
          .superRefine((spouses) => {
            spouses.forEach((spouse) => {
              const age = calculateAgeBasedOnSaid(spouse.said ?? "");
              if (spouse.id) {
                return age > employeeFuneralAges.spouse.minAge;
              } else {
                return (
                  age > employeeFuneralAges.spouse.minAge &&
                  age < employeeFuneralAges.spouse.maxAge
                );
              }
            });
          })
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
                isDisabled: z.boolean(),
                isStudying: z.boolean(),
                isStillBorn: z.boolean(),
                email: z.string().email().optional(),
                naturalDeathAmount: z.number().optional(),
                accidentalDeathAmount: z.number().optional(),
                telkomFreeBenefitAmount: z.number().optional(),
                premiumAmount: z.number().optional(),
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
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
                      message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
                      fatal: false,
                    });
                  }
                } else {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              dateOfBirth: z.date().optional(),
              said: z.string().length(13).optional(),
              age: z.number().optional(),
              email: z.string().email().optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              relation: z.enum(relation),
              options: z.enum(coverageOptions),
              createdAt: z.date().optional(),
              updatedAt: z.date().optional(),
            })
          )
          .max(14)
          .superRefine((Family) => {
            Family.forEach((family) => {
              const age = calculateAgeBasedOnSaid(family.said ?? "");
              if (family.id) {
                return age > employeeFuneralAges.extendedFamily.minAge;
              } else {
                return (
                  age > employeeFuneralAges.extendedFamily.minAge &&
                  age < employeeFuneralAges.extendedFamily.maxAge
                );
              }
            });
          })
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
        outstandingSettlementBalance: z.number(),
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
        devicePrice: z.number(),
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
    status: z.enum(policyStatus),
    options: z.enum(coverageOptions).optional(),
    billingFrequency: z.enum(premiumFrequency),
    policyData: policyData,
    startDate: z.date(),
    policyNumber: z.string().optional(),
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
    applicationId: z.string(),
    application: z
      .object({
        id: z.string(),
      })
      .optional(),
    fileIds: z.array(z.string()).optional(),
  });
}

function getPolicyFamilyInputSchema() {
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
            telkomFreeBenefitAmount: z.number().optional(),
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
                  message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
                  message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
                  message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
                  fatal: false,
                });
              }
            } else {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge} `,
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
          telkomFreeBenefitAmount: z.number().optional(),
          premiumAmount: z.number().optional(),
          relation: z.enum(relation),
          options: z.enum(coverageOptions),
        })
      )
      .max(14)
      .optional(),
    mainMemberPremium: z.number().optional(),
    extendedFamilyPremium: z.number().optional(),
  });
}

function updateManyInputchema() {
  return z.object({
    id: z.string(),
    nextBillingDate: z.date().optional(),
    nextBillingAmount: z.number().optional(),
    balance: z.number().optional(),
    paymentType: z.string().optional(),
    status: z.enum(policyStatus).optional(),
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
        dateOfBirth: z.date().optional().nullable(),
        phone: z.string().refine(validator.isMobilePhone),
      })
    ),
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
    billingAddress: z.string().optional(),
    accountType: z.string().optional(),
    externalReference: z.string().optional(),
    paymentMethodType: z.enum(PaymentMethodType).optional(),
  });
}
