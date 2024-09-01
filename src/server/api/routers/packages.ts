import { logError, logInfo } from "../constants/logger";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  convertInputToUpdateObject,
  convertToObjectWithCreate,
  convertToObjectWithUpdate,
  packageName,
  removeUndefinedAndAddUuid,
} from "~/utils/constants";
import { handleApiResponseError } from "~/utils/helpers";
import AWS from "aws-sdk";
import { env } from "~/env.mjs";
import { PackageName } from "@prisma/client";

const s3 = new AWS.S3(
  env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
    ? {
        accessKeyId: env.AWS_KEY as string,
        secretAccessKey: env.AWS_SECRET as string,
        region: env.AWS_LOG_REGION as string,
      }
    : {
        region: env.AWS_LOG_REGION as string,
      }
);
export const packageNamesRouter = createTRPCRouter({
  getPackageKeys: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      logInfo(
        `REQUEST for packageID, for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const response = ctx?.prisma?.package.findMany({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `Success: successfully retrieved packageID, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logInfo(
          `FAILURE: Error occured while retrieving packageID, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(input)}`
        );
      }
    }),

  getPackages: protectedProcedure.query(async ({ ctx, input }) => {
    logInfo(
      `Request in LIST PackageName for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and Request: ${JSON.stringify(input)}`
    );
    try {
      const response = ctx?.prisma.package.findMany({
        include: {
          attachments: {
            include: {
              createdBy: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            where: {
              isArchived: false,
            },
          },
          packageRules: {
            include: {
              ruleLimits: true,
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      });
      logInfo(
        `SUCCESS: Successfully LISTED PackageName for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error in LISTED PackageName for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),

  createPackage: protectedProcedure
    .input(createPackageSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST CREATE PACKAGE in packages Table for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const res = input.attachments.map(
          async (attachment: any, index: any) => {
            const timeNow = Date.now();
            const fileKey = `admincms/${timeNow}`;
            const params: any = {
              Bucket: env.AWS_BUCKET,
              Key: fileKey,
              Body: Buffer.from(
                attachment?.fileContent?.replace(
                  /^data:(image|application)\/\w+;base64,/,
                  ""
                ),
                "base64"
              ),
              ContentType: attachment?.type,
            };
            const data: any = await new Promise((resolve, reject) => {
              s3.upload(params, (error: Error, data: any) => {
                if (error) {
                  logError(
                    `Error Failed to upload s3 bucket for user: ${
                      ctx?.session?.user?.id && ctx?.session?.user?.id
                    } and response: ${JSON.stringify(error)}`
                  );
                  reject(new Error("Failed to upload s3 bucket"));
                } else {
                  resolve(data);
                }
              });
            });
            input.attachments[index].key = data.key;
            input.attachments[index].Location = data.Location;
          }
        );
        await Promise.all(res);
        let request = input.attachments.map((attachment: any) => ({
          name: attachment.name,
          type: attachment.type,
          s3response: { key: attachment?.key },
          fileUrl: attachment?.Location,
          createdById: parseInt(ctx?.session?.user?.id as string),
        }));

        const attachments = convertToObjectWithCreate(request);
        const payload = {
          packageName: input?.packageName,
          attachments: attachments,
        };
        const createPackage = await ctx?.prisma.package.create({
          data: payload,
        });
        logInfo(
          `SUCCESS: Successfully retrieved GET PACKAGE URL for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(createPackage)}`
        );
        return createPackage;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE PACKAGE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  createPackageRule: protectedProcedure
    .input(createPackageRule())
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST CREATE PACKAGE RULES in packages Table for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const limits = convertToObjectWithCreate(input.ruleLimits);
        const createPackageRules = ctx.prisma.packageRules.create({
          data: {
            packageId: input.packageid,
            ruleStartDate: input.ruleStartDate,
            ruleLimits: limits,
            // createdById: ctx?.session?.user?.id && Number(ctx?.session?.user?.id)
          },
        });
        return createPackageRules;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE PACKAGE RULES for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: updatedPackageSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: UPLOAD DOCUMENTS in package table for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        let attachments: any;
        let packageRules;
        if (input?.body?.attachments) {
          const res = input?.body?.attachments?.map(
            async (attachment: any, index: any) => {
              const timeNow = Date.now();
              const fileKey = `admincms/${timeNow}`;
              const params: any = {
                Bucket: env.AWS_BUCKET,
                Key: fileKey,
                Body: Buffer.from(
                  attachment?.fileContent?.replace(
                    /^data:(image|application)\/\w+;base64,/,
                    ""
                  ),
                  "base64"
                ),
                ContentType: attachment?.type,
              };
              const data: any = await new Promise((resolve, reject) => {
                s3.upload(params, (error: Error, data: any) => {
                  if (error) {
                    logError(
                      `Error Failed to upload s3 bucket for user: ${
                        ctx?.session?.user?.id && ctx?.session?.user?.id
                      } and response: ${JSON.stringify(error)}`
                    );
                    reject(new Error("Failed to upload s3 bucket"));
                  } else {
                    resolve(data);
                  }
                });
              });
              if (input?.body?.attachments && input?.body?.attachments[index]) {
                input.body.attachments[index].key = data?.key;
                input.body.attachments[index].Location = data?.Location;
              }
            }
          );
          await Promise.all(res);
          let request = input?.body?.attachments?.map((attachment: any) => ({
            name: attachment.name,
            type: attachment.type,
            s3response: { key: attachment?.key },
            fileUrl: attachment?.Location,
            createdById: parseInt(ctx?.session?.user?.id as string),
          }));
          attachments = convertToObjectWithCreate(request);
        }
        if (input?.body?.packageRules) {
          let rules: any = input.body.packageRules;
          packageRules = removeUndefinedAndAddUuid({ rules: rules });
          let limits: any = input.body.packageRules[0]?.ruleLimits;
          limits = removeUndefinedAndAddUuid({ limits: limits });
          packageRules.rules.update[0].data.ruleLimits = limits?.limits;
        }
        const payload = {
          ...(input?.body?.packageName && {
            packageName: input?.body?.packageName,
          }),
          ...(attachments && { attachments: attachments }),
          ...(packageRules && { packageRules: packageRules.rules }),
          // updatedById: parseInt(ctx?.session?.user?.id as string),
        };
        const createPackage = await ctx?.prisma.package.update({
          where: {
            id: input.id,
          },
          data: payload,
        });
        logInfo(
          `SUCCESS: Successfully uploaded documents in packageTable for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(createPackage)}`
        );
        return createPackage;
      } catch (error) {
        logError(
          `FAILURE: Error in uploaded documents in packageTable for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  deletePackageRule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST FOR DELETE PACKAGE RULE OF ID:${input.id} for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }`
      );
      try {
        const deletePackageRule = await ctx.prisma.packageRules.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED PACKAGE RULE OF ID: ${
            input.id
          } for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(deletePackageRule)} `
        );
        return deletePackageRule;
      } catch (error) {
        logError(
          `FAILURE: Error inDELETE PACKAGE RULE for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),

  deleteLimit: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `SUCCESS: REQUEST FOR DELETE PACKAGE LIMIT OF ID:${
          input.id
        } for user: ${ctx?.session?.user?.id && ctx?.session?.user?.id}`
      );
      try {
        const deletePackageRule = await ctx.prisma.ruleLimits.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED PACKAGE LIMIT OF ID: ${
            input.id
          } for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(deletePackageRule)} `
        );
        return deletePackageRule;
      } catch (error) {
        logError(
          `FAILURE: Error inDELETE PACKAGE LIMIT for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)} `
        );
        return handleApiResponseError(error);
      }
    }),
});

function createPackageSchema() {
  const attachments = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    fileContent: z.string().optional(),
  });
  return z.object({
    packageName: z.enum(packageName),
    attachments: z.array(attachments),
  });
}

function createPackageRule() {
  return z.object({
    packageid: z.number(),
    ruleStartDate: z.date(),
    ruleLimits: z.array(
      z.object({
        minValue: z.number(),
        maxValue: z.number(),
        aditionalCoverPercentage: z.number(),
        freeCoverPremium: z.number(),
        freeCoverBenefitAmount: z.number(),
      })
    ),
  });
}

function updatedPackageSchema() {
  const attachments = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    fileContent: z.string().optional(),
  });
  return z.object({
    packageName: z.enum(packageName).optional(),
    packageRules: z
      .array(
        z.object({
          id: z.number().optional(),
          ruleStartDate: z.date().optional(),
          ruleLimits: z
            .array(
              z.object({
                id: z.number().optional(),
                aditionalCoverPercentage: z.number().optional(),
                freeCoverBenefitAmount: z.number().optional(),
                freeCoverPremium: z.number().optional(),
                minValue: z.number().optional(),
                maxValue: z.number().optional(),
              })
            )
            .optional(),
        })
      )
      .optional(),
    attachments: z.array(attachments).optional(),
  });
}
