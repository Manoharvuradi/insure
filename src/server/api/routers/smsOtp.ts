import { logError, logWarn } from "~/server/api/constants/logger";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import {
  features,
  generateOtp,
  generateRandomBase32,
  role,
} from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";
import { transformArrayToObject } from "~/utils/constants/accessLevels";
import * as OTPAuth from "otpauth";
import { env } from "~/env.mjs";
import { smsOTPGenerator } from "~/utils/helpers/sendSms";

export const SmsOtpRouter = createTRPCRouter({
  verifyOtp: publicProcedure
    .input(
      z.object({
        otp: z.string(),
        user: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { otp, user } = input;
        const userResponse = await ctx.prisma.credentialsUser.findUnique({
          where: { email: user },
        });

        const message = "Otp is invalid or user doesn't exist";
        if (!userResponse) {
          return message;
        }
        const smsResponse = await ctx.prisma.smsVerfication.findFirst({
          where: { email: user },
          orderBy: { createdAt: "desc" },
        });

        if (smsResponse === null || smsResponse?.otp != otp) {
          return message;
        }
        return {
          otp_valid: true,
        };
      } catch (error) {
        logError(
          `Error in Validate SMS otp for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  resendOtp: publicProcedure
    .input(
      z.object({
        user: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { user } = input;
        const credentialsUserResponse = await prisma.credentialsUser.findFirst({
          where: {
            email: user,
          },
        });
        const smsResponse = await smsOTPGenerator(
          generateOtp(6),
          credentialsUserResponse?.phone as string
        );
        if (smsResponse?.status) {
          const otpResponse = await prisma.smsVerfication.create({
            data: {
              email: user,
              otp: smsResponse?.otp,
              // message: smsResponse?.smsConvert,
              createdById: credentialsUserResponse?.id,
            },
          });
          logWarn(
            `success in
          } and response: ${JSON.stringify(otpResponse)}`
          );
          return otpResponse;
        } else {
          logError(`Error in Validate sms otp resend for user: `);
          return handleApiResponseError({
            inputError: "Invalid OTP.",
          });
        }
      } catch (error) {
        logError(
          `Error in Validate sms otp resend for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});
