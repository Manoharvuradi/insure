import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { handleApiResponseError } from "~/utils/helpers";
import { logError } from "../../constants/logger";
export const policyNoteRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.policyNote.findMany({
        where: {
          isArchived: false,
        },
      });
    } catch (error: any) {
      logError(
        `Error in listPolicyNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  findByPolicyId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.policyNote.findMany({
          where: {
            policyId: input,
          },
        });
      } catch (error: any) {
        logError(
          `Error in findByPolicyIdNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.policyNote.findFirst({
        where: {
          id: Number(input),
        },
      });
    } catch (error: any) {
      logError(
        `Error in showPolicyNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getPolicyNoteInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      try {
        const newPolicyNote = await prisma.policyNote.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        return newPolicyNote;
      } catch (error) {
        logError(
          `Error in createPolicyNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getPolicyNoteInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        return await prisma.policyNote.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
      } catch (error: any) {
        logError(
          `Error in updatePolicyNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await prisma.policyNote.delete({
          where: {
            id: Number(input.id),
          },
        });
      } catch (error: any) {
        logError(
          `Error in deletePolicyNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getPolicyNoteInputSchema() {
  return z.object({
    policyId: z.string(),
    title: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
