import { PackageName } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import validator from "validator";
import { z } from "zod";
import { logError, logInfo } from "../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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
  leadStatus,
  leadType,
  packageName,
  packageNames,
  pagination,
  phoneRegex,
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
import { financedBy } from "~/utils/constants/application";
import { creditLifeDevicePdfkit } from "~/utils/helpers/creditLifeDevicePdfkit";
import {
  getLeadsString,
  maxDaysForUnattendedLeads,
} from "~/utils/constants/leads";

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

export const leadRouter = createTRPCRouter({
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
        `REQUEST: Retrieving LIST LEAD data, for User Id: ${
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
              {
                leadNumber: {
                  contains: input?.search,
                  mode: "insensitive",
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
        const totalCount = await ctx.prisma.leads.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.leads.findMany(queryOptions);
        logInfo(
          `SUCCESS: Successfully retrieved LIST LEAD data for User ID: ${
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
          `FAILURE: Error occured while retrieving LIST LEAD data for User ID: ${
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
      `REQUEST: Retrieving SHOW LEAD data, for User Id: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } User Name: ${
        ctx?.session?.user.firstName
      } and lead id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.leads.findFirst({
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
          application: {
            select: {
              id: true,
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
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved SHOW LEAD data for User ID: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${
          ctx?.session?.user.firstName
        } and Lead id: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error occured while retrieving SHOW LEAD data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User Name: ${
          ctx.session?.user.firstName
        } and Lead id: ${input} Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),

  create: protectedProcedure
    .input(createLeadInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATING LEAD data, for packageName:${
          input.applicationData.packageName
        } for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName}, policyholderId: ${
          input.policyholderId
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const { options, applicationData, policyholderId } = input;
        let extendedFamilyPremiumAmount = 0;
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
              EMPLOYEE_FUNERAL_INSURANCE: async () => {},

              EMPLOYEE_MOTOR_CREDITLIFE: async () => {},

              EMPLOYEE_MOTOR_INSURANCE: async () => {},

              EMPLOYEE_DEVICE_INSURANCE: async () => {},

              EMPLOYEE_DEVICE_CREDITLIFE: async () => {},

              DEVICE_INSURANCE: async () => {
                const devicePremiumCalculations = await retailDevicePremiumData(
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
                  sumAssured: devicePremiumCalculations?.devicePrice,
                  basePremium: Number(devicePremiumCalculations?.totalPremium),
                  totalPremium: Number(devicePremiumCalculations?.totalPremium),
                  endDate: endDate,
                  renewalDate: renewalDate,
                  applicationData: {
                    packageName: input?.applicationData?.packageName,
                    deviceData: {
                      ...devicePremiumCalculations,
                    },
                  },
                };
              },

              DEVICE_CREDITLIFE: async () => {
                const deviceCreditlifePremiumCalculations =
                  await retailDeviceCreditLifePremiumCal(
                    input.applicationData.deviceCreditLife,
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
                    packageName: input?.applicationData?.packageName,
                  },
                };
              },
            };
            const selectedAction =
              packageActions[
                input?.applicationData?.packageName as PackageName
              ];

            if (selectedAction) {
              await selectedAction();
            } else {
              logError(
                `FAILURE: Error occured while CREATING LEAD for packageName:${
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
              name: leadActivitiesLabels.created,
              description: { data: [leadActivitiesLabels.created] },
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            };
            const formattedActivities =
              convertToObjectWithCreate(activitiesData);
            const newLead = await ctx.prisma.leads.create({
              include: {
                beneficiaries: true,
                paymentMethod: true,
              },
              data: {
                ...removeUndefinedAndAddUuid(data),
                leadNumber: generateUniqueNumber(),
                LeadActivity: formattedActivities,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              },
            });
            logInfo(
              `SUCCESS: Successfully CREATED LEAD, for package ${
                input?.applicationData?.packageName
              }, for User Id: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user?.firstName} and Policyholder ${
                input.policyholderId
              } Response: ${JSON.stringify(newLead)}`
            );
            if (newLead && input.applicationData.contactId) {
              await ctx.prisma.contacts.update({
                where: {
                  id: input.applicationData.contactId,
                },
                data: {
                  isArchived: true,
                },
              });
            }
            return newLead;
          } catch (error) {
            logError(
              `FAILURE:Error occured while CREATING LEAD  for package ${
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
            `FAILURE: Error occured while CREATING LEAD for package ${
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
          `FAILURE: Error occured while CREATING LEAD for package ${
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
        body: updateLeadInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE LEAD data, for packageName:${
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
        const previousLead = await ctx.prisma.leads.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
            paymentMethod: true,
          },
        });
        const totalPreviousBenefPercentage = checkPercentageTotal(
          previousLead?.beneficiaries
        );
        if (
          // previousLead?.status == LeadStatusValues.draft &&
          totalPreviousBenefPercentage &&
          !previousLead.isArchived
        ) {
          let extendedFamilyPremiumAmount = 0;
          let data: any = {
            ...input.body,
          };
          if (data.paymentMethod) {
            data.paymentMethod = {
              ...data.paymentMethod,
              accountNumber: data.paymentMethod.accountNumber?.toString(),
            };
          }
          const packageActions = {
            EMPLOYEE_FUNERAL_INSURANCE: async () => {},

            EMPLOYEE_MOTOR_CREDITLIFE: async () => {},

            EMPLOYEE_MOTOR_INSURANCE: async () => {},

            EMPLOYEE_DEVICE_INSURANCE: async () => {},

            EMPLOYEE_DEVICE_CREDITLIFE: async () => {},

            DEVICE_INSURANCE: async () => {
              const devicePremiumCalculations = await retailDevicePremiumData(
                ctx,
                applicationData.deviceData
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
                sumAssured: devicePremiumCalculations?.sumAssured,
                basePremium: Number(devicePremiumCalculations?.totalPremium),
                totalPremium: Number(devicePremiumCalculations.totalPremium),
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
              const premiumData = await retailDeviceCreditLifePremiumCal(
                data.applicationData.deviceCreditLife,
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
                packageName: input?.body?.applicationData?.packageName,
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
                `FAILURE: Error occured while UPDATING LEAD for packageName:${
                  input.body.applicationData.packageName
                } for User Id: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User Name: ${ctx.session?.user.firstName} and leadId: ${
                  input.id
                }, policyholderId: ${input.body.policyholderId} Error: ${
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
            const Leads = await prisma.leads.update({
              where: {
                id: input.id,
              },
              include: {
                beneficiaries: true,
                paymentMethod: true,
                fileIds: true,
                application: true,
                policyholder: true,
                createdBy: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
              data: {
                ...removeUndefinedAndAddUuid(request),
              },
            });
            const updatedLead: any = Leads;
            const docsExist = updatedLead.fileIds.length;
            let documentsOnIssuePolicy;
            if (docsExist > 0) {
              documentsOnIssuePolicy = updatedLead?.fileIds;
            }
            const explicitActivities = findObjectDifferences(
              previousLead,
              updatedLead
            );
            const activityDescription = Object.keys(explicitActivities);
            const activitiesData = {
              leadsId: updatedLead.id,
              name:
                updatedLead.status === LeadStatusValues.inreview
                  ? leadActivitiesLabels.approved
                  : leadActivitiesLabels.updated,
              description: { data: activityDescription },
              differences: explicitActivities,
              createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            };
            await prisma.leadActivity.create({
              data: activitiesData,
            });
            if (
              updatedLead &&
              updatedLead?.status == "INREVIEW" &&
              !updatedLead.isArchived &&
              !updatedLead.application
            ) {
              const nextBillingDate = calculateNextBillingDate(
                updatedLead?.billingDay,
                dateConversion(updatedLead?.startDate)
              );
              const beneficiaryIds = Leads.beneficiaries.map(
                (beneficiary: any) => {
                  return beneficiary.id;
                }
              );
              const fileIds = Leads.fileIds.map((file) => {
                return file.id;
              });
              const startDate = calculateStartDate(updatedLead?.startDate);
              const endDate = new Date(startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              delete updatedLead.leadNumber;
              delete updatedLead.leadType;
              delete updatedLead.applicationOnHold;
              delete updatedLead.applicationRejected;
              delete updatedLead.claimOnHold;
              delete updatedLead.claimRejected;
              delete updatedLead.createdById;
              delete updatedLead.updatedById;
              delete updatedLead.beneficiaries;
              delete updatedLead.policyholderId;
              const data: any = {
                ...updatedLead,
                startDate: startDate,
                endDate: endDate,
                renewalDate: renewalDate,
                status: "PENDING",
                nextBillingDate: nextBillingDate,
                autoRenewal: updatedLead?.autoRenewal,
                Leads: { connect: { id: updatedLead.id } },
                applicationData: updatedLead.applicationData,
                createdAt: new Date(),
              };
              delete data.id;
              delete data.fileIds;
              const restData = removeIdFromArray(data);
              const leadResponse = removeUndefinedAndAddUuid(restData);
              const payload = {
                ...leadResponse,
                paymentMethod: formattedPaymentMethod,
                policyholder: {
                  connect: {
                    id: Leads?.policyholder?.id,
                  },
                },
                createdBy: {
                  connect: {
                    id:
                      ctx?.session?.user?.id &&
                      parseInt(ctx?.session?.user?.id),
                  },
                },
                ...(beneficiaryIds.length > 0 && {
                  beneficiaries: {
                    connect: beneficiaryIds?.map((beneficiary: any) => {
                      return { id: beneficiary };
                    }),
                  },
                }),
                ...(fileIds.length > 0 && {
                  fileIds: {
                    connect: fileIds?.map((file: any) => {
                      return { id: file };
                    }),
                  },
                }),
              };
              try {
                const newApplication = await prisma.application.create({
                  include: {
                    beneficiaries: true,
                    policyholder: true,
                    createdBy: {
                      select: {
                        id: true,
                        email: true,
                        reportsTo: true,
                      },
                    },
                  },
                  data: payload,
                });
                const explicitActivities = findObjectDifferences(
                  previousLead,
                  updatedLead
                );
                const activityDescription = Object.keys(explicitActivities);
                const activitiesData = {
                  applicationId: newApplication.id,
                  name: applicationActivitiesLabels.created,
                  description: { data: activityDescription },
                  differences: explicitActivities,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                };
                await prisma.applicationActivity.create({
                  data: activitiesData,
                });
                const eventRequest = {
                  eventName: "LEAD_ACCEPTED",
                  eventCategory: "LEAD",
                  packageName: Leads?.packageName ?? "DEVICE_INSURANCE",
                  reqData: Leads,
                };
                eventNotificationTemplate(
                  ctx,
                  eventRequest,
                  undefined,
                  undefined,
                  Leads.createdBy?.email
                );
                return newApplication;
              } catch (error: any) {
                logError(
                  `FAILURE: Error occured while UPDATING LEAD for packageName: ${
                    input.body.applicationData.packageName
                  }  for user: ${
                    ctx?.session?.user?.id && ctx?.session?.user?.id
                  } User name: ${ctx?.session?.user?.firstName} and leadId: ${
                    input.id
                  }, policyholderId: ${
                    input.body.policyholderId
                  } Error: ${JSON.stringify(error)}`
                );
                return handleApiResponseError(error);
              }
            }
            if (
              updatedLead &&
              updatedLead?.status == "INREVIEW" &&
              !updatedLead.isArchived &&
              updatedLead.application
            ) {
              const currentLead = await prisma.leads.findFirst({
                where: {
                  id: input.id,
                },
                include: {
                  application: true,
                },
              });
              const applicationId = currentLead?.application?.id;
              const nextBillingDate = calculateNextBillingDate(
                currentLead?.billingDay,
                dateConversion(currentLead?.startDate)
              );
              const startDate = calculateStartDate(currentLead?.startDate);
              const endDate = new Date(startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              endDate.setDate(endDate.getDate() - 1);
              const renewalDate = new Date(endDate);
              renewalDate.setDate(endDate.getDate() + 1);
              const data: any = {
                ...(currentLead?.options && { options: currentLead?.options }),
                billingFrequency: currentLead?.billingFrequency,
                applicationData: currentLead?.applicationData,
                packageName: currentLead?.packageName,
                sumAssured: currentLead?.sumAssured,
                basePremium: currentLead?.basePremium,
                additionalPremium: currentLead?.additionalPremium,
                totalPremium: currentLead?.totalPremium,
                billingDay: currentLead?.billingDay,
                schemeType: currentLead?.schemeType,
                startDate: startDate,
                endDate: endDate,
                renewalDate: renewalDate,
                nextBillingDate: nextBillingDate,
                autoRenewal: currentLead?.autoRenewal,
                paymentMethod: formattedPaymentMethod,
                updatedBy: {
                  connect: {
                    id: ctx?.session?.user?.id && ctx?.session?.user?.id,
                  },
                },
              };
              delete data?.id;
              delete data?.fileIds;
              const restData = removeIdFromArray(data);
              const applicationRequest = removeUndefinedAndAddUuid(restData);
              try {
                const updateApplication = await prisma.application.update({
                  where: {
                    id: applicationId,
                  },
                  data: {
                    ...applicationRequest,
                  },
                });
                const explicitActivities = findObjectDifferences(
                  previousLead,
                  currentLead
                );
                const activityDescription = Object.keys(explicitActivities);
                const activitiesData = {
                  applicationId: updateApplication.id,
                  name: applicationActivitiesLabels.updated,
                  description: { data: activityDescription },
                  differences: explicitActivities,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                };
                await prisma.applicationActivity.create({
                  data: activitiesData,
                });
              } catch (error) {
                `FAILURE: Error occured while in UPDATING APPLICATION for packageName: ${
                  input.body.applicationData.packageName
                } getting premium for user: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User name: ${ctx?.session?.user?.firstName} leadId: ${
                  input.id
                }, policyholderId: ${
                  input.body.policyholderId
                } and  Error: ${JSON.stringify(error)}`;
              }
            }
            logInfo(
              `SUCCESS: Successfully UPDATED LEAD data, for packageName: ${
                input.body.applicationData.packageName
              } User ID: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user.firstName}, applicatinId: ${
                input.id
              } Response: ${JSON.stringify(updatedLead)}`
            );
            return updatedLead;
          } catch (error) {
            logError(
              `FAILURE: Error occured while in UPDATATING LEAD for packageName: ${
                input.body.applicationData.packageName
              } getting premium for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              } User name: ${ctx?.session?.user?.firstName} leadId: ${
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
            } User name: ${ctx?.session?.user?.firstName},leadId: ${
              input.id
            }, policyholderId: ${input.body.policyholderId} and Error: ${
              "Total beneficiaries percentage should be equal to 100." +
              JSON.stringify(totalPreviousBenefPercentage)
            } or Policy is not in ACTIVE state.`
          );
          throw new TRPCError({
            message: `Total beneficiaries percentage is not equal to 100 or Lead is not in DRAFT state or LEAD is Archived.`,
            code: "BAD_REQUEST",
            cause: 400,
          });
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while UPDATAING LEAD for packageName: ${
            input.body.applicationData.packageName
          } for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName}, leadId: ${
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
        } User name: ${ctx?.session?.user?.firstName} leadId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const { beneficiaries } = input.body;
        const previousLead = await ctx.prisma.leads.findFirst({
          where: {
            id: input.id,
          },
          include: {
            beneficiaries: true,
          },
        });
        const totalPreviousBenefPercentage =
          checkPreviousCurrentPercentageTotal(
            previousLead?.beneficiaries,
            beneficiaries
          );
        if (previousLead?.status == "DRAFT") {
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

              const updatedLead: any = await ctx.prisma.leads.update({
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
                previousLead,
                updatedLead
              );
              const activityDescription = Object.keys(explicitActivities);
              const activitiesData = {
                leadsId: previousLead.id,
                name: leadActivitiesLabels.beneficiary,
                description: { data: activityDescription },
                differences: explicitActivities,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              await prisma.leadActivity.create({
                data: activitiesData,
              });
              logInfo(
                `SUCCESS: Successfully UPDATED BENEFICIARY Data, in Application for User Id: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } User Name: ${
                  ctx.session?.user.firstName
                } and ApplicationId: ${input.id} Error: ${JSON.stringify(
                  updatedLead
                )}`
              );
              return updatedLead;
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
            } User name: ${ctx?.session?.user?.firstName} and leadId: ${
              input.id
            } and Error: ${JSON.stringify(
              "Don't have access to update beneficiaries" + previousLead
            )}`
          );
          throw new Error("Don't have access to update beneficiaries");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE BENEFICIARY in Application, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and leadId: ${
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
        `REQUEST for ARCHIVE LEAD for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and leadId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.leads.update({
          where: {
            id: input.id,
          },
          data: {
            status: "DECLINED",
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully ARCHIVE LEAD for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and leadId: ${
            input.id
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE LEAD for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and leadId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  updatePayment: protectedProcedure
    .input(z.object({ id: z.string(), body: updateLeadPaymentInputSchema() }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: for UPDATE PAYMENT in LEADS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and leadId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const previousLead = await ctx.prisma.leads.findFirst({
          where: {
            id: input.id,
          },
          include: {
            policyholder: true,
            paymentMethod: true,
          },
        });
        if (previousLead && previousLead?.policyholderId) {
          const paymentMethodData = {
            ...input.body,
            policyholderId: previousLead?.policyholderId,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          delete paymentMethodData?.id;

          let request = {
            paymentMethod: convertToObjectWithCreate(paymentMethodData),
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };

          const updatedLead: any = await prisma.leads.update({
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
            previousLead,
            updatedLead
          );
          const activityDescription = Object.keys(explicitActivities);
          const activitiesData = {
            name: leadActivitiesLabels.paymentUpdate,
            description: { data: activityDescription },
            differences: explicitActivities,
            leadsId: previousLead.id,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          await prisma.leadActivity.create({ data: activitiesData });
          logInfo(
            `SUCCESS: Successfully PAYMENT UPDATED in LEAD, for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} And leadId ${
              input.id
            } Response: ${JSON.stringify(updatedLead)}`
          );
          return updatedLead;
        } else {
          logError(
            `FAILURE: Error occured in PAYMENT UPDATE in LEAD for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} And leadId ${
              input.id
            } Error: ${"Failed to fetch LEAD data"}`
          );
          throw new Error("Failed to fetch LEAD data");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error occured in PAYMENT UPDATE in LEAD for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} And leadId ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  status: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(leadStatus) }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for STATUS LEAD for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and leadId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const currentLead = await ctx.prisma.leads.findFirst({
          where: {
            id: input.id,
          },
          include: {
            paymentMethod: true,
          },
        });

        if (input.status === "INREVIEW" && currentLead) {
          logError(
            `FAILURE: Error in STATUS Application for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } User name: ${ctx?.session?.user?.firstName} and leadId: ${
              input.id
            } Error: ${
              "Cannot change status to IN-REVIEW , update Lead" +
              JSON.stringify(currentLead)
            }`
          );
          throw new Error("Cannot change status to IN-REVIEW , update Lead");
        }

        const updatedLeads = await prisma.leads.update({
          where: {
            id: input.id,
          },
          data: {
            status: input.status,
          },
          include: {
            paymentMethod: true,
            createdBy: {
              select: {
                email: true,
              },
            },
          },
        });
        if (updatedLeads.status === "REFUSED") {
          const eventRequest = {
            eventName: "LEAD_REFUSED",
            eventCategory: "LEAD",
            packageName: updatedLeads?.packageName ?? "DEVICE_INSURANCE",
            reqData: updatedLeads,
          };
          eventNotificationTemplate(
            ctx,
            eventRequest,
            undefined,
            undefined,
            updatedLeads.createdBy?.email
          );
        }
        const explicitActivities = findObjectDifferences(
          currentLead,
          updatedLeads
        );
        const activityDescription = Object.keys(explicitActivities);
        const activitiesData = {
          leadsId: updatedLeads.id,
          name: leadActivitiesLabels.updated,
          description: { data: activityDescription },
          differences: explicitActivities,
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        await prisma.leadActivity.create({
          data: activitiesData,
        });
        logInfo(
          `SUCCESS: Successfully changed STATUS of the LEAD to ${
            input.status
          } for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName} and leadId: ${
            input.id
          } Response: ${JSON.stringify(updatedLeads)}`
        );
        return updatedLeads;
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
    }),

  checkunattendedLead: protectedProcedure.mutation(
    async ({ ctx, input }: any) => {
      logInfo(`Checking UNATTENDED LEADS as  on ${new Date()}`);
      try {
        let result = {
          count: 0,
          data: [] as any,
        };
        const today = new Date();
        const UnattendedLeadsthreshold = new Date(today);
        UnattendedLeadsthreshold.setDate(
          today.getDate() - maxDaysForUnattendedLeads
        );
        const unattendedLeads = await prisma.leads.findMany({
          where: {
            status: "DRAFT",
          },
          include: {
            createdBy: {
              include: {
                reportsTo: true,
              },
            },
          },
        });
        if (unattendedLeads.length > 0) {
          const leadsByCreatedBy = unattendedLeads.reduce(
            (acc: any, lead: any) => {
              const email = lead.createdBy.email;
              // Check if there is an existing entry for this email, if not, create one
              if (!acc[email]) {
                acc[email] = { email: email, leads: [] };
              }
              // Add the lead to the corresponding email group
              acc[email].leads.push(lead);
              return acc;
            },
            {}
          );
          const updatedGroupedLeads = Object.values(leadsByCreatedBy).map(
            (group: any) => {
              const uniqueReportsToEmails = [
                ...new Set(
                  group.leads.flatMap((lead: any) =>
                    lead.createdBy.reportsTo.map(
                      (reportTo: any) => reportTo.email
                    )
                  )
                ),
              ];
              group.email = `${group.email},${uniqueReportsToEmails.join(",")}`;
              return group;
            }
          );
          result.count = unattendedLeads.length;
          result.data = updatedGroupedLeads;
          updatedGroupedLeads.map((groupedLead: any) => {
            const leadData = getLeadsString(groupedLead.leads);
            const eventRequest = {
              eventName: "LEAD_UNATTENDED",
              eventCategory: "LEAD",
              packageName: "DEVICE_INSURANCE",
              reqData: { table: leadData },
            };
            eventNotificationTemplate(
              ctx,
              eventRequest,
              undefined,
              undefined,
              groupedLead.email
            );
          });
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

function createLeadInputSchema() {
  const applicationData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("DEVICE_INSURANCE"),
      deviceType: z.string(),
      isRecentPurchase: z.boolean(),
      devicePrice: z.number(),
      deviceUniqueNumber: z.string().optional(),
      deviceDetails: z.string().optional(),
      deviceBrand: z.string().optional(),
      deviceModel: z.string().optional(),
      deviceStorage: z.string().optional(),
      deviceModelColor: z.string().optional(),
      contactId: z.number().optional(),
    }),
    z.object({
      packageName: z.literal("DEVICE_CREDITLIFE"),
      deviceCreditLife: z.object({
        deviceUniqueNumber: z.string(),
        additionalPercentageInsured: z
          .enum(additionalPercentageInsured)
          .optional(),
        deviceFinancedBy: z.enum(financedBy),
        outstandingSettlementBalance: z.number(),
        loanSettlementAtInception: z.number().optional(),
      }),
    }),
  ]);

  return z.object({
    // packageName: z.enum(packageName),
    billingDay: z.number(),
    status: z.enum(leadStatus).optional(),
    leadType: z.enum(leadType).optional(),
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

function updateLeadInputSchema() {
  const applicationData = z.discriminatedUnion("packageName", [
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
    applicationOnHold: z.boolean().optional(),
    claimOnHold: z.boolean().optional(),
    status: z.enum(leadStatus).optional(),
    leadType: z.enum(leadType).optional(),
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
        externalReference: z.string().optional().optional(),
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

function updateLeadPaymentInputSchema() {
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
