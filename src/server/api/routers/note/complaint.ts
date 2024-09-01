import { z } from "zod";
import { logError } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { handleApiResponseError } from "~/utils/helpers";

export const complaintNoteRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.complaintNotes.findMany({
        where: {
          isArchived: false,
        },
      });
    } catch (error: any) {
      logError(
        `Error in listcomplaintNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  findByComplaintId: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.complaintNotes.findMany({
          where: {
            complaintId: input,
          },
        });
      } catch (error: any) {
        logError(
          `Error in findByComplaintId for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.complaintNotes.findFirst({
        where: {
          id: Number(input),
        },
      });
    } catch (error: any) {
      logError(
        `Error in showComplaintNote for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getComplaintNoteInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      try {
        const newComplaintNote = await prisma.complaintNotes.create({
          data: {
            ...input,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        return newComplaintNote;
      } catch (error) {
        logError(
          `Error in createComplaintNote for user: ${
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
        body: getComplaintNoteInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        return await prisma.complaintNotes.update({
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
          `Error in updatecomplaintNote for user: ${
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
        return await prisma.complaintNotes.delete({
          where: {
            id: Number(input.id),
          },
        });
      } catch (error) {
        logError(
          `Error in deletecomplaintNote for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getComplaintNoteInputSchema() {
  return z.object({
    complaintId: z.number(),
    title: z.string(),
    description: z.string(),
    isArchived: z.boolean().optional(),
  });
}
