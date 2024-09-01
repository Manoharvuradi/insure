import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import bcrypt, { compare } from "bcrypt";
import { sendEmail } from "~/utils/helpers/sendEmail";
import {
  agentRoleType,
  exclude,
  generatePassword,
  packageName,
  role,
} from "~/utils/constants";
import { prisma } from "~/server/db";
import { logError, logInfo } from "../constants/logger";
import { handleApiResponseError, listSearchParams } from "~/utils/helpers";
import { searchListInputSchema } from "~/utils/helpers/zodValidation";
import { ISearchKeys } from "~/interfaces/common";
import validator from "validator";
import { AgentRoleType } from "@prisma/client";

export const credentialUserRouter = createTRPCRouter({
  list: protectedProcedure
    .input(searchListInputSchema())
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for LIST USERS, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const searchParams: ISearchKeys = {
          filter: "roles",
          search: ["firstName", "lastName", "email"],
        };
        const queryOptions: any = listSearchParams(input, searchParams);
        const totalCount = await ctx.prisma.credentialsUser.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.credentialsUser.findMany(
          queryOptions
        );
        response.forEach((user: any) => {
          delete user.password;
        });
        logInfo(
          `SUCCESS: LIST USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(response)}`
        );
        let isArchived;
        if (input.email) {
          isArchived = await ctx.prisma.credentialsUser.findFirst({
            where: {
              email: input.email,
            },
            select: {
              id: true,
              isArchived: true,
            },
          });
        }
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
          isArchived,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email(),
        password: z.string().optional(),
        roles: z.array(z.enum(role)).optional(),
        phone: z.string().refine(validator.isMobilePhone).optional(),
        packageName: z.array(z.enum(packageName)).optional(),
        callCenterId: z.number().optional(),
        reportsTo: z
          .array(
            z.object({
              id: z.number(),
              fullname: z.string().optional(),
            })
          )
          .optional(),
        agentRoleType: z.enum(agentRoleType).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      logInfo(
        `SUCCESS: REQUEST for CREDENTIAL USER create for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      try {
        const autoPassword = !input.password
          ? generatePassword(6)
          : input.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPasswords = await bcrypt.hash(autoPassword, salt);
        const user = await ctx.prisma.credentialsUser.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            password: hashedPasswords,
            roles: input.roles,
            phone: input.phone,
            packageName: input.packageName,
            callCenterId: input.callCenterId,
            ...(input.reportsTo && {
              reportsTo: {
                connect: input.reportsTo?.map((report) => {
                  return { id: Number(report.id) };
                }),
              },
            }),
            ...(input?.agentRoleType && {
              agentRoletype: input?.agentRoleType,
            }),
          },
        });
        sendEmail(input.email, autoPassword, "signUp");
        const userResponse = exclude(user, ["password"]);
        return userResponse;
      } catch (error: any) {
        logError(
          `FAILURE: Error in CREATE USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    logInfo(
      `SUCCESS: REQUEST for CREATE USER for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, Request: ${JSON.stringify(
        input
      )}`
    );
    try {
      const user = await ctx.prisma.credentialsUser.findFirst({
        where: {
          id: parseInt(input),
        },
        include: {
          callCenter: true,
          reportingUsers: true,
          reportsTo: true,
        },
      });
      const userWithOutPassword = exclude(user, ["password"]);
      return userWithOutPassword;
    } catch (error: any) {
      logError(
        `FAILURE: Error in CREATE USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        } and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        password: z.string().optional(),
        roles: z.array(z.enum(role)).optional(),
        phone: z.string().refine(validator.isMobilePhone).optional(),
        callCenterId: z.number().optional(),
        packageName: z.array(z.enum(packageName)).optional(),
        agentRoleType: z.enum(agentRoleType).optional(),
        reportingUsers: z
          .array(
            z.object({
              id: z.number().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST for UPDATE CREDENTIAL USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, userId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const inputIds = input?.reportingUsers.map((user: any) => {
          return user?.id;
        });
        const reportingUsers = input?.reportingUsers;
        const agentRoleType = input?.agentRoleType;
        delete input?.reportingUsers;
        delete input?.agentRoleType;
        const currentUser = await prisma.credentialsUser.findFirst({
          where: {
            id: input?.id,
          },
          include: {
            reportingUsers: true,
            reportsTo: true,
          },
        });
        const disconnectUser = currentUser?.reportingUsers.filter(
          (user) => !inputIds.includes(user.id)
        );

        const updatedUser = await prisma.credentialsUser.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
            ...(agentRoleType && { agentRoletype: agentRoleType }),
            ...(reportingUsers && {
              reportingUsers: {
                ...(disconnectUser &&
                  disconnectUser.length > 0 && {
                    disconnect: disconnectUser?.map((users: any) => {
                      return { id: Number(users?.id) };
                    }),
                  }),
                connect: reportingUsers?.map((users: any) => {
                  return { id: Number(users?.id) };
                }),
              },
            }),
          },
        });
        return updatedUser;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, and userId: ${
            input.id
          } Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  archive: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST ARCHIVE USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${ctx?.session?.user?.firstName}, userId: ${
          input.id
        }  Request: ${JSON.stringify(input)}`
      );
      try {
        const user = await prisma.credentialsUser.update({
          where: {
            id: Number(input.id),
          },
          data: {
            isArchived: true,
          },
        });
        return user;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, userId:${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST DELETE USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${ctx?.session?.user?.firstName}, userId: ${
          input.id
        }  Request: ${JSON.stringify(input)}`
      );
      try {
        const user = await prisma.credentialsUser.delete({
          where: {
            id: Number(input.id),
          },
        });
        return user;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, userId:${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST for CREDENTIAL USER forgotPassword for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      try {
        const user = await prisma.credentialsUser.findFirst({
          where: {
            email: input.email,
          },
        });
        if (user) {
          const password = generatePassword(6);
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          const updatePassword = await ctx.prisma.credentialsUser.update({
            where: {
              id: user.id,
            },
            data: {
              password: hashedPassword,
            },
          });
          sendEmail(user?.email as string, password, "forgotPassword");
          return user;
        } else {
          logError(
            `FAILURE: Error finding user in FORGOT PASSWORD findFirst user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            },User name: ${
              ctx?.session?.user?.firstName
            }, and Error: ${JSON.stringify(user)}`
          );
          return handleApiResponseError(user);
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in FORGOT PASSWORD findFirst user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  resetPassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `SUCCESS: REQUEST for CREDENTIAL USER resetPassword for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      const user = await ctx.prisma.credentialsUser.findUnique({
        where: { id: Number(ctx.session.user?.id) },
      });
      if (!user) {
        return null;
      }

      const passwordValidation = await compare(
        input.oldPassword as string,
        user?.password as string
      );
      if (!passwordValidation) {
        return null;
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPasswords = await bcrypt.hash(input.newPassword, salt);

        const updatedUser = ctx.prisma.credentialsUser.update({
          where: {
            id: Number(ctx?.session?.user?.id),
          },
          data: {
            password: hashedPasswords,
          },
        });
        return updatedUser;
      }
    }),

  clearUserOtp: protectedProcedure.query(async ({ ctx }: any) => {
    logInfo(`REQUEST for LIST USERS, for user:`);
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayDateString = yesterday.toISOString().split("T")[0];
      const startOfToday = yesterdayDateString + "T00:00:00.000Z"; // Start of today
      const endOfToday = yesterdayDateString + "T23:59:59.999Z"; // End of today
      const user = await ctx.prisma.smsVerfication.deleteMany({
        where: {
          AND: [
            { createdAt: { gte: startOfToday } },
            { createdAt: { lte: endOfToday } },
          ],
        },
      });
      logInfo(
        `SUCCESS: LIST USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, and Response: ${JSON.stringify(user)}`
      );
      return user;
    } catch (error: any) {
      logError(
        `FAILURE: Error in DELETE USER for user and Error: ${JSON.stringify(
          error
        )}`
      );
      return handleApiResponseError(error);
    }
  }),

  unArchive: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST ARCHIVE USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${ctx?.session?.user?.firstName}, userId: ${
          input.id
        }  Request: ${JSON.stringify(input)}`
      );
      try {
        const user = await prisma.credentialsUser.update({
          where: {
            id: Number(input.id),
          },
          data: {
            isArchived: false,
          },
        });
        return user;
      } catch (error: any) {
        logError(
          `FAILURE: Error in ARCHIVE USER for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${ctx?.session?.user?.firstName}, userId:${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});
