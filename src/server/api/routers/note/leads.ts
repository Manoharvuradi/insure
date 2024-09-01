import { z } from "zod";
import { logError } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { handleApiResponseError } from "~/utils/helpers";

export const leadsNoteRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.leadNote.findMany({
        where: {
          isArchived: false,
        },
      });
    } catch (error: any) {
      logError(
        `Error in listLeadNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  findByLeadId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.leadNote.findMany({
          where: {
            leadsId: input,
          },
        });
      } catch (error: any) {
        logError(
          `Error in findByLeadIdNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.leadNote.findFirst({
        where: {
          id: Number(input),
        },
      });
    } catch (error: any) {
      logError(
        `Error in showLeadNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getLeadsInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      try {
        const newLeadNote = await prisma.leadNote.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        return newLeadNote;
      } catch (error) {
        logError(
          `Error in createLeadNote for user: ${
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
        body: getLeadsInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        return await prisma.leadNote.update({
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
          `Error in updateLeadNote for user: ${
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
        return await prisma.leadNote.delete({
          where: {
            id: Number(input.id),
          },
        });
      } catch (error) {
        logError(
          `Error in deleteLeadNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getLeadsInputSchema() {
  return z.object({
    leadsId: z.string(),
    title: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
