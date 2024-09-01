import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  convertToObjectWithCreate,
  convertToObjectWithUpdate,
  coverageOptions,
  gender,
  identificationType,
  premiumFrequency,
  type,
} from "~/utils/constants";
import { getPremiumCalculatorByFilter } from "~/utils/constants/calculations";
import { handleApiResponseError } from "~/utils/helpers";

export const premiumCalculatorRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ctx.prisma.premiumCalculator.findMany({
        where: {
          isArchived: false,
        },
        include: {
          children: true,
        },
      });
      logInfo(
        `SUCCESS: Successfully LISTED PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in LIST PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `SUCCESS: REQUEST for SHOW PREMIUM CALCULATIONS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, Request: ${JSON.stringify(
        input
      )}`
    );
    try {
      const response = await ctx.prisma.premiumCalculator.findFirst({
        where: {
          id: input,
        },
        include: {
          children: true,
        },
      });
      if (response) {
        return response;
      }
      return handleApiResponseError(response);
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW PREMIUM CALCULATION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getPremiumCalculatorInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      const formattedChildren = convertToObjectWithCreate(input.children);
      try {
        const newPolicyholder = await prisma.premiumCalculator.create({
          data: {
            ...input,
            children: formattedChildren,
            createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
          include: {
            children: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATED PREMIUM CALCULATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(newPolicyholder)}`
        );
        return newPolicyholder;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE PREMIUM CALCULATION for user: ${
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
        body: getPremiumCalculatorInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for UPDATE QUOTE for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, id: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      const formattedChildren = convertToObjectWithUpdate(input.body.children);
      try {
        const response = await prisma.premiumCalculator.update({
          where: {
            id: input.id,
          },
          include: {
            children: true,
          },
          data: {
            ...input.body,
            children: formattedChildren,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED PREMIUM CALCULATE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE PREMIUM CALCULATE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for UPDATE PREMIUM CALCULATIONS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, id: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.premiumCalculator.delete({
          where: {
            id: input.id,
          },
          include: {
            children: true,
          },
        });
        logError(
          `SUCCESS: Successfully DELETED PREMIUM CALCULATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE PREMIUM CALCULATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  filter: protectedProcedure
    .input(getPremiumCalculatorFilterInputSchema())
    .output(getPremiumCalculatorInputSchema())
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST FILTER PREMIUM CALCULATOR for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await getPremiumCalculatorByFilter(input, ctx);
        logError(
          `SUCCESS: Successfully FILETERED PREMIUM CALCULATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in FILETR PREMIUM CALCULATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getPremiumCalculatorInputSchema() {
  return z.object({
    options: z.enum(coverageOptions),
    mainMember: z.object({
      minAge: z.number(),
      maxAge: z.number(),
      coverageAmount: z.number(),
      premiumAmount: z.number(),
      premiumFrequency: z.enum(premiumFrequency),
    }),
    spouse: z.object({
      minAge: z.number(),
      maxAge: z.number(),
      coverageAmount: z.number(),
      premiumAmount: z.number(),
      premiumFrequency: z.enum(premiumFrequency),
    }),
    children: z.array(
      z.object({
        id: z.number().optional(),
        minAge: z.number(),
        maxAge: z.number(),
        isStudying: z.boolean().optional(),
        isDisabled: z.boolean().optional(),
        coverageAmount: z.number(),
        premiumAmount: z.number(),
        premiumFrequency: z.enum(premiumFrequency),
      })
    ),
    isArchived: z.boolean().optional(),
  });
}

function getPremiumCalculatorFilterInputSchema() {
  return z.object({
    options: z.enum(coverageOptions),
    mainMember: z.object({
      age: z.number(),
      premiumFrequency: z.enum(premiumFrequency),
    }),
    spouse: z
      .object({
        age: z.number(),
        premiumFrequency: z.enum(premiumFrequency),
      })
      .optional(),
    children: z
      .array(
        z.object({
          age: z.number(),
          premiumFrequency: z.enum(premiumFrequency),
        })
      )
      .optional(),
  });
}
