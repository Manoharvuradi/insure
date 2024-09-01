import { z } from "zod";
import { logError, logInfo } from "../../constants/logger";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import {
  coverageOptions,
  employeeFuneralAges,
  packageNames,
  pagination,
  premiumFrequency,
  relation,
  telkomFreeBenefit,
} from "~/utils/constants";
import { premiumCalculations } from "~/utils/constants/calculations";
import {
  addMainPremiums,
  findLimit,
  freeBenefitPremiumCalculation,
  getRuleForGivenDate,
  handleApiResponseError,
} from "~/utils/helpers";
import { PackageName } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const quotationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        pageSize: z.string().optional(),
        offset: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for LSIT QUOTATION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const totalCount = await ctx.prisma.quotation.count();
        const response = await ctx.prisma.quotation.findMany({
          where: {
            isArchived: false,
          },
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
        });
        logInfo(
          `SUCCESS: Successfully retrieved in LIST QUOTATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error in LIST QUOTATION for user: ${
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
      `REQUEST for SHOW QUOTE for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, Request: ${JSON.stringify(
        input
      )}`
    );
    try {
      const response = await ctx.prisma.quotation.findFirst({
        where: {
          id: input,
        },
      });
      if (response) {
        logError(
          `SUCCESS: Successfully retrieved SHOW QUOTAION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(response)}`
        );
        return response;
      }
      return handleApiResponseError(response);
    } catch (error: any) {
      logError(
        `FAILURE: Error in SHOW QUOTAION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, and Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  create: protectedProcedure
    .input(getQuotationInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for CREATE QUOTE, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        }, Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await ctx?.prisma?.package.findFirst({
          where: {
            packageName: packageNames?.funeral as PackageName,
          },
          include: {
            packageRules: {
              include: {
                ruleLimits: true,
              },
            },
          },
        });
        const matchedRule = getRuleForGivenDate(
          input?.startDate ?? Date.now(),
          response?.packageRules
        );
        const matchedLimit = findLimit(matchedRule?.ruleLimits, 1000);
        if (!matchedRule || !matchedLimit) {
          logError(
            `FAILURE: Error occured while getting Package rules for: ${
              input.body.applicationData.packageName
            } user: ${ctx?.session?.user?.id && ctx?.session?.user?.id} `
          );
          throw new TRPCError({
            message: `Package Rule does not exists`,
            code: "BAD_REQUEST",
            cause: 400,
          });
        }
        const coverPremiumPercentage = matchedLimit?.aditionalCoverPercentage;
        const { options, policyData } = input;
        // let childrenPremiumAmount = 0;
        let extendedFamilyPremiumAmount = 0;
        // let spousePremiumAmount = 0;
        delete input?.startDate;
        let data: any = { ...input };
        try {
          const premiumData = await premiumCalculations(data, ctx);
          let mainMemberPremiumAmount = 0;
          if (!input.policyData.withFreeBenefit) {
            mainMemberPremiumAmount =
              premiumData?.mainPremium?.mainMember?.coverageAmount;
          }

          if (
            options !== telkomFreeBenefit &&
            input.policyData.withFreeBenefit
          ) {
            mainMemberPremiumAmount =
              premiumData?.mainPremium?.mainMember?.coverageAmount;
            const optionCPremiumData = await freeBenefitPremiumCalculation(ctx);

            const combinedMainPremium = addMainPremiums(
              premiumData?.mainPremium,
              optionCPremiumData
            );
            premiumData.mainPremium = combinedMainPremium;
          }

          if (
            options == telkomFreeBenefit &&
            !input.policyData.withFreeBenefit
          ) {
            throw new Error(
              "Cannot choose second policy with telkom free benefit"
            );
          }

          const members = policyData?.members || {};
          const extendedFamilyMembers = members.extendedFamily || {};
          const childrenMembers = members.children || {};
          const spouseMember = members.spouse || {};
          let extendedFamily;
          const hasExtendedFamilyAge =
            extendedFamilyMembers?.length > 0 &&
            extendedFamilyMembers.every(
              (obj: any) =>
                obj.hasOwnProperty("age") && obj.hasOwnProperty("options")
            );
          if (hasExtendedFamilyAge) {
            if (premiumData && premiumData?.extendedPremium) {
              const hasExtendedFamily = Object.values(extendedFamilyMembers)
                .filter(
                  (familyMember: any) =>
                    familyMember.age && familyMember.options
                )
                .map((familyMember: any) => ({
                  age: familyMember.age,
                  options: familyMember.options,
                }));

              extendedFamily =
                hasExtendedFamily?.length > 0
                  ? hasExtendedFamily.map((family: any) => {
                      const matchingPremium =
                        premiumData?.extendedPremium?.find(
                          (premium: any) => premium.options === family.options
                        );
                      if (matchingPremium) {
                        const matchingFamily =
                          matchingPremium?.extendedFamily?.find(
                            (f: any) =>
                              f.minAge <= family.age && f.maxAge >= family.age
                          );
                        if (matchingFamily) {
                          extendedFamilyPremiumAmount +=
                            matchingFamily.premiumAmount;
                          return {
                            options: family.options,
                            age: family.age,
                            accidentalDeathAmount:
                              matchingFamily?.coverageAmount,
                            naturalDeathAmount: matchingFamily?.coverageAmount,
                            premiumAmount: matchingFamily?.premiumAmount,
                          };
                        }
                      }
                      logError(
                        `FAILURE: Error in CREATE QUOTAION for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        }, User name: ${
                          ctx?.session?.user?.firstName
                        }, and Error: ${
                          "Record to doesn't match with extended family " +
                          JSON.stringify(matchingPremium)
                        }`
                      );
                      return handleApiResponseError({
                        inputError:
                          "Record to doesn't match with extended family",
                      });
                    })
                  : undefined;
            } else {
              logError(
                `FAILURE: Error in CREATE QUOTAION for user: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                }, User name: ${ctx?.session?.user?.firstName}, and Error: ${
                  "Record to get extended family premium data does not exist. " +
                  JSON.stringify(premiumData)
                }`
              );
              return handleApiResponseError({
                inputError:
                  "Record to get extended family premium data does not exist.",
              });
            }
          }

          if (premiumData && premiumData?.mainPremium) {
            const { mainMember, spouse, children } = premiumData.mainPremium;
            const hasChildren = Object.values(childrenMembers)
              .filter((child: any) => child.age >= 0)
              .map((child: any) => ({
                age: child.age,
                isStudying: child.isStudying,
                isDisabled: child.isDisabled,
                isStillBorn: child.isStillBorn,
              }));
            const childrenData =
              hasChildren?.length > 0
                ? hasChildren.map((child: any) => {
                    let matchingPlan = null;
                    if (child.isDisabled) {
                      matchingPlan = children?.find(
                        (plan: any) =>
                          plan.minAge <= child.age &&
                          plan.maxAge >= child.age &&
                          plan.isDisabled === child.isDisabled
                      );
                    } else if (child.isStillBorn) {
                      matchingPlan = children?.find(
                        (plan: any) =>
                          plan.minAge == child.age &&
                          plan.isStillBorn === child.isStillBorn
                      );
                    } else {
                      matchingPlan = children?.find(
                        (plan: any) =>
                          plan.minAge <= child.age &&
                          plan.maxAge >= child.age &&
                          plan.isStudying === child.isStudying
                      );
                    }
                    if (matchingPlan) {
                      // childrenPremiumAmount += matchingPlan?.premiumAmount;
                      return {
                        age: child.age,
                        accidentalDeathAmount: matchingPlan?.coverageAmount,
                        naturalDeathAmount: matchingPlan?.coverageAmount,
                        telkomFreeBenefitAmount: input.policyData
                          .withFreeBenefit
                          ? matchingPlan?.freeCoverageAmount ??
                            matchingPlan?.coverageAmount
                          : 0,
                        // premiumAmount: matchingPlan?.premiumAmount,
                        isStudying: child?.isStudying,
                        isDisabled: child?.isDisabled,
                        isStillBorn: child?.isStillBorn,
                      };
                    } else {
                      return null;
                    }
                  })
                : undefined;
            const mainMemberData = {
              naturalDeathAmount: mainMember.coverageAmount,
              accidentalDeathAmount: mainMember.coverageAmount,
              telkomFreeBenefitAmount: input.policyData.withFreeBenefit
                ? mainMember?.freeCoverageAmount ?? mainMember?.coverageAmount
                : 0,
              // premiumAmount: mainMember.premiumAmount,
            };

            const spouseData =
              spouseMember && Array.isArray(spouseMember) && spouse
                ? spouseMember.map((inputSpouse) => {
                    // spousePremiumAmount +=
                    //   inputSpouse.age > 0 && spouse ? spouse.premiumAmount : 0;
                    return inputSpouse.age > 0 && spouse
                      ? {
                          ...inputSpouse,
                          naturalDeathAmount: spouse.coverageAmount,
                          accidentalDeathAmount: spouse.coverageAmount,
                          telkomFreeBenefitAmount: input.policyData
                            .withFreeBenefit
                            ? spouse?.freeCoverageAmount ??
                              spouse?.coverageAmount
                            : 0,
                          // premiumAmount: spouse.premiumAmount,
                        }
                      : {};
                  })
                : undefined;

            const extendedFamilyData = extendedFamily
              ? {
                  extendedFamily: [...extendedFamily],
                }
              : {};
            const membersData = {
              ...members,
              mainMember: {
                ...members.mainMember,
                ...mainMemberData,
              },
              ...(childrenData && { children: [...childrenData] }),
              ...(spouseData && { spouse: [...spouseData] }),
              ...extendedFamilyData,
            };

            const mainMemberPremiumCost =
              Math.floor(
                mainMemberPremiumAmount * coverPremiumPercentage * 100
              ) / 100;
            const extendedFamilyPremiumCost = Number(
              extendedFamilyPremiumAmount.toFixed(2)
            );
            const totalPremiumCost = parseFloat(
              (mainMemberPremiumCost + extendedFamilyPremiumAmount).toFixed(2)
            );
            data = {
              ...data,
              policyData: {
                ...data?.policyData,
                members: {
                  ...membersData,
                  mainMemberPremium: mainMemberPremiumCost,
                  additionalPremium: extendedFamilyPremiumCost,
                  totalPremium: totalPremiumCost,
                },
              },
            };
          } else {
            logError(
              `FAILURE: Error in CREATE QUOTAION for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${ctx?.session?.user?.firstName}, and Error: ${
                "Record to get premium data does not exist " +
                JSON.stringify(premiumData)
              }`
            );
            return handleApiResponseError({
              inputError: "Record to get premium data does not exist.",
            });
          }
          try {
            const newQuotation = await prisma.quotation.create({
              data: {
                ...data,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              },
            });
            logInfo(
              `SUCCESS: Successfully CREATED QUOTAION For FUNERAL, for userId: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${
                ctx?.session?.user?.firstName
              }, and Response: ${JSON.stringify(newQuotation)}`
            );
            return newQuotation;
          } catch (error) {
            logError(
              `FAILURE: Error in CREATE QUOTAION for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${
                ctx?.session?.user?.firstName
              }, and Error: ${JSON.stringify(error)}`
            );
            return handleApiResponseError(error);
          }
        } catch (error) {
          logError(
            `FAILURE: Error in CREATE QUOTAION for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            }, User name: ${
              ctx?.session?.user?.firstName
            }, and Error: ${JSON.stringify(error)}`
          );
          return handleApiResponseError(error);
        }
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE QUOTAION for user: ${
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
        body: getQuotationInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for QUOTE UPDATE for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id:${input.id} Request: ${JSON.stringify(input)}`
      );
      const { options, policyData } = input.body;
      // let childrenPremiumAmount = 0;
      let extendedFamilyPremiumAmount = 0;
      // let spousePremiumAmount = 0;

      let data: any = { ...input.body };
      try {
        const response = await ctx?.prisma?.package.findFirst({
          where: {
            packageName: packageNames?.funeral as PackageName,
          },
          include: {
            packageRules: {
              include: {
                ruleLimits: true,
              },
            },
          },
        });
        const matchedRule = getRuleForGivenDate(
          Date.now(),
          response?.packageRules
        );
        const matchedLimit = findLimit(matchedRule?.ruleLimits, 1000);
        if (!matchedRule || !matchedLimit) {
          logError(
            `FAILURE: Error occured while getting Package rules for: ${
              input.body.applicationData.packageName
            } user: ${ctx?.session?.user?.id && ctx?.session?.user?.id} `
          );
          throw new TRPCError({
            message: `Package Rule does not exists`,
            code: "BAD_REQUEST",
            cause: 400,
          });
        }
        const coverPremiumPercentage = matchedLimit?.aditionalCoverPercentage;
        try {
          const premiumData = await premiumCalculations(data, ctx);
          let mainMemberPremiumAmount = 0;
          if (options !== telkomFreeBenefit) {
            mainMemberPremiumAmount =
              premiumData?.mainPremium?.mainMember?.coverageAmount;
            const optionCPremiumData = await freeBenefitPremiumCalculation(ctx);
            const combinedMainPremium = addMainPremiums(
              premiumData?.mainPremium,
              optionCPremiumData
            );
            premiumData.mainPremium = combinedMainPremium;
          }
          const members = policyData?.members || {};
          const extendedFamilyMembers = members.extendedFamily || {};
          const childrenMembers = members.children || {};
          const spouseMember = members.spouse || {};
          let extendedFamily;
          const hasExtendedFamilyAge =
            extendedFamilyMembers?.length > 0 &&
            extendedFamilyMembers.every((obj: any) =>
              obj.hasOwnProperty("age")
            );
          if (hasExtendedFamilyAge) {
            if (premiumData && premiumData?.extendedPremium) {
              const hasExtendedFamily = Object.values(extendedFamilyMembers)
                .filter(
                  (familyMember: any) =>
                    familyMember.age && familyMember.options
                )
                .map((familyMember: any) => ({
                  age: familyMember.age,
                  options: familyMember.options,
                }));

              extendedFamily =
                hasExtendedFamily?.length > 0
                  ? hasExtendedFamily.map((family: any) => {
                      const matchingPremium =
                        premiumData?.extendedPremium?.find(
                          (premium: any) => premium.options === family.options
                        );
                      if (matchingPremium) {
                        const matchingFamily =
                          matchingPremium?.extendedFamily?.find(
                            (f: any) =>
                              f.minAge <= family.age && f.maxAge >= family.age
                          );
                        if (matchingFamily) {
                          extendedFamilyPremiumAmount +=
                            matchingFamily.premiumAmount;
                          return {
                            options: family.options,
                            age: family.age,
                            accidentalDeathAmount:
                              matchingFamily?.coverageAmount,
                            naturalDeathAmount: matchingFamily?.coverageAmount,
                            premiumAmount: matchingFamily?.premiumAmount,
                          };
                        }
                      }
                      logError(
                        `FAILURE: Error in UPDATE QUOTE for user: ${
                          ctx?.session?.user?.id && ctx?.session?.user?.id
                        }, User name: ${ctx?.session?.user?.firstName}, id:${
                          input.id
                        } and Error: ${
                          "Record to doesn't match with extended family " +
                          JSON.stringify(matchingPremium)
                        }`
                      );
                      return handleApiResponseError({
                        inputError:
                          "Record to doesn't match with extended family",
                      });
                    })
                  : undefined;
            } else {
              logError(
                `FAILURE: Error in UPDATE QUOTE for user: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                }, User name: ${ctx?.session?.user?.firstName},id:${
                  input.id
                } and Error: ${
                  "Failed to get extended premium data. " +
                  JSON.stringify(premiumData)
                }`
              );
              return handleApiResponseError(
                "Failed to get extended premium data."
              );
            }
          }
          if (premiumData && premiumData?.mainPremium) {
            const { mainMember, spouse, children } = premiumData.mainPremium;
            const hasChildren = Object.values(childrenMembers)
              .filter((child: any) => child.age)
              .map((child: any) => ({
                age: child.age,
                isStudying: child.isStudying,
                isDisabled: child.isDisabled,
              }));

            const childrenData =
              hasChildren?.length > 0
                ? hasChildren.map((child: any) => {
                    let matchingPlan = null;
                    if (child.isDisabled) {
                      matchingPlan = children?.find(
                        (plan: any) =>
                          plan.minAge <= child.age &&
                          plan.maxAge >= child.age &&
                          plan.isDisabled === child.isDisabled
                      );
                    } else if (child.isStillBorn) {
                      matchingPlan = children?.find(
                        (plan: any) =>
                          plan.minAge == child.age &&
                          plan.isStillBorn === child.isStillBorn
                      );
                    } else {
                      matchingPlan = children?.find(
                        (plan: any) =>
                          plan.minAge <= child.age &&
                          plan.maxAge >= child.age &&
                          plan.isStudying === child.isStudying
                      );
                    }
                    if (matchingPlan) {
                      // childrenPremiumAmount += matchingPlan?.premiumAmount;
                      return {
                        age: child.age,
                        accidentalDeathAmount: matchingPlan?.coverageAmount,
                        naturalDeathAmount: matchingPlan?.coverageAmount,
                        telkomFreeBenefitAmount:
                          matchingPlan?.freeCoverageAmount ??
                          matchingPlan?.coverageAmount,
                        // premiumAmount: matchingPlan?.premiumAmount,
                        isStudying: child?.isStudying,
                        isDisabled: child?.isDisabled,
                        isStillBorn: child?.isStillBorn,
                      };
                    } else {
                      return null;
                    }
                  })
                : undefined;

            const mainMemberData = {
              naturalDeathAmount: mainMember.coverageAmount,
              accidentalDeathAmount: mainMember.coverageAmount,
              telkomFreeBenefitAmount:
                mainMember?.freeCoverageAmount ?? mainMember?.coverageAmount,
              // premiumAmount: mainMember.premiumAmount,
            };
            const spouseData =
              spouseMember && Array.isArray(spouseMember) && spouse
                ? spouseMember.map((inputSpouse) => {
                    // spousePremiumAmount +=
                    //   inputSpouse.age > 0 && spouse ? spouse.premiumAmount : 0;
                    return inputSpouse.age > 0 && spouse
                      ? {
                          ...inputSpouse,
                          naturalDeathAmount: spouse.coverageAmount,
                          accidentalDeathAmount: spouse.coverageAmount,
                          telkomFreeBenefitAmount:
                            spouse?.freeCoverageAmount ??
                            spouse?.coverageAmount,
                          // premiumAmount: spouse.premiumAmount,
                        }
                      : {};
                  })
                : undefined;

            const extendedFamilyData = extendedFamily
              ? {
                  extendedFamily: [...extendedFamily],
                }
              : {};

            const membersData = {
              ...members,
              mainMember: {
                ...members.mainMember,
                ...mainMemberData,
              },
              ...(childrenData && { children: [...childrenData] }),
              ...(spouseData && { spouse: [...spouseData] }),
              ...extendedFamilyData,
            };

            // spousePremiumAmount =
            //   spouseMember.age > 0 && spouse ? spouse.premiumAmount : 0;

            const mainMemberPremiumCost =
              Math.floor(
                mainMemberPremiumAmount * coverPremiumPercentage * 100
              ) / 100;
            const extendedFamilyPremiumCost = Number(
              extendedFamilyPremiumAmount.toFixed(2)
            );
            const totalPremiumCost = parseFloat(
              (mainMemberPremiumCost + extendedFamilyPremiumAmount).toFixed(2)
            );
            data = {
              ...data,
              policyData: {
                ...data?.policyData,
                members: {
                  ...membersData,
                  mainMemberPremium: mainMemberPremiumCost,
                  additionalPremium: extendedFamilyPremiumCost,
                  totalPremium: totalPremiumCost,
                },
              },
            };
          } else {
            logError(
              `FAILURE: Error in UPDATE QUOTAION for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${ctx?.session?.user?.firstName},id: ${
                input.id
              } and Error: ${
                "Failed to get extended premium data " +
                JSON.stringify(premiumData)
              }`
            );
            return handleApiResponseError(
              "Failed to get extended premium data."
            );
          }
          try {
            const quotation: any = await prisma.quotation.update({
              where: {
                id: input.id,
              },
              data: {
                ...data,
                updatedById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              },
            });
            logInfo(
              `SUCCESS: Successfully UPDATED QUOTAION for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${ctx?.session?.user?.firstName}, id: ${
                input.id
              } and Response: ${JSON.stringify(quotation)}`
            );
            return quotation;
          } catch (error) {
            logError(
              `FAILURE: Error in UPDATE QUOTAION for user: ${
                ctx?.session?.user?.id && ctx?.session?.user?.id
              }, User name: ${ctx?.session?.user?.firstName}, id: ${
                input.id
              } and Error: ${JSON.stringify(error)}`
            );
            return handleApiResponseError(error);
          }
        } catch (error) {
          logError(
            `FAILURE: Error in UPDATE QUOTE for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } id: ${input.id} and Error: ${JSON.stringify(error)}`
          );
          return handleApiResponseError(error);
        }
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE QUOTE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } id: ${input.id} and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST for DELETE APPLICATION for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } id: ${input.id} Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.quotation.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED QUOTATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error in DELETE QUOTATION for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getQuotationInputSchema() {
  const policyData = z.discriminatedUnion("packageName", [
    z.object({
      packageName: z.literal("EMPLOYEE_FUNERAL_INSURANCE"),
      withFreeBenefit: z.boolean().optional(),
      members: z.object({
        mainMember: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          age: z
            .number()
            .min(employeeFuneralAges.mainMember.minAge)
            .max(employeeFuneralAges.mainMember.maxAge),
          email: z.string().email().optional(),
          citizenshipId: z.string().length(13).optional(),
          naturalDeathAmount: z.number().optional(),
          accidentalDeathAmount: z.number().optional(),
          telkomFreeBenefitAmount: z.number().optional(),
          premiumAmount: z.number().optional(),
        }),
        spouse: z
          .array(
            z.object({
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              age: z
                .number()
                .min(employeeFuneralAges.spouse.minAge)
                .max(employeeFuneralAges.spouse.maxAge),
              email: z.string().email().optional(),
              citizenshipId: z.string().length(13).optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
            })
          )
          .max(4)
          .optional(),
        children: z
          .array(
            z
              .object({
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                age: z.number(),
                isDisabled: z.boolean(),
                isStudying: z.boolean(),
                isStillBorn: z.boolean(),
                email: z.string().email().optional(),
                citizenshipId: z.string().length(13).optional(),
                naturalDeathAmount: z.number().optional(),
                accidentalDeathAmount: z.number().optional(),
                telkomFreeBenefitAmount: z.number().optional(),
                premiumAmount: z.number().optional(),
              })
              .superRefine((schema, ctx): any => {
                if (
                  schema.age == employeeFuneralAges.children.minAge &&
                  schema.isStillBorn
                ) {
                  return z.NEVER; //stillborn case
                } else if (
                  schema.age >= employeeFuneralAges.children.minAge &&
                  schema.age <= employeeFuneralAges.children.maxAge
                ) {
                  return z.NEVER; //normal child
                } else if (
                  schema.age > employeeFuneralAges.children.maxAge &&
                  schema.age <= employeeFuneralAges.children.studyingMaxAge &&
                  (schema.isStudying || schema.isDisabled)
                ) {
                  return z.NEVER; // student or disabled
                } else if (
                  schema.age > employeeFuneralAges.children.studyingMaxAge &&
                  schema.age <= employeeFuneralAges.children.disabledMaxAge &&
                  schema.isDisabled
                ) {
                  return z.NEVER; //disabled
                } else if (
                  schema.age > employeeFuneralAges.children.disabledMaxAge
                ) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,
                    fatal: false,
                  });
                } else {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `children age should be between ${employeeFuneralAges.children.minAge} and ${employeeFuneralAges.children.maxAge}`,
                    fatal: false,
                  });
                }
              })
          )
          .optional(),
        extendedFamily: z
          .array(
            z.object({
              options: z.enum(coverageOptions),
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              age: z
                .number()
                .min(employeeFuneralAges.extendedFamily.minAge)
                .max(employeeFuneralAges.extendedFamily.maxAge),
              email: z.string().email().optional(),
              citizenshipId: z.string().length(13).optional(),
              naturalDeathAmount: z.number().optional(),
              accidentalDeathAmount: z.number().optional(),
              telkomFreeBenefitAmount: z.number().optional(),
              premiumAmount: z.number().optional(),
              relation: z.enum(relation).optional(),
            })
          )
          .max(14)
          .optional(),
        mainMemberPremium: z.number().optional(),
        extendedFamilyPremium: z.number().optional(),
        totalPremium: z.number().optional(),
      }),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_INSURANCE"),
      members: z.string(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_DEVICE_INSURANCE"),
      members: z.string(),
    }),
    z.object({
      packageName: z.literal("EMPLOYEE_MOTOR_CREDITLIFE"),
      members: z.string(),
    }),
  ]);
  return z.object({
    options: z.enum(coverageOptions),
    billingFrequency: z.enum(premiumFrequency),
    startDate: z.date().optional(),
    policyData: policyData,
    isArchived: z.boolean().optional(),
  });
}
