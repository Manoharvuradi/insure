import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  convertToObjectWithCreate,
  convertToObjectWithUpdate,
  coverageOptions,
  premiumFrequency,
} from "~/utils/constants";
import { getExtendedFamilyPremiumCalculatorByFilter } from "~/utils/constants/calculations";
import { handleApiResponseError } from "~/utils/helpers";

export const extendedFamilyPremiumCalculatorRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ctx.prisma.extendedPremiumCalculator.findMany({
        where: {
          isArchived: false,
        },
        include: {
          extendedFamily: true,
        },
      });
      logInfo(
        `SUCCESS: Successfully LISTED EXTENDED FAMILY PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in EXTENDED FAMILY PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for SHOW EXTENDED FAMILY PREMIUM CALCULATIONS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${
        ctx?.session?.user?.firstName
      }, id: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.extendedPremiumCalculator.findFirst({
        where: {
          id: input,
        },
        include: {
          extendedFamily: true,
        },
      });
      if (response) {
        logInfo(
          `SUCCESS: Successfully retrieved SHOW EXTENDED FAMILY PREMIUM CALCULATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(response)}`
        );
        return response;
      } else {
        logError(
          `FAILURE: Error in SHOW EXTENDED FAMILY PREMIUM CALCULATIONS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(response)}`
        );
      }
      return handleApiResponseError(response);
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW EXTENDED FAMILY PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getExtendedFamilyPremiumCalculatorInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const formattedExtendFamily = convertToObjectWithCreate(
          input.extendedFamily
        );
        const newPolicyholder = await prisma.extendedPremiumCalculator.create({
          data: {
            ...input,
            extendedFamily: formattedExtendFamily,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
          include: {
            extendedFamily: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(newPolicyholder)}`
        );
        return newPolicyholder;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getExtendedFamilyPremiumCalculatorInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input.id} REQUEST: ${JSON.stringify(input)}`
      );
      try {
        const formattedExtendedFamily = convertToObjectWithUpdate(
          input.body.extendedFamily
        );
        const response = await prisma.extendedPremiumCalculator.update({
          where: {
            id: input.id,
          },
          include: {
            extendedFamily: true,
          },
          data: {
            ...input.body,
            extendedFamily: formattedExtendedFamily,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully retrieved UPDATE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input.id} and response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE:Error in UPDATE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input.id} and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for DELETE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input.id} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.extendedPremiumCalculator.delete({
          where: {
            id: input.id,
          },
          include: {
            extendedFamily: true,
          },
        });
        logError(
          `SUCCESS: Successfully  DELETED EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input.id} and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE EXTENDED FAMILY PREMIUM CALCULATOR for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input.id} and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  filter: protectedProcedure
    .input(getExtendedFamilyPremiumCalculatorFilterInputSchema())
    .output(getExtendedFamilyPremiumCalculatorInputSchema())
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST for EXTENDED FAMILY MEMBER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await getExtendedFamilyPremiumCalculatorByFilter(
          input,
          ctx
        );
        logInfo(
          `SUCCESS: successfully retrieved in filterExPremiumCalculationActivity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `Error in filterExPremiumCalculationActivity for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getExtendedFamilyPremiumCalculatorInputSchema() {
  return z.object({
    options: z.enum(coverageOptions),
    extendedFamily: z.array(
      z.object({
        id: z.number().optional(),
        minAge: z.number(),
        maxAge: z.number(),
        coverageAmount: z.number(),
        premiumAmount: z.number(),
        premiumFrequency: z.enum(premiumFrequency),
      })
    ),
    isArchived: z.boolean().optional(),
  });
}

function getExtendedFamilyPremiumCalculatorFilterInputSchema() {
  return z.object({
    options: z.enum(coverageOptions),
    extendedFamily: z.array(
      z.object({
        age: z.number(),
        premiumFrequency: z.enum(premiumFrequency),
      })
    ),
  });
}
