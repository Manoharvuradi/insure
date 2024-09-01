import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import AWS from "aws-sdk";
import {
  applicationActivitiesLabels,
  claimActivitiesLabels,
  complaintActivitiesLabels,
  leadActivitiesLabels,
  policyActivitiesLabels,
} from "~/utils/constants";
import { logError, logInfo } from "../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";
import { env } from "~/env.mjs";

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
export const uploadLibraryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await ctx.prisma.uploadLibrary.findMany({
        where: {
          isArchived: false,
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      logInfo(
        `SUCCESS: Successfully LISTED UPLOAD DOCUMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, and response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      logError(
        `FAILURE: Error in getting UPLOAD DOCUMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, and response: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST UPLOAD DOCUMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        },User name: ${
          ctx?.session?.user?.firstName
        }, and Request: ${JSON.stringify(input)}`
      );
      try {
        const response = await prisma.uploadLibrary.delete({
          where: {
            id: Number(input.id),
          },
        });
        logInfo(
          `SUCCESS: DELETING DOCUMENT file for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error: any) {
        logError(
          `FAILURE: Error DELETING DOCUMENT file for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          },User name: ${
            ctx?.session?.user?.firstName
          }, and response: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: getUploadInputSchema(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST UPDATE DOCUMENT for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${
          ctx?.session?.user?.firstName
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        input.body.fileUrl = input.body.fileContent;
        const category = input.body.category;
        delete input.body.fileContent;
        delete input.body.category;
        const uploadLibrary = await prisma.uploadLibrary.update({
          where: {
            id: Number(input.id),
          },
          data: {
            ...input.body,
          },
        });
        if (uploadLibrary) {
          let activitiesResponse;
          const archivedDocument = await prisma.uploadLibrary.findFirst({
            where: {
              id: input.id,
            },
          });
          switch (category) {
            case "application":
              const applicationActivitiesData = {
                applicationId: archivedDocument?.applicationIds as string,
                name: applicationActivitiesLabels.documentArchived,
              };
              activitiesResponse = await prisma.applicationActivity.create({
                data: {
                  ...applicationActivitiesData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
              });
              logInfo(
                `SUCCESS: Successfully UPLODING DOCUMENT In APPLICATION the file for user:${
                  ctx?.session?.user.id && ctx?.session?.user?.id
                }, User name: ${
                  ctx?.session?.user?.firstName
                }, and response: ${JSON.stringify(activitiesResponse)}`
              );
              break;
            case "policy":
              const policyActivitiesData = {
                policyId: archivedDocument?.policyIds as string,
                name: policyActivitiesLabels.documentArchived,
              };
              activitiesResponse = await prisma.policyActivity.create({
                data: {
                  ...policyActivitiesData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
              });
              logInfo(
                `SUCCESS: Successfully UPLODING DOCUMENT in POLICY the file for user:${
                  ctx?.session?.user.id && ctx?.session?.user?.id
                }, User name: ${
                  ctx?.session?.user?.firstName
                }, and response: ${JSON.stringify(activitiesResponse)}`
              );
              break;
            case "claim":
              const claimActivitiesData = {
                claimId: archivedDocument?.claimIds as string,
                name: claimActivitiesLabels.documentArchived,
              };
              activitiesResponse = await prisma.claimActivity.create({
                data: {
                  ...claimActivitiesData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
              });
              logInfo(
                `SUCCESS: Successfully UPLODING DOCUMENT in CLAIM the file for user:${
                  ctx?.session?.user.id && ctx?.session?.user?.id
                }, User name: ${
                  ctx?.session?.user?.firstName
                }, and response: ${JSON.stringify(activitiesResponse)}`
              );
              break;
            case "complaint":
              const complaintActivitiesData = {
                complaintId: Number(archivedDocument?.complaintIds),
                name: complaintActivitiesLabels.documentArchived,
              };
              activitiesResponse = await prisma.complaintsActivity.create({
                data: {
                  ...complaintActivitiesData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
              });
              logInfo(
                `SUCCESS: Successfully UPLODING DOCUMENT in COMPLAINT the file for user:${
                  ctx?.session?.user.id && ctx?.session?.user?.id
                }, User name: ${
                  ctx?.session?.user?.firstName
                }, and response: ${JSON.stringify(activitiesResponse)}`
              );
          }
        }
        return uploadLibrary;
      } catch (error: any) {
        logError(
          `FAILURE: Error in UPDATING DOCUMENT the file for user:${
            ctx?.session?.user.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  create: protectedProcedure
    .input(getUploadInputSchema())
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST UPLOAD DOCUMENT for User Id: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user.firstName} Request: ${JSON.stringify(
          input
        )}`
      );
      try {
        const timeNow = Date.now();
        const fileKey = `admincms/${timeNow}`;
        const params: any = {
          Bucket: env.AWS_BUCKET,
          Key: fileKey,
          Body: Buffer.from(
            input.fileContent.replace(
              /^data:(image|application)\/\w+;base64,/,
              ""
            ),
            "base64"
          ),
          ContentType: input.type,
        };
        const data: any = await new Promise((resolve, reject) => {
          s3.upload(params, (error: Error, data: any) => {
            if (error) {
              logError(
                `FAILURE:Error Failed to upload s3 bucket for user: ${
                  ctx?.session?.user?.id && ctx?.session?.user?.id
                } and response: ${JSON.stringify(error)}`
              );
              reject(new Error("Failed to upload s3 bucket"));
            } else {
              resolve(data);
            }
          });
        });
        if (data && data?.Location) {
          let newUploadFile;
          switch (input.category) {
            case "application": {
              newUploadFile = await prisma.uploadLibrary.create({
                data: {
                  fileUrl: data.Location,
                  applicationIds: input.referenceId,
                  s3response: data,
                  name: input.name,
                  type: input.type,
                  description: input.description,
                  appData: input.appData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
                include: {
                  createdBy: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              });
              const applicationActivitiesData = {
                applicationId: input.referenceId,
                name: applicationActivitiesLabels.document,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              await prisma.applicationActivity.create({
                data: applicationActivitiesData,
              });
              break;
            }
            case "policy": {
              newUploadFile = await prisma.uploadLibrary.create({
                data: {
                  fileUrl: data.Location,
                  policyIds: input.referenceId,
                  s3response: data,
                  name: input.name,
                  type: input.type,
                  description: input.description,
                  appData: input.appData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
                include: {
                  createdBy: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              });
              const policyActivitiesData = {
                policyId: input.referenceId,
                name: policyActivitiesLabels.document,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              await prisma.policyActivity.create({
                data: policyActivitiesData,
              });
              break;
            }
            case "complaint": {
              newUploadFile = await prisma.uploadLibrary.create({
                data: {
                  fileUrl: data.Location,
                  complaintIds: Number(input.referenceId),
                  s3response: data,
                  name: input.name,
                  type: input.type,
                  description: input.description,
                  appData: input.appData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
                include: {
                  createdBy: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              });
              const complaintActivitiesData = {
                complaintId: Number(input.referenceId),
                name: complaintActivitiesLabels.document,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              await prisma.complaintsActivity.create({
                data: complaintActivitiesData,
              });
              break;
            }
            case "claim": {
              newUploadFile = await prisma.uploadLibrary.create({
                data: {
                  fileUrl: data.Location,
                  claimIds: input.referenceId,
                  s3response: data,
                  name: input.name,
                  type: input.type,
                  description: input.description,
                  appData: input.appData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
                include: {
                  createdBy: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              });
              const claimActivitiesData = {
                claimId: input.referenceId,
                name: claimActivitiesLabels.document,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              await prisma.claimActivity.create({
                data: claimActivitiesData,
              });
              break;
            }
            case "lead": {
              newUploadFile = await prisma.uploadLibrary.create({
                data: {
                  fileUrl: data.Location,
                  leadsId: input.referenceId,
                  s3response: data,
                  name: input.name,
                  type: input.type,
                  description: input.description,
                  appData: input.appData,
                  createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
                },
                include: {
                  createdBy: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              });
              const leadActivitiesData = {
                leadsId: input.referenceId,
                name: leadActivitiesLabels.document,
                createdById: ctx?.session?.user?.id && ctx?.session?.user?.id,
              };
              await prisma.leadActivity.create({
                data: leadActivitiesData,
              });

              break;
            }
            default:
              null;
          }
          logInfo(
            `SUCCESS:  Successfully UPLOADED DOCUMENTS for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and Response: ${JSON.stringify(newUploadFile)}`
          );
          return newUploadFile;
        } else {
          logError(
            `FAILURE: Error in uploading complaint documents data for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and response: ${JSON.stringify(data)}`
          );
          throw new Error("Failed to upload file");
        }
      } catch (error) {
        logError(
          `FAILURE: Error in UPLOAD DOCUMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  gets3url: protectedProcedure
    .input(
      z
        .object({
          key: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST for GET3URL for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        }, User name: ${ctx?.session?.user?.firstName}, and applicationId: ${
          input.id
        } Request: ${JSON.stringify(input)}`
      );
      try {
        const params = {
          Bucket: env.AWS_BUCKET,
          Key: input.key,
        };
        const data: any = await s3.getObject(params).promise();
        const base64String = Buffer.from(data?.Body).toString("base64");
        const imageUrl = `data:${data.ContentType};base64,${base64String}`;
        logInfo(
          `SUCCESS: SUCCESSFULLY in RETRIEVING S3 FILE for user: ${
            ctx?.session?.user?.id
          }\nResponse: ${JSON.stringify(imageUrl)}`
        );
        return imageUrl;
      } catch (error: any) {
        logError(
          `FAILURE: Error in RETRIEVING S3 FILE for user: ${
            ctx?.session?.user?.id
          }\nError: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
});

function getUploadInputSchema() {
  return z.object({
    fileContent: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    appData: z.record(z.unknown()).optional(),
    isArchived: z.boolean().optional(),
    category: z.string().optional(),
    referenceId: z.string().optional(),
  });
}

function getUploadOutputSchema() {
  return z.object({
    fileUrl: z.string(),
    s3response: z.object({}),
  });
}
