import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";

export const actionRequiredPolicyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        policyNumber: z.string(),
        actionDate: z.date(),
        childId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for CREATING ActionRequired Policies data, for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      try {
        const actionRequiredPolicy =
          await ctx.prisma.actionRequiredPolices.create({
            data: {
              policyNumber: input.policyNumber,
              actionDate: input.actionDate,
              childId: input.childId,
            },
          });
        logInfo(
          `Success for CREATING ActionRequired Policies data, for User Id: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user?.firstName
          }, and Request: ${JSON.stringify(actionRequiredPolicy)}`
        );
        return actionRequiredPolicy;
      } catch (error) {
        logError(
          `Error at for CREATING ActionRequired Policies data, for User Id: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user?.firstName
          }, and Request: ${JSON.stringify(error)}`
        );
      }
    }),
});
