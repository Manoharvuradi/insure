import { z } from "zod";
import { env } from "~/env.mjs";
import jwt from "jsonwebtoken";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

import { logError, logInfo } from "../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";
import { UserRole } from "@prisma/client";
import { role } from "~/utils/constants";

export const tokensRouter = createTRPCRouter({
  createToken: protectedProcedure
    .input(createTokenInputSchema())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for CREATE TOKEN for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      const secret = env.NEXTAUTH_SECRET as string;
      if (input) {
        const payload = {
          id: input?.id,
          email: input?.email,
        };

        const expiresIn = 6 * 30 * 24 * 60 * 60;

        const options = {
          expiresIn: expiresIn,
        };

        const token = jwt.sign(payload, secret, options);

        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
        const expiry = expiryDate.toISOString();

        const generatedToken = await prisma.jwtToken.create({
          data: {
            token: token,
            expiry: expiry,
            userId: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: CREATE TOKEN for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, Response: ${JSON.stringify(input)}`
        );
        return generatedToken;
      }
      return null;
    }),

  getTokens: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST GETTOKENS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await ctx.prisma.jwtToken.findMany({
          where: {
            userId: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully retrieved GETTOKENS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, Response: ${JSON.stringify(input)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in GETTING TOKEN for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function createTokenInputSchema() {
  return z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    roles: z.array(z.enum(role)),
    packageName: z.string().optional(),
  });
}
