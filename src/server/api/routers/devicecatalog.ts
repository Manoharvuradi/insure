import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import { pagination } from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";
import { DeviceCatalog } from "@prisma/client";

const deviceCreateInputs = [
  "deviceType",
  "brand",
  "modelName",
  "colour",
] as const;

export const deviceCatalogRouter = createTRPCRouter({
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
        `Request in LIST DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        if (input?.filter === "true") {
          const deviceCatalogData = await ctx.prisma.deviceCatalog.findMany();

          const formattedData: any = {};

          deviceCatalogData.forEach((entry: DeviceCatalog) => {
            const { deviceType, brand, modelName, colour } = entry;

            if (!formattedData[deviceType]) {
              formattedData[deviceType] = {};
            }

            if (!formattedData[deviceType][brand]) {
              formattedData[deviceType][brand] = [];
            }

            formattedData[deviceType][brand].push({ modelName, colour });
          });

          return { data: formattedData };
        } else {
          const queryOptions: any = {
            take: Number(
              input?.pageSize ? input?.pageSize : pagination.pageSize
            ),
            skip: Number(input?.offset ? input?.offset : pagination.offset),
          };

          if (input?.search) {
            queryOptions.where = {
              ...queryOptions.where,
              OR: [
                {
                  deviceType: { contains: input?.search, mode: "insensitive" },
                },
                { brand: { contains: input?.search, mode: "insensitive" } },
                { modelName: { contains: input?.search, mode: "insensitive" } },
                { colour: { contains: input?.search, mode: "insensitive" } },
              ],
            };
          }
          const totalCount = await ctx.prisma.deviceCatalog.count({
            where: {
              ...queryOptions.where,
            },
          });
          const response = await ctx?.prisma.deviceCatalog.findMany(
            queryOptions
          );
          logInfo(
            `SUCCESS: Successfully LISTED DEVICE CATALOG: ${
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
        }
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST DEVICE CATALOG: ${
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
      const user = await ctx.prisma.deviceCatalog.findFirst({
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
          deviceType: z.string(),
          brand: z.string(),
          modelName: z.string(),
          colour: z.string(),
        })
      )
    )
    .mutation(async ({ input, ctx }: any) => {
      logInfo(
        `Request in CREATE DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const deviceCatalogCount = await ctx.prisma.deviceCatalog.createMany({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully in CREATE DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(deviceCatalogCount)}`
        );
        return {
          message: `Succesfully uploaded ${deviceCatalogCount.count} devices`,
        };
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(error)}`
        );
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        deviceType: z.string(),
        brand: z.string(),
        modelName: z.string(),
        colour: z.string(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      logInfo(
        `Request in CREATE DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const DeviceCreated = await ctx.prisma.deviceCatalog.create({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully CREATED DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(DeviceCreated)}`
        );
        return DeviceCreated;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: z.object({
          deviceType: z.string(),
          brand: z.string(),
          modelName: z.string(),
          colour: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: UPDATE DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const updatedDeviceCatalogData = await ctx.prisma.deviceCatalog.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.body,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(updatedDeviceCatalogData)}`
        );
        return updatedDeviceCatalogData;
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE DEVICE CATALOG for user: ${
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
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `Request in DELETE DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const deleteDeviceCatalogData = await ctx.prisma.deviceCatalog.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(deleteDeviceCatalogData)}`
        );
        return deleteDeviceCatalogData;
      } catch (error) {
        logError(
          `FAILURE: Error in DELETE DEVICE CATALOG for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  deleteAll: protectedProcedure.mutation(async ({ ctx, input }) => {
    logInfo(
      `REQUEST in DELETE ALL DEVICE CATALOG for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and Request: ${JSON.stringify(input)}`
    );
    try {
      const deleteAllDeviceCatalogData =
        await ctx.prisma.deviceCatalog.deleteMany();
      logError(
        `SUCCESS: Successfully in DELETE ALL DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(deleteAllDeviceCatalogData)}`
      );
      return deleteAllDeviceCatalogData;
    } catch (error) {
      logError(
        `FAILURE: Error in DELETE ALL DEVICE CATALOG for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
});
