import {
  deviceCreditLifePremiumCal,
  devicePremiumData,
  retailDevicePremiumData,
} from "~/utils/constants/calculations";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import {
  additionalPercentageInsured,
  premiumFrequency,
} from "~/utils/constants";
import { logError, logInfo } from "../../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";
import validator from "validator";
import { financedBy } from "~/utils/constants/application";

export const retailDeviceQuoteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(getDeviceQuotationInputSchema())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: Creating RETAIL DEVICE QUOTATION data for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      let data = { ...input.policyData };
      try {
        let creditLifePremium;
        const devicePremium: any = await retailDevicePremiumData(ctx, data);
        if (input.policyData.creditLife) {
          creditLifePremium = await deviceCreditLifePremiumCal(
            input.policyData.creditLife,
            ctx
          );
        }
        delete devicePremium?.creditLife;
        const request = {
          ...input,
          policyData: {
            deviceData: { ...devicePremium },
            creditLifeData: { ...creditLifePremium },
            ...(input.policyData.creditLife
              ? {
                  totalPremium:
                    Number(devicePremium.totalPremium) +
                    Number(creditLifePremium.totalPremium),
                }
              : {
                  totalPremium: Number(devicePremium.totalPremium),
                }),
          },
        };
        const deviceQuotation = ctx?.prisma.quotation.create({
          data: {
            ...request,
          },
        });
        logInfo(
          `SUCCESS: Successfully Created RETAIL DEVICE QUOTATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(deviceQuotation)}`
        );
        return deviceQuotation;
      } catch (error) {
        logError(
          `FAILURE: Error occurred while CREATING RETAIL DEVICE QUOTATION  data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getDeviceQuotationInputSchema() {
  const policyData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("DEVICE_INSURANCE"),
      deviceType: z.string(),
      isRecentPurchase: z.boolean(),
      devicePrice: z.number(),
      phone: z.string().refine(validator.isMobilePhone),
      creditLife: z
        .object({
          packageName: z.literal("DEVICE_CREDITLIFE").optional(),
          deviceUniqueNumber: z.string().optional(),
          additionalPercentageInsured: z
            .enum(additionalPercentageInsured)
            .optional(),
          deviceFinancedBy: z.enum(financedBy).optional(),
          outstandingSettlementBalance: z.number().optional(),
          loanSettlementAtInception: z.number().optional(),
        })
        .optional(),
    }),
  ]);
  return z.object({
    billingFrequency: z.enum(premiumFrequency),
    policyData: policyData,
    isArchived: z.boolean().optional(),
  });
}
