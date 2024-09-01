import validator from "validator";
import { z } from "zod";
import { logError, logInfo } from "../constants/logger";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  convertToObjectWithCreate,
  gender,
  identificationType,
  pagination,
  policyholderActivitiesLabels,
  removeUndefinedAndAddUuid,
} from "~/utils/constants";
import { roleValues } from "~/utils/constants/user";
import { findObjectDifferences, handleApiResponseError } from "~/utils/helpers";
import { dateSAIDvalidation } from "~/utils/helpers/validations";

export const policyholderRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST LIST POLICYHOLDER for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
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
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            identification: true,
            paymentMethods: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        };

        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          queryOptions.where = {
            status: {
              in: filterArray,
            },
          };
        }

        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              { firstName: { contains: input?.search, mode: "insensitive" } },
              { lastName: { contains: input?.search, mode: "insensitive" } },
              { email: { contains: input?.search, mode: "insensitive" } },
              {
                citizenshipId: { contains: input?.search, mode: "insensitive" },
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
              applications: {
                some: {
                  createdBy: {
                    callCenterId: user?.callCenterId,
                  },
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

        const totalCount = await ctx.prisma.policyholder.count({
          where: queryOptions.where,
        });
        const response = await ctx.prisma.policyholder.findMany(queryOptions);
        logInfo(
          `SUCCESS: Successfully LISTED POLICYHOLDER for user: ${
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
          `FAILURE: Error in LIST POLICYHOLDER for user: ${
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
      `REQUEST SHOW POLICYHOLDER for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${
        ctx?.session?.user?.firstName
      }, and Id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.policyholder.findFirst({
        where: {
          id: input,
        },
        include: {
          applications: {
            where: {
              isArchived: false,
            },
          },
          policies: {
            where: {
              isArchived: false,
            },
          },
          identification: true,
          paymentMethods: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      logInfo(
        `SUCCESS: Successfully Retrieved SHOW POLICYHOLDER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Id: ${input} Error: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW POLICYHOLDER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Id: ${input} Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  citizenshipId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for CITIZENSHIPID for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, citizenshipId: ${input}, and Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await ctx.prisma.policyholder.findFirst({
          where: {
            citizenshipId: input,
          },
          include: {
            policies: true,
            applications: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully retrieved POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(response)}`
        );

        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in GETTING POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  create: protectedProcedure
    .input(getPolicyholderInputSchema())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for CREATE POLICYHOLDER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and ${input} Request: ${JSON.stringify(input)}`
      );
      const activitiesData = {
        name: policyholderActivitiesLabels.created,
        description: { data: [policyholderActivitiesLabels.created] },
        createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
      };
      const formattedActivities = convertToObjectWithCreate(activitiesData);
      try {
        const newPolicyholder = await prisma.policyholder.create({
          data: {
            ...removeUndefinedAndAddUuid(input),
            policyholderActivities: formattedActivities,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
          include: {
            policyholderActivities: true,
            identification: true,
            paymentMethods: true,
          },
        });
        logError(
          `SUCCESS: Successfully CREATED POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(newPolicyholder)}`
        );
        return newPolicyholder;
      } catch (error: any) {
        logError(
          `FAILURE: Error in CREATNIG POLICYHOLDER for user: ${
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
        body: getPolicyholderInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST UPDATE POLICYHOLDER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and policyholderId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      const activitiesData = {
        name: policyholderActivitiesLabels.updated,
        createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
      };
      const formattedActivities = convertToObjectWithCreate(activitiesData);
      try {
        const prevPolicyholderDetails =
          await ctx?.prisma.policyholder.findFirst({
            where: {
              id: input.id,
            },
            include: {
              identification: true,
              paymentMethods: true,
            },
          });
        const policyholder: any = await ctx.prisma.policyholder.update({
          where: {
            id: input.id,
          },
          include: {
            identification: true,
            paymentMethods: true,
          },
          data: {
            ...removeUndefinedAndAddUuid(input.body),
            policyholderActivities: formattedActivities,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        const explicitActivities = findObjectDifferences(
          prevPolicyholderDetails,
          policyholder
        );
        const activityDescription = Object.keys(explicitActivities);
        const activitiesData = {
          policyholderId: policyholder.id,
          name: policyholderActivitiesLabels.updated,
          description: { data: activityDescription },
          differences: explicitActivities,
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        const activitiesResponse = await ctx.prisma.policyholderActivity.create(
          {
            data: activitiesData,
          }
        );
        logInfo(
          `SUCCESS: UPDATAING POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, policyholderId:${
            input.id
          } and Response: ${JSON.stringify(policyholder)}`
        );
        return policyholder;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATEING POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, policyholderId:${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      logInfo(
        `REQUEST for DELETE POLICYHOLDER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, policyholderId: ${
          input.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const response = prisma.policyholder.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, policyholderId:${
            input.id
          } and response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, policyholderId:${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        throw new Error(error);
      }
    }),

  archived: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST ARCHIVE POLICYHOLDER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${ctx?.session?.user?.firstName},  policyholderid: ${
          input.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.policyholder.update({
          where: {
            id: input.id,
          },
          data: {
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully ARCHIVED POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and policyholderId: ${
            input.id
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE POLICYHOLDER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and policyholderId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getPolicyholderInputSchema() {
  return z.object({
    type: z.string().optional(),
    firstName: z.string().optional(),
    initial: z.string().optional(),
    lastName: z.string().optional(),
    dateOfBirth: z.date().optional(),
    gender: z.enum(gender).optional(),
    email: z.string().email(),
    phone: z.string().refine(validator.isMobilePhone),
    phoneOther: z.string().refine(validator.isMobilePhone).optional(),
    streetAddress1: z.string().optional(),
    streetAddress2: z.string().optional(),
    suburb: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    areaCode: z.string().optional(),
    appData: z.record(z.unknown()).optional(),
    identification: z
      .array(
        z.object({
          id: z.number().optional(),
          type: z.enum(identificationType),
          country: z.string(),
          number: z.string(),
        })
      )
      .optional(),
    paymentMethods: z
      .array(
        z.object({
          id: z.number().optional(),
          isPrimary: z.boolean().optional(),
          collectionType: z.string(),
          accountHolder: z.string(),
          bank: z.string(),
          branchCode: z.string(),
          accountNumber: z.string(),
          accountType: z.string(),
          externalReference: z.string().optional(),
        })
      )
      .optional(),
    citizenshipId: z.string().length(13).optional(),
    salaryReferenceNo: z.string().optional(),
    isArchived: z.boolean().optional(),
    applications: z
      .array(
        z.object({
          id: z.string(),
        })
      )
      .optional(),
    policies: z
      .array(
        z.object({
          id: z.string(),
        })
      )
      .optional(),
    policyholderActivities: z
      .object({
        name: z.string(),
        description: z.string(),
      })
      .optional(),
  });
}
