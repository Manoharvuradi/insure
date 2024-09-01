import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import { features, role } from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";
import { transformArrayToObject } from "~/utils/constants/accessLevels";
import { logError, logInfo } from "../constants/logger";

export const accessLevelsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ role: z.enum(role).optional() }))
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: list Access levels for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(input)}`
      );
      try {
        const result = await prisma.accessLevels.findMany({
          where: {
            role: input.role,
          },
        });
        logInfo(
          `SUCCESS: Successfully retrieved list Access levels for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(result)}`
        );
        return result;
      } catch (error: any) {
        logError(
          `Error in list Access levels for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await ctx.prisma.accessLevels.findMany();
      const intoObject = transformArrayToObject(result);
      return intoObject;
    } catch (error: any) {
      logError(
        `Error in list Access levels for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),

  create: protectedProcedure
    .input(createAccessLevelsInputSchema())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: CREATE Access levels for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and REQUEST: ${JSON.stringify(input)}`
      );
      try {
        const request = {
          id: input.id,
          role: input.role,
          features: input.features,
          canView: input.canView,
          canCreate: input.canCreate,
          canUpdate: input.canUpdate,
          canDelete: input.canDelete,
        };
        if (ctx?.session?.user?.id) {
          const result = await ctx.prisma.accessLevels.create({
            data: {
              ...request,
              createdById: parseInt(ctx?.session?.user?.id as string),
            },
          });
          logInfo(
            `SUCCESS: Successfully createD Access levels for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and response: ${JSON.stringify(result)}`
          );
          return result;
        }
      } catch (error: any) {
        logError(
          `Error in create Access levels for user: ${
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
        body: getUpdateAccessLevelsInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: create Access levels for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and request: ${JSON.stringify(input)}`
      );
      try {
        if (ctx?.session?.user?.id) {
          const result = await prisma.accessLevels.update({
            where: {
              id: input.id,
            },
            data: {
              ...input.body,
              updatedById: parseInt(ctx?.session?.user?.id as string),
            },
          });
          logInfo(
            `SUCCESS: Successfully created Access levels for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and response: ${JSON.stringify(result)}`
          );
          return result;
        }
      } catch (error: any) {
        logError(
          `Error in create Access levels for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: delete Access levels for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(input)}`
      );
      try {
        const result = await prisma.accessLevels.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully deleted Access levels for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(result)}`
        );
        return result;
      } catch (error: any) {
        logError(
          `Error in delete Access levels for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function createAccessLevelsInputSchema() {
  return z.object({
    id: z.number(),
    role: z.enum(role),
    features: z.enum(features),
    canView: z.boolean(),
    canCreate: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
  });
}
function getUpdateAccessLevelsInputSchema() {
  return z.object({
    role: z.enum(role).optional(),
    features: z.enum(features).optional(),
    canView: z.boolean().optional(),
    canCreate: z.boolean().optional(),
    canUpdate: z.boolean().optional(),
    canDelete: z.boolean().optional(),
  });
}
