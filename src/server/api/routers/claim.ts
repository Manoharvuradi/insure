import {
  ClaimApprovalStatus,
  ClaimCheckList,
  ClaimCheckListDefinitions,
  PackageName,
} from "@prisma/client";
import { Session } from "inspector";
import { useSession } from "next-auth/react";
import validator from "validator";
import { z } from "zod";
import { logError, logInfo } from "../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

import {
  deceasedIndividual,
  FuneralClaimType,
  claimActivitiesLabels,
  claimApprovalStatus,
  claimStatus,
  convertInputToUpdateObject,
  convertToObjectWithCreate,
  convertToObjectWithUpdate,
  generateUniqueNumber,
  pagination,
  removeUndefinedAndAddUuid,
  eventNotificationTemplate,
  packageName,
  packageNames,
  deviceClaimType,
} from "~/utils/constants";
import { claimStatusValues, getClaimCheckList } from "~/utils/constants/claims";
import { roleValues } from "~/utils/constants/user";
import { findObjectDifferences, handleApiResponseError } from "~/utils/helpers";
import { sendEmail } from "~/utils/helpers/sendEmail";
import { IncludeOptions } from "~/interfaces/claim";

export const claimRouter = createTRPCRouter({
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
        `REQUEST for LIST CLAIM for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      const isOnlySupervisor =
        ctx?.session?.user?.roles.includes(roleValues.claimSupervisor) &&
        ctx?.session?.user?.roles.length === 1;
      try {
        let user;
        let queryOptions: any = {
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
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
            policies: {
              include: {
                policyholder: true,
              },
            },
            funeralClaimBlock: true,
            creditLifeClaimBlock: true,
            deviceClaimBlock: true,
            creditLifeDeviceClaimBlock: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        };
        if (isOnlySupervisor) {
          queryOptions.where = {
            claimStatus: {
              in: [
                claimStatusValues.close,
                claimStatusValues.finalized,
                claimStatusValues.acknowledged,
              ],
            },
          };
        }
        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          const availableClaimStatus = claimStatus;
          const availableApprovalStatus = claimApprovalStatus;
          queryOptions.where = {
            claimStatus: {
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
        if (ctx.session?.user?.roles.includes(roleValues.agent)) {
          user = await ctx.prisma.credentialsUser.findFirst({
            where: {
              id: Number(ctx?.session?.user?.id),
            },
          });
          if (user?.callCenterId) {
            queryOptions.where = {
              ...queryOptions.where,
              policies: {
                application: {
                  createdBy: {
                    callCenterId: user?.callCenterId,
                  },
                },
              },
            };
          }
        }
        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              { claimNumber: { contains: input?.search, mode: "insensitive" } },
              {
                id: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              { policyId: { contains: input?.search, mode: "insensitive" } },
              {
                policies: {
                  policyNumber: {
                    contains: input?.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                claimant: {
                  path: ["firstName"],
                  string_contains: input?.search,
                },
              },
              {
                claimant: {
                  path: ["lastName"],
                  string_contains: input?.search,
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
        const totalCount = await ctx.prisma.claim.count({
          where: {
            isArchived: false,
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.claim.findMany(queryOptions);
        logInfo(
          `SUCCESS: LIST CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW CLAIM for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${
        ctx?.session?.user?.firstName
      }, claimId: ${input},  Error: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.claim.findFirst({
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
          policies: {
            include: {
              beneficiaries: true,
            },
          },
          funeralClaimBlock: true,
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
          claimCheckList: {
            include: {
              ClaimcheckListNote: true,
            },
            orderBy: {
              id: "asc",
            },
          },
          creditLifeClaimBlock: true,
          deviceClaimBlock: true,
          creditLifeDeviceClaimBlock: true,
          retailDeviceClaim: true,
          retailCreditLifeDevice: true,
        },
      });
      logInfo(
        `SUCCESS: SHOW CLAIM for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW CLAIM for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(claimSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: CREATE CLAIM for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      try {
        const currentCheckList =
          await ctx.prisma.claimCheckListDefinitions.findMany({
            where: {
              packageName: input?.packageName,
            },
          });
        let checkList: any[] = [];
        checkList = currentCheckList.map((list: ClaimCheckListDefinitions) => {
          return {
            packageName: input.packageName,
            condition: list.condition,
            checked: false,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
        });
        const formattedcheckList = convertToObjectWithCreate(checkList);
        const claim = await prisma.claim.create({
          data: {
            ...removeUndefinedAndAddUuid(input),
            claimNumber: generateUniqueNumber(),
            claimCheckList: formattedcheckList,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
          include: {
            policies: {
              select: {
                policyholder: true,
                beneficiaries: true,
              },
            },
          },
        });
        const activitiesData = {
          claimId: claim.id,
          name: claimActivitiesLabels.created,
          description: { data: [claimActivitiesLabels.created] },
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        const activitiesResponse = await prisma.claimActivity.create({
          data: activitiesData,
        });
        if (claim && claim?.claimNumber) {
          const eventRequest = {
            eventName: "CLAIM_RECEIVED",
            eventCategory: "CLAIM",
            packageName: claim.packageName as PackageName,
            reqData: claim,
          };
          eventNotificationTemplate(ctx, eventRequest);
        }
        logInfo(
          `SUCCESS: Successfully CREATED CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(claim)}`
        );
        return claim;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        body: claimSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE CLAIM for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, claimId: ${
          input.id
        }, policyId: ${input.body.policyId} and Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const include: IncludeOptions = {};
        switch (input.body.packageName) {
          case packageNames.funeral:
            include.funeralClaimBlock = true;
            break;
          case packageNames.creditLifeMotor:
            include.creditLifeClaimBlock = true;
            break;
          case packageNames.device:
            include.deviceClaimBlock = true;
            break;
          case packageNames.creditLifeDevice:
            include.creditLifeDeviceClaimBlock = true;
            break;
          case packageNames.retailDeviceInsurance:
            include.retailDeviceClaim = true;
            break;
          case packageNames.retailDeviceCreditLife:
            include.retailCreditLifeDevice = true;
            break;
        }
        const previousClaim = await ctx.prisma.claim.findFirst({
          where: {
            id: input.id,
          },
          include,
        });
        if (
          previousClaim?.claimStatus !== "CLOSED" &&
          !previousClaim?.isArchived
        ) {
          let request = {};
          delete input?.body?.claimBlocks?.packageName;
          if (
            input?.body?.claimBlocks &&
            input?.body?.claimBlocks.hasOwnProperty("id")
          ) {
            request = convertInputToUpdateObject(input.body.claimBlocks);
          } else {
            request = convertToObjectWithCreate(input.body.claimBlocks);
          }
          delete input?.body?.claimBlocks;
          const claim = await prisma.claim.update({
            where: {
              id: input.id,
            },
            data: {
              ...input.body,
              ...(input.body.packageName === packageNames.funeral && {
                funeralClaimBlock: request,
              }),
              ...(input.body.packageName === packageNames.creditLifeMotor && {
                creditLifeClaimBlock: request,
              }),
              ...(input.body.packageName === packageNames.device && {
                deviceClaimBlock: request,
              }),
              ...(input.body.packageName === packageNames.creditLifeDevice && {
                creditLifeDeviceClaimBlock: request,
              }),
              ...(input.body.packageName ===
                packageNames.retailDeviceInsurance && {
                retailDeviceClaim: request,
              }),
              ...(input.body.packageName ===
                packageNames.retailDeviceCreditLife && {
                retailCreditLifeDevice: request,
              }),
              updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            },
            include,
          });
          const explicitActivities = findObjectDifferences(
            previousClaim,
            claim
          );
          const activityDescription = Object.keys(explicitActivities);
          const activitiesData = {
            claimId: claim.id,
            name: claimActivitiesLabels.updated,
            description: { data: activityDescription },
            differences: explicitActivities,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          const activitiesResponse = await prisma.claimActivity.create({
            data: activitiesData,
          });
          logInfo(
            `SUCCESS: Successfully UPDATED CLAIM for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
              input.id
            } policyId: ${input.body.policyId} Response: ${JSON.stringify(
              claim
            )}`
          );
          return claim;
        } else {
          logError(
            `FAILURE: Error in UPDATE CLAIM for user: ${
              ctx?.session?.user?.id
            },User name: ${ctx?.session?.user?.firstName}, and Error: ${
              "Unable to edit" + JSON.stringify(previousClaim)
            }`
          );
          throw new Error("This Claim is Closed or Archived");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
            input.id
          } policyId: ${input.body.policyId} Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for DELETE CLAIM for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, claimId: ${
          input.id
        } Error: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.claim.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, claimId: ${
            input.id
          }, and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE CLAIM for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, claimId: ${
            input.id
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  archived: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for ARCHIVE Claim for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, claimId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.claim.update({
          where: {
            id: input.id,
          },
          data: {
            claimStatus: "REJECTED",
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully ARCHIVED CLAIMS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
            input.id
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE CLAIMS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
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
        status: z.enum(claimStatus).optional(),
        requestedAmount: z.number().optional(),
        grantedAmount: z.number().optional(),
        approvalStatus: z.enum(claimApprovalStatus).optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for STATUS UPDATE for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const previousClaim = await ctx.prisma.claim.findFirst({
          where: {
            id: input.id,
          },
          include: {
            policies: {
              select: {
                policyholder: true,
                beneficiaries: true,
              },
            },
          },
        });
        if (
          input.approvalStatus !== "PENDING" &&
          input.approvalStatus !== "APPROVED" &&
          input.approvalStatus !== "REPUDIATED" &&
          input.approvalStatus !== "PAYOUT_PROCESSED" &&
          input.approvalStatus !== "PAYOUT_BLOCKED" &&
          input.approvalStatus === "undefined"
        ) {
          throw new Error("Invalid approval status");
        }
        const claim = await ctx.prisma.claim.update({
          where: {
            id: input.id,
          },
          data: {
            claimStatus: input.status,
            approvalStatus: input.approvalStatus,
            ...(input?.requestedAmount && {
              requestedAmount: input?.requestedAmount,
            }),
            ...(input?.grantedAmount && {
              grantedAmount: input?.grantedAmount,
            }),
          },
          include: {
            policies: {
              select: {
                policyholder: true,
                beneficiaries: true,
              },
            },
          },
        });
        const explicitActivities = findObjectDifferences(previousClaim, claim);
        const activityDescription = Object.keys(explicitActivities);
        const activitiesData = {
          claimId: claim.id,
          name: claimActivitiesLabels.updated,
          description: { data: activityDescription },
          differences: explicitActivities,
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        const activitiesResponse = await prisma.claimActivity.create({
          data: activitiesData,
        });
        if (claim && claim?.claimNumber && input.status !== "CLOSED") {
          const eventName =
            input.status === "ACKNOWLEDGED"
              ? "CLAIM_SENT_TO_REVIEW_CLAIMENT"
              : input.approvalStatus === "APPROVED"
              ? "CLAIM_APPROVED"
              : input.approvalStatus === "REPUDIATED"
              ? "CLAIM_REPUDIATED"
              : "CLAIM_RECEIVED";
          const eventRequest = {
            eventName: eventName,
            eventCategory: "CLAIM",
            packageName: claim.packageName as PackageName,
            reqData: claim,
          };
          eventNotificationTemplate(ctx, eventRequest);
        }
        logInfo(
          `SUCCESS: Successfully STATUS UPDATE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
            input.id
          } Response: ${JSON.stringify(claim)}`
        );
        return claim;
      } catch (error: any) {
        logError(
          `FAILURE: Error in STATUS UPDATE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  updateChecklist: protectedProcedure
    .input(z.object({ id: z.number(), checked: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST for UPDATE CHECKLIST for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.claimCheckList.update({
          where: {
            id: input.id,
          },
          data: {
            checked: input.checked,
          },
        });
        logInfo(
          `SUCCESS: Successfully in UPDATE CLAIM CHECKLIST for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
            input.id
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE CLAIM CHECKLIST for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and claimId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function claimSchema() {
  const claimDetails = z.discriminatedUnion("packageName", [
    z.object({
      id: z.number().optional(),
      packageName: z.literal("EMPLOYEE_FUNERAL_INSURANCE"),
      deceasedIndividual: z.enum(deceasedIndividual).optional(),
      deceasedMemberId: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      said: z.string().length(13).optional(),
      deceasedIndividualCreatedAt: z.date().optional(),
      claimCreatedDate: z.date().optional(),
      dateOfDeath: z.date().optional(),
      funeralClaimType: z.enum(FuneralClaimType).optional(),
      cause: z.string().optional(),
      policeCaseNumber: z.string().optional(),
      reportingPoliceStation: z.string().optional(),
      referenceNumber: z.string().optional(),
      incidentDescription: z.string().optional(),
      doctorName: z.string().optional(),
      doctorContactNumber: z.string().optional(),
      doctoreAddress: z.string().optional(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_INSURANCE"),
    }),
    z.object({
      id: z.number().optional(),
      packageName: z.literal("EMPLOYEE_MOTOR_CREDITLIFE"),
      claimCreatedDate: z.date().optional(),
      dateOfDeath: z.date().optional(),
      placeOfDeath: z.string().optional(),
      creditLifeClaimType: z.enum(FuneralClaimType).optional(),
      cause: z.string().optional(),
      policeCaseNumber: z.string().optional(),
      reportingPoliceStation: z.string().optional(),
      referenceNumber: z.string().optional(),
      incidentDescription: z.string().optional(),
    }),
    z.object({
      id: z.number().optional(),
      packageName: z.literal("EMPLOYEE_DEVICE_INSURANCE"),
      claimCreatedDate: z.date().optional(),
      incidentDate: z.date().optional(),
      claimType: z.enum(deviceClaimType).optional(),
      cause: z.string().optional(),
      policeCaseNumber: z.string().optional(),
      reportingPoliceStation: z.string().optional(),
      referenceNumber: z.string().optional(),
      incidentDescription: z.string().optional(),
      address: z.string().optional(),
      postalCode: z.string().optional(),
    }),
    z.object({
      id: z.number().optional(),
      packageName: z.literal("EMPLOYEE_DEVICE_CREDITLIFE"),
      claimCreatedDate: z.date().optional(),
      dateOfDeath: z.date().optional(),
      timeOfDeath: z.string().optional(),
      placeOfDeath: z.string().optional(),
      suburb: z.string().optional(),
      province: z.string().optional(),
      creditLifeClaimType: z.enum(FuneralClaimType).optional(),
      cause: z.string().optional(),
      policeCaseNumber: z.string().optional(),
      reportingPoliceStation: z.string().optional(),
      referenceNumber: z.string().optional(),
      incidentDescription: z.string().optional(),
    }),
    z.object({
      id: z.number().optional(),
      packageName: z.literal("DEVICE_INSURANCE"),
      claimCreatedDate: z.date().optional(),
      incidentDate: z.date().optional(),
      claimType: z.enum(deviceClaimType).optional(),
      cause: z.string().optional(),
      policeCaseNumber: z.string().optional(),
      reportingPoliceStation: z.string().optional(),
      referenceNumber: z.string().optional(),
      incidentDescription: z.string().optional(),
      address: z.string().optional(),
      postalCode: z.string().optional(),
    }),
    z.object({
      id: z.number().optional(),
      packageName: z.literal("DEVICE_CREDITLIFE"),
      claimCreatedDate: z.date().optional(),
      dateOfDeath: z.date().optional(),
      timeOfDeath: z.string().optional(),
      placeOfDeath: z.string().optional(),
      suburb: z.string().optional(),
      province: z.string().optional(),
      creditLifeClaimType: z.enum(FuneralClaimType).optional(),
      cause: z.string().optional(),
      policeCaseNumber: z.string().optional(),
      reportingPoliceStation: z.string().optional(),
      referenceNumber: z.string().optional(),
      incidentDescription: z.string().optional(),
    }),
  ]);
  return z.object({
    claimNumber: z.string().optional(),
    policyId: z.string(),
    policies: z
      .object({
        id: z.string(),
      })
      .optional(),
    packageName: z.enum(packageName),
    description: z.string().optional(),
    claimStatus: z.enum(claimStatus).optional(),
    approvalStatus: z.enum(claimApprovalStatus).optional(),
    requestedAmount: z.number().optional(),
    grantedAmount: z.number().optional(),
    claimDate: z.date().optional(),
    claimant: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email(),
        phone: z.string().refine(validator.isMobilePhone).optional(),
        dateOfBirth: z.date().optional(),
        relation: z.string().optional(),
      })
      .optional(),
    claimBlocks: claimDetails.optional(),
    appData: z.record(z.unknown()).optional(),
    isArchived: z.boolean().optional(),
  });
}
