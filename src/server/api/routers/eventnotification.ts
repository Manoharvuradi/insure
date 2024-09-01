import { z } from "zod";
import { logError, logInfo } from "../constants/logger";
import {
  masterEmailTemplate,
  masterSMSTemplate,
} from "~/components/template/eventTemplate/masterTemplate";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  eventCategory,
  eventName,
  packageName,
  pagination,
} from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";

export const eventNotificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          packageName: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST LIST EVENT NOTIFICATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const queryOptions: any = {
          where: {
            isArchived: false,
            packageName: input?.packageName,
          },
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        };

        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          queryOptions.where = {
            ...queryOptions.where,
            eventCategory: {
              in: filterArray,
            },
          };
        }
        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              {
                eventName: {
                  contains: input?.search,
                  mode: "insensitive",
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
        const totalCount = await ctx.prisma.eventNotification.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.eventNotification.findMany(
          queryOptions
        );
        logInfo(
          `SUCCESS: Successfully retrieved LIST EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(({ ctx, input }) => {
    logInfo(
      `REQUEST SHOW EVENTNOTIFICATIONS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, request: ${JSON.stringify(
        input
      )}`
    );
    try {
      const response = ctx.prisma.eventNotification.findFirst({
        where: {
          id: Number(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved SHOW EVENTNOTIFICATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, response: ${JSON.stringify(input)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error in SHOW EVENTNOTIFICATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, Error: ${JSON.stringify(
          input
        )}`
      );
    }
  }),
  create: protectedProcedure
    .input(getNotificationInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST CREATE EVENT NOTIFICATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, eventName: ${
          input.eventName
        }, eventCategory: ${input.eventCategory}  Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const notification = await prisma.eventNotification.create({
          data: {
            ...input,
            emailTemplate: masterEmailTemplate(),
            smsTemplate: masterSMSTemplate(),
            // createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: CREATE EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName},eventName: ${
            input.eventName
          }, eventCategory: ${
            input.eventCategory
          } and response: ${JSON.stringify(notification)}`
        );
        return notification;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName},eventName: ${
            input.eventName
          }, eventCategory: ${input.eventCategory} and Error: ${JSON.stringify(
            error
          )}`
        );
        return handleApiResponseError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getNotificationInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST UPDATE EVENT NOTIFICATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${ctx?.session?.user?.firstName}, eventName: ${
          input.body.eventName
        }, eventCategory: ${input.body.eventCategory} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const eventNotification = await prisma.eventNotification.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logError(
          `SUCCESS: Successfully UPDATED EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(eventNotification)}`
        );
        return eventNotification;
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST EVENT NOTIFICATION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, eventId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const eventNotification = await prisma.eventNotification.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, eventId: ${
            input.id
          }, and Response: ${JSON.stringify(eventNotification)}`
        );
        return eventNotification;
      } catch (error) {
        logError(
          `FAILURE: Error in DELETE EVENT NOTIFICATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, eventId: ${
            input.id
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getNotificationInputSchema() {
  return z.object({
    id: z.number().optional(),
    eventName: z.enum(eventName),
    eventCategory: z.enum(eventCategory),
    packageName: z.enum(packageName),
    emailNotification: z.boolean().optional(),
    attachment: z.boolean().optional(),
    emailTemplate: z.string().optional(),
    smsNotification: z.boolean().optional(),
    smsTemplate: z.string().optional(),
    isArchived: z.boolean().optional(),
  });
}
