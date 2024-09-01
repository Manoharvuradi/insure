import { logError } from "~/server/api/constants/logger";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import { features, generateRandomBase32, role } from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";
import { transformArrayToObject } from "~/utils/constants/accessLevels";
import * as OTPAuth from "otpauth";
import { env } from "~/env.mjs";

export const TwofaRouter = createTRPCRouter({
  enable2FA: publicProcedure //generate base32 string
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const id = input.id;

        const user = await prisma.credentialsUser.findUnique({
          where: { id: id },
        });

        if (!user) {
          return "User not found";
        }

        const base32_secret = generateRandomBase32();

        let totp = new OTPAuth.TOTP({
          issuer: env.ISSUER,
          label: user.firstName + "" + user.lastName,
          algorithm: env.ALGORITHM,
          digits: 6,
          secret: base32_secret,
        });

        let otpauth_url = totp.toString();

        const updatedUser = await prisma.credentialsUser.update({
          where: { id: id },
          data: {
            otp_auth_url: otpauth_url,
            otp_base32: base32_secret,
          },
        });
        const result = {
          base32: updatedUser.otp_base32,
          otpauth_url: updatedUser.otp_auth_url,
        };
        return result;
      } catch (error) {
        logError(
          `Error in enable 2fa for user: ${
            input?.id && input?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  verify2FA: protectedProcedure // register 2fa
    .input(
      z.object({
        id: z.number(),
        token: z.string(),
        base32: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, token, base32 } = input;
        const user = await prisma.credentialsUser.findUnique({
          where: { id: id },
        });
        if (!user) {
          return "User not found";
        }

        let totp = new OTPAuth.TOTP({
          issuer: env.ISSUER,
          label: user.firstName + "" + user.lastName,
          algorithm: env.ALGORITHM,
          digits: 6,
          secret: base32,
        });
        let delta = totp.validate({ token, window: 1 });
        if (delta === null) {
          return "Invalid Token";
        }

        const updatedUser = await prisma.credentialsUser.update({
          where: { id: id },
          data: {
            otp_enabled: true,
            otp_verified: true,
          },
        });

        return {
          otp_verified: true,
          user: updatedUser,
        };
      } catch (error) {
        logError(
          `Error in verify 2fa for user: ${
            input.id && input.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  validate2FA: publicProcedure // check 2fa
    .input(
      z.object({
        id: z.string(),
        token: z.string(),
        base32: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, token, base32 } = input;
        const user = await ctx.prisma.credentialsUser.findUnique({
          where: { id: Number(id) },
        });

        const message = "Token is invalid or user doesn't exist";
        if (!user) {
          return message;
        }
        let totp = new OTPAuth.TOTP({
          issuer: env.ISSUER,
          label: user.firstName + "" + user.lastName,
          algorithm: env.ALGORITHM,
          digits: 6,
          secret: base32,
        });
        let delta = totp.validate({ token, window: 1 });
        if (delta === null) {
          return message;
        }

        return {
          otp_valid: true,
        };
      } catch (error) {
        logError(
          `Error in Validate 2fa for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  disable2FA: protectedProcedure // remove 2fa
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;

        const user = await ctx.prisma.credentialsUser.findUnique({
          where: { id: id },
        });
        const message = "User not found";
        if (!user) {
          return message;
        }

        const updatedUser = await ctx.prisma.credentialsUser.update({
          where: { id: id },
          data: {
            otp_enabled: false,
            otp_base32: null,
            otp_auth_url: null,
            otp_verified: false,
          },
        });

        return {
          otp_disabled: true,
          user: {
            id: updatedUser.id,
            name: updatedUser.firstName,
            email: updatedUser.email,
            otp_enabled: updatedUser.otp_enabled,
          },
        };
      } catch (error) {
        logError(
          `Error in disable 2fa for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});
