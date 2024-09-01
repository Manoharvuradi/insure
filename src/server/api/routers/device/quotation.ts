import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { premiumFrequency } from "~/utils/constants";
import { devicePremiumData } from "~/utils/constants/calculations";
import { logError, logInfo } from "../../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";

export const deviceQuotationRouter = createTRPCRouter({
  show: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: Retrieving SHOW DEVICE QUOTE data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await ctx?.prisma.devicePremiumCalculator.findFirst({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully retrieved CREDIT LIFE QUOTATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occurred while retrieving DEVICE QUOTAION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx.session?.user.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  create: protectedProcedure
    .input(getDeviceQuotationInputSchema())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: Creating DEVICE QUOTATION data for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      let data = { ...input.policyData };
      try {
        const devicePremium = await devicePremiumData(ctx, data);
        const request = {
          ...input,
          policyData: {
            deviceData: { ...devicePremium },
          },
        };
        const deviceQuotation = ctx?.prisma.quotation.create({
          data: {
            ...request,
          },
        });
        logInfo(
          `SUCCESS: Successfully Created DEVICE QUOTATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(deviceQuotation)}`
        );
        return deviceQuotation;
      } catch (error) {
        logError(
          `FAILURE: Error occurred while CREATING DEVICE QUOTATION  data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: DELETE DEVICE QUOTATION data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and Id: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await ctx?.prisma.devicePremiumCalculator.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED DEVICE QUOTATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while DELETEING DEVICE QUOTATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getDeviceQuotationInputSchema() {
  const policyData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_INSURANCE"),
      deviceType: z.string(),
      isRecentPurchase: z.boolean(),
      devicePrice: z.number(),
    }),
  ]);
  return z.object({
    billingFrequency: z.enum(premiumFrequency),
    policyData: policyData,
    isArchived: z.boolean().optional(),
  });
}
