import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  User,
  RequestInternal,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import {
  generateOtp,
  generatePassword,
  packageName,
  smsEnabledString,
  twoFAEnabledString,
  wrongPasswordString,
} from "~/utils/constants";
import { logError, logInfo } from "./api/constants/logger";
import axios from "axios";
import { UserRole } from "@prisma/client";
import { smsOTPGenerator } from "~/utils/helpers/sendSms";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      firstName?: string;
      lastName?: string;
      roles?: UserRole[];
      iat?: number;
      jti?: string;
      exp?: number;
      packageName?: (typeof packageName)[];
      otp_enabled?: boolean;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      user && (token = user as any);
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token;
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "something@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        if (credentials) {
          const user = await prisma.credentialsUser.findFirst({
            where: {
              OR: [
                {
                  email: { contains: credentials?.email, mode: "insensitive" },
                },
              ],
            },
          });
          if (!user) {
            logError(
              `FAILURE: Error occurred while retrieving USER EMAIL in LOGIN PAGE, Error: ${JSON.stringify(
                user
              )}`
            );
            return null;
          } else {
            logInfo(
              `SUCCESS: Successfully retrieved USER EMAIL in  LOGIN PAGE response: ${JSON.stringify(
                user
              )}`
            );
          }

          const passwordValidation = await compare(
            credentials?.password as string,
            user.password as string
          );
          if (!passwordValidation) {
            logError(
              `FAILURE: Error occurred while Comparing PASSWORDS in LOGIN PAGE, Error: ${JSON.stringify(
                user
              )}`
            );
            return null;
          } else {
            logInfo(
              `SUCCESS: PASSWORDS MATCHED in  LOGIN PAGE response: ${JSON.stringify(
                user
              )}`
            );
          }
          let tokenValidation;
          let smsValidation;
          logInfo(
            `SUCCESS: 2FA TOKEN in LOGIN PAGE response: ${JSON.stringify(
              req?.body?.token
            )}`
          );
          if (req?.body?.token && req?.body?.type == "smsOptVerification") {
            smsValidation = await validateSmsOtp(req?.body?.token, user?.email);
            logInfo(
              `SUCCESS: SMS validation in  LOGIN PAGE response: ${JSON.stringify(
                smsValidation
              )}`
            );
            if (passwordValidation && smsValidation) {
              logInfo(
                `SUCCESS: Successfully retrieved USER PASSWORD in  LOGIN PAGE response: ${JSON.stringify(
                  passwordValidation
                )}`
              );
              logInfo(
                `SUCCESS: Successfully Validated sms in  LOGIN PAGE response: ${JSON.stringify(
                  smsValidation
                )}`
              );
              return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles,
                packageName: user?.packageName,
                otp_enabled: user?.otp_enabled,
              } as unknown as User;
            } else {
              logError(
                `FAILURE: Error occurred while retrieving USER PASSWORD in LOGIN PAGE, Error: ${JSON.stringify(
                  passwordValidation
                )}`
              );
              return null;
            }
          } else if (req?.body?.token && req?.body?.type == "2FAVerification") {
            tokenValidation = await validateToken(
              user.id,
              req?.body?.token,
              user.otp_base32 as string
            );
            logInfo(
              `SUCCESS: Token validation in  LOGIN PAGE response: ${JSON.stringify(
                tokenValidation
              )}`
            );
            if (passwordValidation && tokenValidation) {
              logInfo(
                `SUCCESS: Successfully retrieved USER PASSWORD in  LOGIN PAGE response: ${JSON.stringify(
                  passwordValidation
                )}`
              );
              logInfo(
                `SUCCESS: Successfully Validateed token in  LOGIN PAGE response: ${JSON.stringify(
                  tokenValidation
                )}`
              );
              return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roles: user.roles,
                packageName: user?.packageName,
                otp_enabled: user?.otp_enabled,
              } as unknown as User;
            } else {
              logError(
                `FAILURE: Error occurred while retrieving USER PASSWORD in LOGIN PAGE, Error: ${JSON.stringify(
                  passwordValidation
                )}`
              );
              return null;
            }
          } else {
            if (passwordValidation) {
              logInfo(
                `SUCCESS: PASSWORD VALIDATION in  LOGIN PAGE response: ${JSON.stringify(
                  passwordValidation
                )} USER IS ENABLED FOR MFA ${JSON.stringify(user.otp_enabled)}`
              );
              if (user.otp_enabled) {
                throw { message: twoFAEnabledString };
              } else {
                logInfo(
                  `SUCCESS: Successfully retrieved USER PASSWORD in  LOGIN PAGE response: ${JSON.stringify(
                    passwordValidation
                  )}`
                );
                return {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  roles: user.roles,
                  packageName: user?.packageName,
                  otp_enabled: user?.otp_enabled,
                } as unknown as User;
              }
            } else {
              throw { message: wrongPasswordString };
            }
          }
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
};

const validateToken = async (id: number, token: string, base32: string) => {
  const request: any = {
    id: id,
    token: token,
    base32: base32,
  };
  logInfo(
    `SUCCESS: REQUEST IN TOKEN VALIDATION in  LOGIN PAGE response: ${JSON.stringify(
      request
    )}`
  );
  const queryString = Object.keys(request)
    .map((key) => `${key}=${encodeURIComponent(request[key])}`)
    .join("&");
  try {
    const tokenValid = await axios({
      method: "post",
      url: `/api/twoFA/validate2fa?${queryString}`,
      baseURL: env.NEXTAUTH_URL,
    });
    if (tokenValid) {
      logInfo(
        `SUCCESS: 2FA token valid in  LOGIN PAGE response: tokenValid?.data?.otp_valid`
      );
      return tokenValid?.data?.otp_valid;
    }
  } catch (err) {
    logError(
      `FAILURE: Error occurred while 2FA TOKEN in LOGIN PAGE, Error: ${JSON.stringify(
        err
      )} `
    );
  }
};

const validateSmsOtp = async (otp: string, user: string) => {
  const request: any = {
    otp: otp,
    user: user,
  };
  logInfo(
    `SUCCESS: REQUEST IN SMS VALIDATION in  LOGIN PAGE response: ${JSON.stringify(
      request
    )}`
  );
  try {
    const tokenValid = await axios.post(`/api/smsOtp/verifyOtp`, request, {
      baseURL: env.NEXTAUTH_URL,
    });

    if (tokenValid) {
      logInfo(
        `SUCCESS: SMS otp valid in  LOGIN PAGE response: tokenValid?.data?.otp_valid`
      );
      return tokenValid?.data?.otp_valid;
    }
  } catch (err) {
    logError(
      `FAILURE: Error occurred while SMS otp in LOGIN PAGE, Error: ${JSON.stringify(
        err
      )} `
    );
  }
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
