import { z } from "zod";
import { logError } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { handleApiResponseError } from "~/utils/helpers";

export const applicationNoteRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.applicationNote.findMany({
        where: {
          isArchived: false,
        },
      });
    } catch (error: any) {
      logError(
        `Error in listApplicationNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  findByApplicationId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.applicationNote.findMany({
          where: {
            applicationId: input,
          },
        });
      } catch (error: any) {
        logError(
          `Error in findByApplicationIdNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.applicationNote.findFirst({
        where: {
          id: Number(input),
        },
      });
    } catch (error: any) {
      logError(
        `Error in showApplicationNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getApplicationNoteInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      try {
        const newApplicationNote = await prisma.applicationNote.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        return newApplicationNote;
      } catch (error) {
        logError(
          `Error in createApplicationNote for user: ${
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
        body: getApplicationNoteInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        return await prisma.applicationNote.update({
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
          `Error in updateApplicationNote for user: ${
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
        return await prisma.applicationNote.delete({
          where: {
            id: Number(input.id),
          },
        });
      } catch (error) {
        logError(
          `Error in deleteApplicationNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getApplicationNoteInputSchema() {
  return z.object({
    applicationId: z.string(),
    title: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
