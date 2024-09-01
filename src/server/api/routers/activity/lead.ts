import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const leadActivityRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ctx.prisma.leadActivity.findMany({
        where: {
          isArchived: false,
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved LIST lead activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (err: any) {
      logError(
        `FAILURE: Error in LIST LEAD ACTIVITY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(err)}`
      );
      throw new Error(err);
    }
  }),
  findByApplicationId: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      logInfo(
        `REQUEST: FIND LEAD BY ID in lead activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = ctx.prisma.leadActivity.findMany({
          where: {
            leadsId: input,
          },
          include: {
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
        });
        logInfo(
          `SUCCESS: SUCCESSFULLY FOUND LEAD BY ID in lead activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Request: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while FINDING LEAD BY ID in lead activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } Error: ${JSON.stringify(error)}`
        );
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW in lead activity for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.leadActivity.findFirst({
        where: {
          id: Number(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved Application activity, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error occured while retrieving Application activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
  create: protectedProcedure
    .input(getApplicationActivityInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE in Application activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const lead = await prisma.leadActivity.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATED Application activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(lead)}`
        );
        return lead;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE Application activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        throw new Error("Failed to create lead activity.");
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getApplicationActivityInputSchema(),
      })
    )
    .mutation(({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE in Application activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const lead = prisma.leadActivity.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED Application activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(lead)}`
        );
        return lead;
      } catch (err) {
        logError(
          `FAILURE: Error in UPDATE Application activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, and Error: ${JSON.stringify(err)}`
        );
        throw new Error("Failed to update lead activity.");
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }: any) => {
      logInfo(
        `REQUEST for DELETE Application activity, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const lead = prisma.leadActivity.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED Application activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(lead)}`
        );
        return lead;
      } catch (err) {
        logError(
          `FAILURE: Error occured while DELETING the Application Activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(err)}`
        );
        throw new Error("Failed to delete lead activity.");
      }
    }),
});

function getApplicationActivityInputSchema() {
  return z.object({
    applicationId: z.string(),
    name: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
