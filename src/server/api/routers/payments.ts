import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import { pagination, paymentStatus, paymentType } from "~/utils/constants";
import { prisma } from "~/server/db";
import { dateConversion, handleApiResponseError } from "~/utils/helpers";
import { policyPayments } from "@prisma/client";
import {
  compareDates,
  getLastDayOfMonth,
  validateMonthYear,
} from "~/utils/constants/payments";

export const paymentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          paymentType: z.enum(paymentType).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for LIST PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const queryOptions: any = {
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
          where: {
            paymentType: input?.paymentType,
          },
          include: {
            policy: {
              include: {
                policyholder: true,
              },
            },
            claim: {
              include: {
                createdBy: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                policies: {
                  include: { policyholder: true },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        };
        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          queryOptions.where = {
            status: {
              in: filterArray,
            },
            paymentType: input.paymentType,
          };
        }
        if (ctx?.req?.query?.packageName) {
          const packageArray: string[] = ctx.req.query.packageName.split(",");
          queryOptions.where = {
            ...queryOptions.where,
            packageName: {
              in: packageArray,
            },
          };
        }
        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              {
                createdBy: {
                  firstName: { contains: input?.search, mode: "insensitive" },
                },
              },
              {
                createdBy: {
                  lastName: { contains: input?.search, mode: "insensitive" },
                },
              },
              {
                policy: {
                  policyholder: {
                    firstName: {
                      contains: input?.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                policy: {
                  policyholder: {
                    lastName: {
                      contains: input?.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                claim: {
                  policies: {
                    policyholder: {
                      firstName: {
                        contains: input?.search,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
              {
                claim: {
                  policies: {
                    policyholder: {
                      lastName: {
                        contains: input?.search,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },

              {
                claim: {
                  claimNumber: {
                    contains: input?.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                policy: {
                  policyNumber: {
                    contains: input?.search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          };
        }

        if (input?.sort) {
          const [field, order]: any = input?.sort.split(":");
          queryOptions.orderBy = {
            [field]: order === "desc" ? "desc" : "asc",
          };
        }

        //  return queryOptions;
        const totalCount = await ctx.prisma.payments.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response = await ctx.prisma.payments.findMany(queryOptions);
        logInfo(
          `SUCCESS: Successfully retrieved LIST PAYMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST PAYMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  create: protectedProcedure
    .input(getPaymentsInputSchema())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for CREATE PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const payments = await prisma.payments.create({
          data: {
            ...input,
            createdById: Number(ctx?.session?.user?.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATED PAYMENT ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(payments)}`
        );
        return payments;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE PAYMENT ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  createMany: protectedProcedure
    .input(z.array(getPaymentsInputSchema()))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for CREATE MANY PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const paymentLogs = await ctx.prisma.payments.createMany({
          data: input,
          skipDuplicates: true,
        });
        if (paymentLogs) {
          const policyPayment: any = [];
          input
            .filter((payment) => payment.createHistory)
            .forEach(async (payment) => {
              policyPayment.push({
                status: "SUCCESSFUL",
                paymentType: "policyPremium",
                billingDate: payment.billingDate,
                amount: payment.amount,
                policyId: String(payment.policyId),
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              });
            });
          const policyPayments = await ctx.prisma.policyPayments.createMany({
            data: policyPayment,
          });
        }
        logError(
          `SUCCESS: Successfully CREATED MANY PAYMENTS ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(paymentLogs)}`
        );
        return paymentLogs;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE MANY PAYMENTS ${
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
      `REQUEST SHOW PAYMENTS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${
        ctx?.session?.user?.firstName
      }, PaymentsId: ${input} Request: ${JSON.stringify(input)}`
    );
    try {
      const response = await ctx.prisma.payments.findFirst({
        where: {
          id: parseInt(input),
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      logError(
        `SUCCESS: Successfully retrieved SHOW PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getPaymentsInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST  UPDATE PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, paymentId:${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const previousPayment = await ctx.prisma.payments.findFirst({
          where: {
            id: input.id,
          },
        });
        if (previousPayment?.status !== "PENDING") {
          const payments = await prisma.payments.update({
            where: {
              id: input.id,
            },
            data: {
              ...input.body,
            },
          });
          logInfo(
            `SUCCESS: Successfully UPDATED PAYMENTS: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }User name: ${ctx?.session?.user?.firstName}, paymentId:${
              input.id
            } and Response: ${JSON.stringify(payments)}`
          );
          return payments;
        } else {
          logError(
            `FAILURE: Error in UPDATE PAYMENTS for user: ${
              ctx?.session?.user?.id
            }, User name: ${ctx?.session?.user?.firstName}, PaymentId:${
              input.id
            } and Error: ${JSON.stringify("Unable to edit")}`
          );
          throw new Error("Unable to edit");
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATE PAYMENTS: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }User name: ${ctx?.session?.user?.firstName}, paymentId:${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for PAYMENTS DELETE for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, paymentId:${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.payments.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED PAYMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, PaymentId: ${
            input.id
          } and Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE PAYMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${ctx?.session?.user?.firstName}, PaymentId: ${
            input.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  reports: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          sort: z.string().optional(),
          paymentType: z.enum(paymentType),
          fromDate: z.string(),
          toDate: z.string(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for Reports PAYMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        if (
          validateMonthYear(input?.fromDate) &&
          validateMonthYear(input?.toDate)
        ) {
          if (compareDates(input?.fromDate, input?.toDate)) {
            const queryOptions: any = {
              take: Number(
                input?.pageSize ? input?.pageSize : pagination.pageSize
              ),
              skip: Number(input?.offset ? input?.offset : pagination.offset),
              where: {
                paymentType: input?.paymentType,
              },
              include: {
                policy: {
                  include: {
                    policyholder: true,
                  },
                },
                claim: {
                  include: {
                    createdBy: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                    policies: {
                      include: { policyholder: true },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            };
            if (input?.fromDate && input?.toDate) {
              const [fromYear, fromMonth] = input.fromDate
                .split("-")
                .map(Number);
              const [toYear, toMonth] = input.toDate.split("-").map(Number);
              const fromDateStartOfMonth = input.fromDate + "-01";
              const toDateEndOfMonth =
                input.toDate + "-" + getLastDayOfMonth(toMonth, toYear);
              queryOptions.where = {
                createdAt: {
                  gte: new Date(dateConversion(fromDateStartOfMonth)),
                  lte: new Date(dateConversion(toDateEndOfMonth)),
                },
              };
            }

            if (ctx?.req?.query?.packageName) {
              const packageArray: string[] =
                ctx.req.query.packageName.split(",");
              queryOptions.where = {
                ...queryOptions.where,
                packageName: {
                  in: packageArray,
                },
              };
            }
            if (input?.sort) {
              const [field, order]: any = input?.sort.split(":");
              queryOptions.orderBy = {
                [field]: order === "desc" ? "desc" : "asc",
              };
            }
            const totalCount = await ctx.prisma.payments.count({
              where: {
                ...queryOptions.where,
              },
            });
            const response = await ctx.prisma.payments.findMany(queryOptions);
            logInfo(
              `SUCCESS: Successfully retrieved Reports PAYMENTS for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${
                ctx?.session?.user?.firstName
              }, and response: ${JSON.stringify(response)}`
            );
            return {
              totalCount,
              currentPageCount: response?.length,
              data: response,
            };
          } else {
            logError(
              `FAILURE: Error in Reports PAYMENTS for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${
                ctx?.session?.user?.firstName
              }, and Error: fromDate should be earlier than toDate.`
            );
            return handleApiResponseError({
              statusCode: 422,
              message: "fromDate should be earlier than toDate.",
            });
          }
        } else {
          logError(
            `FAILURE: Error in Reports PAYMENTS for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${
              ctx?.session?.user?.firstName
            }, and Error: Invalid month-year format`
          );
          return handleApiResponseError({
            statusCode: 422,
            message: "Invalid month-year format.",
          });
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in Reports PAYMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getPaymentsInputSchema() {
  return z.object({
    policyId: z.string().optional(),
    paymentType: z.enum(paymentType),
    createHistory: z.boolean().optional(),
    amount: z.number(),
    balance: z.number(),
    billingDate: z.date(),
    claimId: z.string().optional(),
    status: z.enum(paymentStatus).optional(),
    description: z.string().optional(),
    paymentDate: z.date().optional(),
    finalizedAt: z.date().optional(),
    externalReference: z.string().optional(),
    failureReason: z.string().optional(),
    failureAction: z.string().optional(),
    failureCode: z.string().optional(),
    collectionType: z.string().optional(),
    isArchived: z.boolean().optional(),
  });
}
