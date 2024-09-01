import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const claimActivityRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ctx.prisma.claimActivity.findMany({
        where: {
          isArchived: false,
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved LIST POLICY activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (err) {
      logError(
        `FAILURE: Error in LIAT CLAIMS ACTIVITY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(err)}`
      );
    }
  }),
  findByClaimId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST FIND CLAIM BY ID activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request:${JSON.stringify(input)}`
      );
      try {
        const response = await ctx.prisma.claimActivity.findMany({
          where: {
            claimId: input,
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
          `SUCCESS: SUCCESSFULLY FOUND CLAIM BY ID in claim activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while FINDING CLAIM BY ID in claim activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } Error: ${JSON.stringify(error)}`
        );
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW in claim activity for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.claimActivity.findFirst({
        where: {
          id: Number(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved claim activity, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error occured while retrieving claim activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
  create: protectedProcedure
    .input(getClaimActivityInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE in Claim activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const newClaim = await prisma.claimActivity.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATED claim activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(newClaim)}`
        );
        return newClaim;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE claim activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        throw new Error("Failed to create application activity.");
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getClaimActivityInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE in Claim activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.claimActivity.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED Claim activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while UPDATING Claim activity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for DELETE in Claim activity for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.claimActivity.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED claim activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while DELETING the claim Activity, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
});

function getClaimActivityInputSchema() {
  return z.object({
    claimId: z.string(),
    name: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
