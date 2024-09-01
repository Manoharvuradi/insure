import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "~/server/db";
import { features, filterData, packageNames, role } from "~/utils/constants";
import {
  callCenterPerformance,
  dateConversion,
  handleApiResponseError,
} from "~/utils/helpers";
import { logError, logInfo } from "../constants/logger";
import application from "~/components/application";
import { PackageName } from "@prisma/client";
import { startDate } from "~/utils/constants/policy";

export const dashboardRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          role: z.enum(role).optional(),
          filter: z.string().optional(),
          filterParams: z.string().optional(),
          id: z.number().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: list Access levels for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(input)}`
      );
      try {
        const filters = input?.filterParams?.split(",");
        const filterArray = input?.filter?.split(",");
        let queryOptions: any = {
          where: {
            isArchived: false,
            packageName: {
              in: filterArray as PackageName[],
            },
          },
        };

        let queryOptions2: any = {
          where: {
            isArchived: false,
            packageName: {
              in: filters as PackageName[],
            },
          },
        };

        let totalLeads = 0;

        let user;
        if (input?.startDate && input?.endDate) {
          queryOptions.where.createdAt = {
            gte: new Date(dateConversion(input?.startDate)),
            lte: new Date(dateConversion(input?.endDate)),
          };
        }
        let totalLeadsCount = 0;
        let leadsDraft = 0,
          leadsDeclined = 0,
          leadsInreview = 0,
          leadsAccepted = 0,
          leadsRefused = 0;
        if (input?.id) {
          user = await ctx.prisma.credentialsUser.findFirst({
            where: {
              id: Number(input?.id),
            },
          });
          if (user?.callCenterId) {
            queryOptions.where = {
              ...queryOptions.where,
              createdBy: {
                callCenterId: user?.callCenterId,
              },
            };
          }

          queryOptions.where = {
            ...queryOptions.where,
            createdBy: {
              callCenterId: user?.callCenterId,
            },
          };
          queryOptions2.where = {
            ...queryOptions2.where,
            createdBy: {
              callCenterId: user?.callCenterId,
            },
          };

          totalLeadsCount = await ctx.prisma.leads.count({
            where: {
              ...queryOptions.where,
              isArchived: false,
              packageName: {
                in: filterArray as PackageName[],
              },
            },
          });

          const leadStatuses = [
            "DRAFT",
            "DECLINED",
            "INREVIEW",
            "ACCEPTED",
            "REFUSED",
          ];

          const leadCounts = await ctx.prisma.leads.groupBy({
            by: ["status"],
            _count: {
              _all: true,
            },
            where: {
              status: {
                in: leadStatuses,
              },
              ...queryOptions.where,
            },
          });

          leadsDraft =
            leadCounts.find((count) => count.status === "DRAFT")?._count._all ||
            0;
          leadsDeclined =
            leadCounts.find((count) => count.status === "DECLINED")?._count
              ._all || 0;
          leadsInreview =
            leadCounts.find((count) => count.status === "INREVIEW")?._count
              ._all || 0;
          leadsAccepted =
            leadCounts.find((count) => count.status === "ACCEPTED")?._count
              ._all || 0;
          leadsRefused =
            leadCounts.find((count) => count.status === "REFUSED")?._count
              ._all || 0;
        }

        const [totalApplicationCount1, totalPolicyCount, totalClaimCount] =
          await Promise.all([
            ctx.prisma.application.count(queryOptions),
            ctx.prisma.policy.count(queryOptions),
            ctx.prisma.claim.count(queryOptions),
          ]);

        const applicationStatuses = ["APPROVED", "PENDING", "REJECTED"];

        const applicationCounts = await ctx.prisma.application.groupBy({
          by: ["status"],
          _count: {
            _all: true,
          },
          where: {
            status: {
              in: applicationStatuses,
            },
            ...queryOptions.where,
          },
        });

        const totalApprovedApplicationCount =
          applicationCounts.find((count) => count.status === "APPROVED")?._count
            ._all || 0;
        let totalPendingApplicationCount =
          applicationCounts.find((count) => count.status === "PENDING")?._count
            ._all || 0;
        const totalRejectedApplicationCount =
          applicationCounts.find((count) => count.status === "REJECTED")?._count
            ._all || 0;

        const policyStatuses = ["ACTIVE", "CANCELLED"];

        const policyCounts = await ctx.prisma.policy.groupBy({
          by: ["status"],
          _count: {
            _all: true,
          },
          where: {
            status: {
              in: policyStatuses,
            },
            ...queryOptions.where,
          },
        });

        const totalActivePolicyCount =
          policyCounts.find((count) => count.status === "ACTIVE")?._count
            ._all || 0;
        const totalCancelledPolicyCount =
          policyCounts.find((count) => count.status === "CANCELLED")?._count
            ._all || 0;

        const claimStatuses = [
          "OPEN",
          "CLOSED",
          "ACKNOWLEDGED",
          "FINALIZED",
          "REJECTED",
        ];

        const claimCounts = await ctx.prisma.claim.groupBy({
          by: ["claimStatus"],
          _count: {
            _all: true,
          },
          where: {
            claimStatus: {
              in: claimStatuses,
            },
            ...queryOptions.where,
          },
        });

        const totalOpenClaimCount =
          claimCounts.find((count) => count.claimStatus === "OPEN")?._count
            ._all || 0;
        const totalClosedClaimCount =
          claimCounts.find((count) => count.claimStatus === "CLOSED")?._count
            ._all || 0;
        const totalAckClaimCount =
          claimCounts.find((count) => count.claimStatus === "ACKNOWLEDGED")
            ?._count._all || 0;
        const totalFinalizedClaimCount =
          claimCounts.find((count) => count.claimStatus === "FINALIZED")?._count
            ._all || 0;
        const totalRejectedClaimCount =
          claimCounts.find((count) => count.claimStatus === "REJECTED")?._count
            ._all || 0;

        const [totalApp, totalPolicy, totalClaim] = await Promise.all([
          ctx.prisma.application.count(queryOptions2),
          ctx.prisma.policy.count(queryOptions2),
          ctx.prisma.claim.count(queryOptions2),
        ]);

        let queryOptions3: any = {
          where: {
            isArchived: false,
            packageName: {
              in: filters as PackageName[],
            },
            Leads: {
              is: {
                applicationOnHold: true,
                status: {
                  not: "DECLINED",
                },
              },
            },
          },
          select: {
            Leads: {
              select: {
                applicationOnHold: true,
              },
            },
          },
        };

        const applications = await ctx.prisma.application.findMany(
          queryOptions3
        );
        const totalOnHoldApplicationCount = applications.length;

        totalPendingApplicationCount =
          totalPendingApplicationCount - totalOnHoldApplicationCount;

        const resultedData = {
          totalApplicationCount1,
          totalPolicyCount,
          totalClaimCount,

          totalApprovedApplicationCount,
          totalPendingApplicationCount,
          totalRejectedApplicationCount,
          totalOnHoldApplicationCount,

          totalActivePolicyCount,
          totalCancelledPolicyCount,

          totalOpenClaimCount,
          totalClosedClaimCount,
          totalAckClaimCount,
          totalFinalizedClaimCount,
          totalRejectedClaimCount,

          totalApp,
          totalPolicy,
          totalClaim,

          totalLeads,
          totalLeadsCount,
          leadsDraft,
          leadsDeclined,
          leadsInreview,
          leadsAccepted,
          leadsRefused,
        };
        return resultedData;
      } catch (error: any) {
        logError(
          `FAILURE: Error occured while retrieving LIST APPLICATION data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx?.session?.user?.firstName
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});
