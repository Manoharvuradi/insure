import { z } from "zod";
import { logError, logInfo } from "../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  complaintActivitiesLabels,
  complaintStatus,
  convertToObjectWithCreate,
  generateUniqueNumber,
  packageName,
  pagination,
  removeUndefinedAndAddUuid,
} from "~/utils/constants";
import { roleValues } from "~/utils/constants/user";
import { findObjectDifferences, handleApiResponseError } from "~/utils/helpers";
import { sendEmail } from "~/utils/helpers/sendEmail";

export const complaintRouter = createTRPCRouter({
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
        `REQUEST for LIST COMPLAINTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
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
            policy: {
              include: { policyholder: true },
            },
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

        if (ctx?.req?.query?.packageName) {
          const packageArray: string[] = ctx.req.query.packageName.split(",");
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
              policy: {
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
              {
                complaintNumber: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                complainantFirstName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                complainantLastName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                complainantEmail: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                complainantMobileNumber: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                policyId: { contains: input?.search, mode: "insensitive" },
              },
              {
                policy: {
                  policyNumber: {
                    contains: input?.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                policy: {
                  policyholderId: {
                    contains: input?.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                policy: {
                  policyholder: {
                    firstName: {
                      contains: input?.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                policy: {
                  policyholder: {
                    lastName: {
                      contains: input?.search,
                      mode: "insensitive",
                    },
                  },
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
        const totalCount = await ctx.prisma.complaints.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.complaints.findMany(queryOptions);
        logInfo(
          `SUCCESS: Successfully LIST COMPLAINTS for user: ${
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
          `FAILURE: Error in LIST COMPLAINTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      logInfo(
        `REQUEST for LIST COMPLAINTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      const response = await ctx.prisma.complaints.findFirst({
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
          policy: true,
        },
      });
      logInfo(
        `SUCCESS: Successfully Retrieved SHOW COMPLAINT for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW COMPLAINT for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(complaintSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE COMPLAINT for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      try {
        const activitiesData = {
          name: complaintActivitiesLabels.created,
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        const formattedActivities = convertToObjectWithCreate(activitiesData);
        const complaint = await prisma.complaints.create({
          data: {
            ...input,
            complaintNumber: generateUniqueNumber(),
            complaintActivities: formattedActivities,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        if (complaint) {
          sendEmail(
            input?.complainantEmail as string,
            input?.complainantFirstName,
            "complaint"
          );
        }
        logInfo(
          `SUCCESS: Successfully CREATED COMPLAINT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(complaint)}`
        );
        return complaint;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE COMPLAINT for user: ${
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
        id: z.number(),
        body: complaintSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE COMPLAINT for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, complaintId: ${
          input.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const previousComplaint = await ctx.prisma.complaints.findFirst({
          where: {
            id: input.id,
          },
        });

        if (
          previousComplaint?.status !== "CLOSED" &&
          !previousComplaint?.isArchived
        ) {
          const complaint = await prisma.complaints.update({
            where: {
              id: input.id,
            },
            data: {
              ...input.body,
              updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
            },
          });
          const explicitActivities = findObjectDifferences(
            previousComplaint,
            complaint
          );
          const activityDescription = Object.keys(explicitActivities);
          const activitiesData = {
            complaintId: complaint.id,
            name: complaintActivitiesLabels.updated,
            description: { data: activityDescription },
            differences: explicitActivities,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          };
          const activitiesResponse = await prisma.complaintsActivity.create({
            data: activitiesData,
          });
          logInfo(
            `SUCCESS: Successfully UPDATED COMPLAINT for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, and complaintId: ${
              input.id
            } Response: ${JSON.stringify(complaint)}`
          );
          return complaint;
        } else {
          logError(
            `FAILURE: Error in UPDATE COMPLAINT for user: ${
              ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, complaintId: ${
              input.id
            } and Error: ${JSON.stringify(previousComplaint)}`
          );

          throw new Error("Comlaint is Closed or Archived");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE COMPLAINT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and complaintId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for DELETE COMPLAINT for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, complaintId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.complaints.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully in DELETED COMPLAINT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName},complaintId: ${
            input.id
          }, and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE COMPLAINT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName},complaintId: ${
            input.id
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  archived: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for ARCHIVED COMPLAINTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, complaintId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.complaints.update({
          where: {
            id: input.id,
          },
          data: {
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully ARCHIVE COMPLAINT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName},complaintId: ${
            input.id
          } and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE COMPLAINT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName},complaintId: ${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  status: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(complaintStatus) }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for COMPLAINT STATUS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and complaintId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const previousComplaint = await ctx?.prisma.complaints.findFirst({
          where: {
            id: input.id,
          },
        });
        if (input.status !== "CLOSED") {
          logError(
            `FAILURE: Error in STATUS UPDATE for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, and complaintId: ${
              input.id
            } Error: ${JSON.stringify("Cannot change status from CLOSED")}`
          );
          throw new Error("Cannot change status from CLOSED");
        }
        const complaint = await prisma.complaints.update({
          where: {
            id: input.id,
          },
          data: {
            status: input.status,
          },
        });
        const explicitActivities = findObjectDifferences(
          previousComplaint,
          complaint
        );
        const activityDescription = Object.keys(explicitActivities);
        const activitiesData = {
          complaintId: complaint.id,
          name: complaintActivitiesLabels.closed,
          description: { data: activityDescription },
          differences: explicitActivities,
          createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
        };
        const activitiesResponse = await prisma.complaintsActivity.create({
          data: activitiesData,
        });
        logInfo(
          `SUCCESS: Successfully in STATUS UPDATE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and complaintId: ${
            input.id
          } Response: ${JSON.stringify(complaint)}`
        );
        return complaint;
      } catch (error: any) {
        logError(
          `FAILURE: Error in STATUS UPDATE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and complaintId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function complaintSchema() {
  return z.object({
    complaintNumber: z.string().optional(),
    policyId: z.string(),
    description: z.string().optional(),
    status: z.enum(complaintStatus),
    reason: z.string().optional(),
    complainantFirstName: z.string(),
    complainantLastName: z.string(),
    complainantEmail: z.string().email(),
    complainantMobileNumber: z.string(),
    packageName: z.enum(packageName).optional(),
    isArchived: z.boolean().optional(),
  });
}
