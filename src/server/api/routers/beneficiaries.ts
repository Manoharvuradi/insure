import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { gender } from "~/utils/constants";
import { logError, logInfo } from "../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";
import validator from "validator";

export const beneficiariesRouter = createTRPCRouter({
  update: protectedProcedure
    .input(beneficiarySchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for IBENEFICIARY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const claim = await prisma.iBeneficiary.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
            updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully retrieved IBENEFICIARY data for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and applicationId: ${
            input.id
          } Response: ${JSON.stringify(claim)}`
        );
        return claim;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE IBENEFICAIRY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, applicationId: ${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for IBENEFICIARY for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.iBeneficiary.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: successfully retrieved IBENEFICIARY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and applicationId: ${
            input.id
          } Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE IBENEFICIARY for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, applicationId: ${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function beneficiarySchema() {
  return z.object({
    id: z.number(),
    body: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      percentage: z.number(),
      relation: z.string(),
      identification: z.object({
        country: z.string(),
        passportNumber: z.string().optional(),
        said: z.string().length(13),
      }),
      gender: z.enum(gender),
      dateOfBirth: z.date(),
      phone: z.string().refine(validator.isMobilePhone),
    }),
  });
}
