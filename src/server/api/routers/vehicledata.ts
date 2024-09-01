import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import { pagination } from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";

export const vehicleDataRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        `Request in LIST VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const queryOptions: any = {
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),

          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
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
          };
        }
        const totalCount = await ctx.prisma.vehicleData.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response: any = await ctx?.prisma.vehicleData.findMany(
          queryOptions
        );
        logInfo(
          `SUCCESS: Successfully LISTED VEHICLE DATA: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST VEHICLE DATA: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    logInfo(
      `REQUEST for CREATE USER for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, Request: ${JSON.stringify(
        input
      )}`
    );
    try {
      const user = await ctx.prisma.vehicleData.findFirst({
        where: {
          id: input,
        },
      });
      logInfo(
        `SUCCESS: Successfully in CREATE USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        } and Response: ${JSON.stringify(user)}`
      );
      return user;
    } catch (error: any) {
      logError(
        `FAILURE: Error in CREATE USER for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        } and Error: ${JSON.stringify(error)}`
      );
      return error;
    }
  }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          AreaOffice: z.string().optional(),
          EngineNumber: z.string().optional(),
          Make: z.string().optional(),
          MarketValue: z.string().optional(),
          MMNumber: z.string().optional(),
          Model: z.string().optional(),
          RecordId: z.string().optional(),
          RegistrationNumber: z.string().optional(),
          RetailPrice: z.string().optional(),
          TradePrice: z.string().optional(),
          TransactionNumber: z.string().optional(),
          VehicleRef: z.string().optional(),
          VINNumber: z.string().optional(),
          WRTYEnd: z.string().optional(),
          WRTYStart: z.string().optional(),
          YearModel: z.string().optional(),
          VehicleNumber: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input, ctx }: any) => {
      logInfo(
        `Request in CREATE VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const vehicleDataRes = await ctx.prisma.vehicleData.createMany({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully in CREATE VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(vehicleDataRes)}`
        );
        return vehicleDataRes;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(error)}`
        );
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        AreaOffice: z.string().optional(),
        EngineNumber: z.string().optional(),
        Make: z.string().optional(),
        MarketValue: z.string().optional(),
        MMNumber: z.string().optional(),
        Model: z.string().optional(),
        RecordId: z.string().optional(),
        RegistrationNumber: z.string().optional(),
        RetailPrice: z.string().optional(),
        TradePrice: z.string().optional(),
        TransactionNumber: z.string().optional(),
        VehicleRef: z.string().optional(),
        VINNumber: z.string().optional(),
        WRTYEnd: z.string().optional(),
        WRTYStart: z.string().optional(),
        YearModel: z.string().optional(),
        VehicleNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      logInfo(
        `Request in CREATE VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const vehicleDataRes = await ctx.prisma.vehicleData.create({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully CREATED VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(vehicleDataRes)}`
        );
        return vehicleDataRes;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        AreaOffice: z.string().optional(),
        EngineNumber: z.string().optional(),
        Make: z.string().optional(),
        MarketValue: z.string().optional(),
        MMNumber: z.string().optional(),
        Model: z.string().optional(),
        RecordId: z.string().optional(),
        RegistrationNumber: z.string().optional(),
        RetailPrice: z.string().optional(),
        TradePrice: z.string().optional(),
        TransactionNumber: z.string().optional(),
        VehicleRef: z.string().optional(),
        VINNumber: z.string().optional(),
        WRTYEnd: z.string().optional(),
        WRTYStart: z.string().optional(),
        YearModel: z.string().optional(),
        VehicleNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: UPDATE VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const updatedvehicleData = await ctx.prisma.vehicleData.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(updatedvehicleData)}`
        );
        return updatedvehicleData;
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `Request in DELETE VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const deletevehicleData = await ctx.prisma.vehicleData.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(deletevehicleData)}`
        );
        return deletevehicleData;
      } catch (error) {
        logError(
          `FAILURE: Error in DELETE VEHICLE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx, input }) => {
    logInfo(
      `REQUEST in DELETE ALL VEHICLE DATA for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and Request: ${JSON.stringify(input)}`
    );
    try {
      const deleteAllvehicleData = await ctx.prisma.vehicleData.deleteMany();
      logError(
        `SUCCESS: Successfully in DELETE ALL VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(deleteAllvehicleData)}`
      );
      return deleteAllvehicleData;
    } catch (error) {
      logError(
        `FAILURE: Error in DELETE ALL VEHICLE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
});
