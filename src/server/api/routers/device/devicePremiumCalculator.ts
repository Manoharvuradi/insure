import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { logError, logInfo } from "../../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";

export const devicePremiumCalculatorRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        premiumAmount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: Creating RETAIL DEVICE PREMIUM CAL data for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const response = await ctx?.prisma.devicePremiumCalculator.create({
          data: {
            min: input.min,
            max: input.max,
            premiumAmount: input.premiumAmount,
          },
        });
        logInfo(
          `SUCCESS: Successfully Created RETAIL DEVICE PREMIUM CAL data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occurred while CREATING DEVICE PREMIUM CAL data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
          premiumAMount: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: Update DEVICE PREMIUM CAL data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and Id: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const updatedPremium = await ctx.prisma.devicePremiumCalculator.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED DEVICE PREMIUM CAL data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(updatedPremium)}`
        );
        return updatedPremium;
      } catch (error) {
        logError(
          `FAILURE: Error occured while updating DEVICE PREMIUM CAL for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});
