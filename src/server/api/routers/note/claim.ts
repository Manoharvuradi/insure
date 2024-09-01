import { z } from "zod";
import { logError } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { handleApiResponseError } from "~/utils/helpers";

export const claimNoteRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.claimNote.findMany({
        where: {
          isArchived: false,
        },
      });
    } catch (error: any) {
      logError(
        `Error in listClaimNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  findByClaimId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.claimNote.findMany({
          where: {
            claimId: input,
          },
        });
      } catch (error: any) {
        logError(
          `Error in findByClaimIdNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.claimNote.findFirst({
        where: {
          id: Number(input),
        },
      });
    } catch (error: any) {
      logError(
        `Error in showClaimNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getClaimNoteInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      try {
        const newClaimNote = await ctx.prisma.claimNote.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        return newClaimNote;
      } catch (error) {
        logError(
          `Error in createClaimNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        throw new Error("Failed to create Claim Note.");
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getClaimNoteInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        return await prisma.claimNote.update({
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
          `Error in updateClaimNote for user: ${
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
        return await prisma.claimNote.delete({
          where: {
            id: Number(input.id),
          },
        });
      } catch (error: any) {
        logError(
          `Error in deleteClaimNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getClaimNoteInputSchema() {
  return z.object({
    claimId: z.string(),
    title: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
