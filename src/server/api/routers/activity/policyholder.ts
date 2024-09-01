import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const policyholderActivityRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    try {
      const response = ctx.prisma.policyholderActivity.findMany({
        where: {
          isArchived: false,
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved LIST POLICYHOLDER activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (err: any) {
      logError(
        `FAILURE: Error in LIST POLICYHOLDER ACTIVITY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(err)}`
      );
      throw new Error(err);
    }
  }),
  show: protectedProcedure.input(z.number()).query(({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW in Policyholder activity for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = ctx.prisma.policyholderActivity.findFirst({
        where: {
          id: Number(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved POLICYHOLDER activity, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error occured while retrieving POLICYHOLDER activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
  create: protectedProcedure
    .input(getPolicyholderActivityInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE in Policyholder activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const newPolicyholder = await prisma.policyholderActivity.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        return newPolicyholder;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE Policyholder activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        throw new Error("Failed to create policyholder activity.");
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getPolicyholderActivityInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST for UPDATE in Policyholder activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.policyholderActivity.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED Policyholder activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while UPDATING Policyholder activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for DELETE in Policyholder activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.policyholderActivity.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED Policyholder activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while DELETING the Policyholder Activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
});

function getPolicyholderActivityInputSchema() {
  return z.object({
    policyholderId: z.string(),
    name: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
