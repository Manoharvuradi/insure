import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const policyActivityRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ctx.prisma.policyActivity.findMany({
        where: {
          isArchived: false,
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved LIST POLICY activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (err: any) {
      logError(
        `FAILURE: Error in LIST POLICY ACTIVITY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(err)}`
      );
      throw new Error(err);
    }
  }),
  findByPolicyId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for FIND POLICY BY ID in Policy activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await ctx.prisma.policyActivity.findMany({
          where: {
            policyId: input,
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
          `SUCCESS: SUCCESSFULLY FOUND POLICY BY ID in policy activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Request: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while FINDING POLICY BY ID in policy activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } Error: ${JSON.stringify(error)}`
        );
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW in Policy activity for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.policyActivity.findFirst({
        where: {
          id: Number(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved Policy activity, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error occured while retrieving Policy activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
  create: protectedProcedure
    .input(getPolicyActivityInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE in Policy activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const newPolicyholder = await prisma.policyActivity.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATED Policy activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(newPolicyholder)}`
        );
        return newPolicyholder;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE Policy activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        throw new Error("Failed to create policy activity.");
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getPolicyActivityInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE in Policy activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.policyActivity.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED Policy activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while UPDATING Policy activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for DELETE in Policy activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.policyActivity.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED Policy activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while DELETING the Policy Activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
});

function getPolicyActivityInputSchema() {
  return z.object({
    policyId: z.string(),
    name: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
