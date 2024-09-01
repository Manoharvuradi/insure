import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import { pagination, reportType } from "~/utils/constants";
import { Prisma } from "@prisma/client";
import { handleApiResponseError } from "~/utils/helpers";

export const reportsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          reportType: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: LIST REPORTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const queryOptions: any = {
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
          where: {
            isArchived: false,
            reportType: input?.reportType,
          },
          orderBy: {
            createdAt: "desc",
          },
        };

        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          queryOptions.where = {
            reportType: {
              in: filterArray,
            },
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

        if (input?.sort) {
          const [field, order]: any = input?.sort.split(":");
          queryOptions.orderBy = {
            [field]: order === "desc" ? "desc" : "asc",
          };
        }
        const totalCount = await ctx.prisma.reports.count({
          where: queryOptions.where,
        });
        const response = await ctx.prisma.reports.findMany(queryOptions);
        logError(
          `SUCCESS: Successfully LISTED REPORTS for user: ${
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
          `FAILURE: Error in LIST REPORTS for user: ${
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
      `REQUEST in SHOW REPORTS for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and Request: ${JSON.stringify(input)}`
    );
    try {
      const reports = await ctx.prisma.reports.findFirst({
        where: {
          id: parseInt(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved SHOW Reports for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } ${input} and response: ${JSON.stringify(reports)}`
      );
      return reports;
    } catch (error: any) {
      logError(
        `FAILURE:Error in SHOW Reports for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } ${input} and response: ${JSON.stringify(error)}`
      );
    }
  }),
  create: protectedProcedure
    .input(
      z.object({
        reportType: z.enum(reportType),
        csvData: z.unknown(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      logInfo(
        `REQUEST in CREATE REPORTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const reports = await ctx.prisma.reports.create({
          data: {
            reportType: input.reportType,
            csvData: input.csvData as Prisma.JsonArray,
          },
        });
        logInfo(
          `SUCCESS: Successfully CREATED REPORTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(reports)}`
        );
        return reports;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE REPORTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST in UPDATE REPORTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const updatedReports = await ctx.prisma.reports.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED REPORTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(updatedReports)}`
        );
        return updatedReports;
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE REPORTS for user: ${
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
        `REQUEST: For DELETE REPORTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const deleteCallCenter = await ctx.prisma.reports.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED REPORTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(deleteCallCenter)}`
        );
        return deleteCallCenter;
      } catch (error) {
        logError(
          `FAILURE: Error in DELETE REPORTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
});
