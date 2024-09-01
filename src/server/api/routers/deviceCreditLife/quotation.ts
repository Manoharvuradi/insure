import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  additionalPercentageInsured,
  pagination,
  premiumFrequency,
} from "~/utils/constants";
import { deviceCreditLifePremiumCal } from "~/utils/constants/calculations";
import { handleApiResponseError } from "~/utils/helpers";
import { financedBy } from "~/utils/constants/application";

export const deviceCreditLifeRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        pageSize: z.string().optional(),
        offset: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for LSIT DEVICE CREDITLIFE QUOTATION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const totalCount = await ctx.prisma.quotation.count();
        const response = await ctx.prisma.quotation.findMany({
          where: {
            isArchived: false,
          },
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
        });

        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST DEVICE CREDITLIFE QUOTATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  create: protectedProcedure
    .input(getQuotationInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: Creating DEVICE CREDIT LIFE QUOTATION data for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const premiumData = await deviceCreditLifePremiumCal(
          input.policyData,
          ctx
        );
        const request = {
          ...input,
          policyData: {
            packageName: input?.policyData?.packageName,
            ...premiumData,
          },
        };

        const newQuotation = await prisma.quotation.create({
          data: {
            ...request,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully Created DEVICE CREDIT LIFE QUOTATION  data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(newQuotation)}`
        );
        return newQuotation;
      } catch (error) {
        logError(
          `FAILURE: Error occurred while CREAITING DEVICE CREDIT LIFE QUOTATION  data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST: Retrieving DEVICE CREDIT LIFE SHOW QUOTE data for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, Request: ${JSON.stringify(
        input
      )}`
    );
    try {
      const response = await ctx.prisma.quotation.findFirst({
        where: {
          id: input,
        },
      });
      if (response) {
        logInfo(
          `SUCCESS: Successfully retrieved DEVICE CREDIT LIFE QUOTATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      }
      return handleApiResponseError(response);
    } catch (error: any) {
      logError(
        `FAILURE: Error occurred while retrieving DEVICE CREDIT LIFE QUOTAION data for User ID: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User Name: ${ctx.session?.user.firstName} and Error: ${JSON.stringify(
          error
        )}`
      );
      return handleApiResponseError(error);
    }
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: DELETE DEVICE CREDIT LIFE QUOTATION data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${ctx?.session?.user?.firstName} and Id: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.quotation.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED DEVICE CREDIT LIFE QUOTATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while DELETING DEVICE CREDIT LIFE QUOTATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getQuotationInputSchema() {
  const policyData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_CREDITLIFE"),
      deviceUniqueNumber: z.string(),
      additionalPercentageInsured: z
        .enum(additionalPercentageInsured)
        .optional(),
      deviceFinancedBy: z.enum(financedBy),
      outstandingSettlementBalance: z.number(),
      loanSettlementAtInception: z.number().optional(),
    }),
  ]);
  return z.object({
    billingFrequency: z.enum(premiumFrequency),
    policyData: policyData,
    isArchived: z.boolean().optional(),
  });
}
