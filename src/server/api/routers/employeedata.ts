import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import { pagination } from "~/utils/constants";
import {
  handleApiResponseError,
  processFileContentAndEmpData,
} from "~/utils/helpers";
import Client from "ssh2-sftp-client";
import { S3 } from "aws-sdk";
const fs = require("fs");
const path = require("path");
const os = require("os");

export const employeeDataRouter = createTRPCRouter({
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
        `Request in LIST EMPLOYEE DATA for user: ${
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

        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              { CellPhone: { contains: input?.search, mode: "insensitive" } },
              { Email: { contains: input?.search, mode: "insensitive" } },
              { FullName: { contains: input?.search, mode: "insensitive" } },
              { IDNumber: { contains: input?.search, mode: "insensitive" } },
              { SalaryRef: { contains: input?.search, mode: "insensitive" } },
              { Initials: { contains: input?.search, mode: "insensitive" } },
              { Username: { contains: input?.search, mode: "insensitive" } },
              {
                PreferredName: { contains: input?.search, mode: "insensitive" },
              },
              { Rank: { contains: input?.search, mode: "insensitive" } },
              { Status: { contains: input?.search, mode: "insensitive" } },
              { Surname: { contains: input?.search, mode: "insensitive" } },
              { Title: { contains: input?.search, mode: "insensitive" } },
            ],
          };
        }
        const totalCount = await ctx.prisma.employeeData.count({
          where: {
            ...queryOptions.where,
          },
        });
        const response: any = await ctx?.prisma.employeeData.findMany(
          queryOptions
        );
        logInfo(
          `SUCCESS: Successfully LISTED EMPLOYEE DATA: ${
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
          `FAILURE: Error in LIST EMPLOYEE DATA: ${
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
      const user = await ctx.prisma.employeeData.findFirst({
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
          CellPhone: z.string().optional(),
          Email: z.string().optional(),
          FullName: z.string().optional(),
          IDNumber: z.string().optional(),
          SalaryRef: z.string().optional(),
          Initials: z.string().optional(),
          Username: z.string().optional(),
          PreferredName: z.string().optional(),
          Rank: z.string().optional(),
          Status: z.string().optional(),
          Surname: z.string().optional(),
          Title: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input, ctx }: any) => {
      logInfo(
        `Request in CREATE EMPLOYEE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const employeeDataRes = await ctx.prisma.employeeData.createMany({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully in CREATE EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(employeeDataRes)}`
        );
        return employeeDataRes;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Request: ${JSON.stringify(error)}`
        );
      }
    }),
  employeeDataFile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subDir = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "..",
        "src",
        "pages",
        "emp-updated-data"
      );
      const sfgCredentials: any = {
        host: process.env.FTP_SERVER_IP,
        username: process.env.FTP_USERNAME,
        password: process.env.FTP_PASSWORD,
        port: 22 as number,
        algorithms: {
          kex: {
            append: [
              "diffie-hellman-group1-sha1",
              "diffie-hellman-group-exchange-sha1",
              "diffie-hellman-group14-sha1",
            ] as string[],
          },
          cipher: {
            append: ["aes128-ctr", "aes256-cbc", "aes192-cbc"] as string[],
          },
        },
      };
      async function employeeUpdateOperation() {
        let sftp = new Client();

        try {
          logInfo("Attempting to connect...");
          console.log("Attempt to connect to ftp server...");

          await sftp
            .connect(sfgCredentials)
            .then(async () => {
              logInfo("Connected to the FTP server...");
              console.log("Connected to the FTP server...");
              const fileList = await sftp.list("/Inbox");

              const recentFile = fileList
                .filter((file: any) => file.name === "Employee_290MAC.001")
                .sort((a: any, b: any) => b.modifyTime - a.modifyTime)[0];
              logInfo(`Most recent file: ${recentFile}`);
              console.log("Most recent file: ", recentFile);
              if (recentFile) {
                const remoteFilePath = `/Inbox/${recentFile.name}`;

                const localFilePath = path.join(subDir, "Employee_290MAC.001");

                logInfo(`Downloading ${remoteFilePath} to ${localFilePath}`);

                if (!fs.existsSync(subDir)) {
                  fs.mkdirSync(subDir, { recursive: true });
                }

                let dst = fs.createWriteStream(localFilePath);

                logInfo(`Destination path: ${dst}`);

                await sftp.get(remoteFilePath, dst);
              } else {
                logError("No files named Employee_290MAC.001 found in /inbox");
              }
            })
            .then(() => {
              sftp.end();
            });
        } catch (err: any) {
          logError(`Error: ${err.message}`);
        } finally {
          sftp.end();
        }
      }

      async function main() {
        await employeeUpdateOperation();

        const localFilePath = path.join(subDir, "Employee_290MAC.001");
        const rows = await processFileContentAndEmpData(localFilePath, ctx);
        return rows;
      }

      const result = await main();
      return result;
    } catch (error) {
      throw error;
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        CellPhone: z.string().optional(),
        Email: z.string().optional(),
        FullName: z.string().optional(),
        IDNumber: z.string().optional(),
        SalaryRef: z.string().optional(),
        Initials: z.string().optional(),
        Username: z.string().optional(),
        PreferredName: z.string().optional(),
        Rank: z.string().optional(),
        Status: z.string().optional(),
        Surname: z.string().optional(),
        Title: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      logInfo(
        `Request in CREATE EMPLOYEE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const employeeDataRes = await ctx.prisma.employeeData.create({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully CREATED EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(employeeDataRes)}`
        );
        return employeeDataRes;
      } catch (error) {
        logError(
          `FAILURE: Error in CREATE EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        CellPhone: z.string().optional(),
        Email: z.string().optional(),
        FullName: z.string().optional(),
        IDNumber: z.string().optional(),
        SalaryRef: z.string().optional(),
        Initials: z.string().optional(),
        Username: z.string().optional(),
        PreferredName: z.string().optional(),
        Rank: z.string().optional(),
        Status: z.string().optional(),
        Surname: z.string().optional(),
        Title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      logInfo(
        `REQUEST: UPDATE EMPLOYEE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const updatedEmployeeData = await ctx.prisma.employeeData.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(updatedEmployeeData)}`
        );
        return updatedEmployeeData;
      } catch (error) {
        logError(
          `FAILURE: Error in UPDATE EMPLOYEE DATA for user: ${
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
        `Request in DELETE EMPLOYEE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Request: ${JSON.stringify(input)}`
      );
      try {
        const deleteEmployeeData = await ctx.prisma.employeeData.delete({
          where: {
            id: input.id,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Response: ${JSON.stringify(deleteEmployeeData)}`
        );
        return deleteEmployeeData;
      } catch (error) {
        logError(
          `FAILURE: Error in DELETE EMPLOYEE DATA for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } and Error: ${JSON.stringify(error)}`
        );
      }
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx, input }) => {
    logInfo(
      `REQUEST in DELETE ALL EMPLOYEE DATA for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      } and Request: ${JSON.stringify(input)}`
    );
    try {
      const deleteAllEmployeeData = await ctx.prisma.employeeData.deleteMany();
      logError(
        `SUCCESS: Successfully in DELETE ALL EMPLOYEE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(deleteAllEmployeeData)}`
      );
      return deleteAllEmployeeData;
    } catch (error) {
      logError(
        `FAILURE: Error in DELETE ALL EMPLOYEE DATA for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } and Error: ${JSON.stringify(error)}`
      );
    }
  }),
});
