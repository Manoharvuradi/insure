import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import AWS from "aws-sdk";
import { logError, logInfo } from "../constants/logger";
import { handleApiResponseError } from "~/utils/helpers";
import { prisma } from "~/server/db";
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
export const attachmentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        type: z.string().optional(),
        fileContent: z.string(),
        packageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: UPLOAD DOCUMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
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
        if (data && data.Location && ctx?.session?.user?.id) {
          const request = {
            name: input.name,
            type: input.type,
            s3response: { key: data?.key },
            packageId: input.packageId,
            fileUrl: data?.Location,
            createdById: parseInt(ctx?.session?.user?.id as string),
          };
          const packageContent = await prisma.attachments.create({
            data: {
              ...request,
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
            `SUCCESS: Successfully in UPLOAD DOCUMENTS for user: ${
              ctx?.session?.user?.id && ctx?.session?.user?.id
            } and Response: ${JSON.stringify(packageContent)}`
          );
          return packageContent;
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

  archive: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        body: attachmentsSchema(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(
        `REQUEST: ARCHIVE ATTACHMENT TABLE DOCUMENTS for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const request: any = input.body;
        request.fileUrl = input.body.fileContent;
        delete request.fileContent;
        const attachments = await ctx.prisma.attachments.update({
          where: {
            id: Number(input.id),
          },
          data: {
            ...request,
          },
        });
        logInfo(
          `SUCCESS: ARCHIVED ATTACHMENT TABLE DOCUMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(input)}`
        );
        return attachments;
      } catch (error) {
        logError(
          `FAILURE: Error in ARCHIVE IN ATTACHMENT TABLE DOCUMENTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
});

function attachmentsSchema() {
  return z.object({
    fileContent: z.string().optional(),
    name: z.string().optional(),
    type: z.string().optional(),
    isArchived: z.boolean(),
  });
}
