import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import { exclude, pagination } from "~/utils/constants";
import { roleValues } from "~/utils/constants/user";
import { callCenterPerformance, handleApiResponseError } from "~/utils/helpers";
import { CallCenter, Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import { leadsNoteRouter } from "./note/leads";
import { useInRouterContext } from "react-router-dom";

export const callCenterRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          showPagination: z.boolean().optional(),
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          includeCallCenters: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for LIST Callcenters for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        let user;
        const queryOptions = {
          ...(!(input?.showPagination === false) && {
            take: Number(
              input?.pageSize ? input?.pageSize : pagination.pageSize
            ),
            skip: Number(input?.offset ? input?.offset : pagination.offset),
          }),
          where: {},
          include: {
            user: {
              where: {
                isArchived: false,
              },
            },
          },
        };
        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              {
                name: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
            ],
          };
        }
        const totalCount = await prisma.callCenter.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.callCenter.findMany(queryOptions);
        const updatedStats: any[] = await Promise.all(
          response.map(async (callCenter: any) => {
            const callCenterStats = await callCenterPerformance(
              ctx,
              callCenter,
              true
            );
            return callCenterStats;
          })
        );
        logInfo(
          `SUCCESS: Successfully LIST CallCenter for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(response)} `
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: updatedStats,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST Call center for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        search: z.string().optional(),
        pageSize: z.string().optional(),
        offset: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        ` Request in SHOW CALL CENTER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)} `
      );
      try {
        let userQueryOptions: any = {
          where: {
            isArchived: false,
          },
          select: {
            id: true,
            firstName: true,
            agentRoletype: true,
          },
        };
        if (input?.search) {
          userQueryOptions.where = {
            ...userQueryOptions.where,
            OR: [
              {
                firstName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
                lastName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
            ],
          };
        }
        const callCenter: any = await ctx.prisma.callCenter.findFirst({
          where: {
            id: parseInt(input.id),
          },
          include: {
            user: {
              ...userQueryOptions,
            },
          },
        });
        let totalUserCount = await ctx.prisma.callCenter.findFirst({
          where: {
            id: parseInt(input.id),
          },
          include: {
            user: {
              where: {
                isArchived: false,
              },
            },
          },
        });
        let totalCount = totalUserCount?.user.length;
        const totalAgentPerformance: any = await callCenterPerformance(
          ctx,
          callCenter,
          false
        );
        logInfo(
          `SUCCESS: Successfully retrieved SHOW CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(callCenter)} `
        );
        const agentPerformance = totalAgentPerformance.slice(
          Number(input.offset),
          Number(input.offset) + Number(input.pageSize)
        ); //agent performance with pagenation
        return { ...callCenter, agentPerformance, totalCount: totalCount };
      } catch (error: any) {
        logError(
          `FAILURE: Error in SHOW CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } ${input} and response: ${JSON.stringify(error)} `
        );
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      logInfo(
        `Request in CREATE CALL CENTER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)} `
      );
      try {
        const callCenter = await ctx.prisma.callCenter.create({
          data: { ...input },
        });
        logInfo(
          `SUCCESS: Successfully CREATED CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(callCenter)} `
        );
        return callCenter;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(error)} `
        );
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `Request in UPDATE CALL CENTER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)} `
      );
      try {
        const updatedCallCenter = await ctx.prisma.callCenter.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(updatedCallCenter)} `
        );
        return updatedCallCenter;
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)} `
        );
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: Request in DELETE CALL CENTER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)} `
      );
      try {
        const deleteCallCenter = await ctx.prisma.callCenter.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(input)} `
        );
        return deleteCallCenter;
      } catch (error) {
        logError(
          `FAILURE: Error in DELETE CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)} `
        );
      }
    }),

  agentList: publicProcedure
    .input(
      z.object({
        id: z.number(),
        pageSize: z.string().optional(),
        offset: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: Request in DashboardList CALL CENTER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)} `
      );
      try {
        let userQueryOptions: any = {
          where: {
            isArchived: false,
          },
          select: {
            id: true,
            firstName: true,
            agentRoletype: true,
          },
        };

        if (input?.search) {
          userQueryOptions.where = {
            ...userQueryOptions.where,
            OR: [
              {
                firstName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
                lastName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
            ],
          };
        }

        const dashboardCallcenter: any =
          await ctx.prisma.credentialsUser.findFirst({
            where: {
              id: input.id,
            },
            include: {
              callCenter: {
                select: {
                  id: true,
                },
              },
            },
          });

        const callCenter: any = await ctx.prisma.callCenter.findFirst({
          where: {
            id: parseInt(dashboardCallcenter.callCenter.id),
          },
          include: {
            user: {
              ...userQueryOptions,
            },
          },
        });

        const totalAgentPerformance: any = await callCenterPerformance(
          ctx,
          callCenter,
          false
        );
        const statsLength = totalAgentPerformance.length;

        logInfo(
          `SUCCESS: Successfully DashboardList CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(input)} `
        );
        const agentPerformance = totalAgentPerformance.slice(
          Number(input.offset),
          Number(input.offset) + Number(input.pageSize)
        ); //agent performance with pagenation
        return { agentPerformance, totalCount: statsLength };
      } catch (error) {
        logError(
          `FAILURE: Error in DashboardList CALL CENTER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)} `
        );
      }
    }),
});
