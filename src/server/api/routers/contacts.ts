import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { logError, logInfo } from "../constants/logger";
import {
  checkIsRecentPurchase,
  dateConversion,
  handleApiResponseError,
} from "~/utils/helpers";
import { contactStatus, pagination } from "~/utils/constants";
import { prisma } from "~/server/db";
import { json } from "stream/consumers";
import { roleValues } from "~/utils/constants/user";
import { ContactStatus } from "@prisma/client";

type UserMap = { [callCenterId: string]: string[] };

export const contactsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.string().optional(),
          offset: z.string().optional(),
          filter: z.string().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }: any) => {
      try {
        let queryOptions: any = {
          take: Number(input?.pageSize ? input?.pageSize : pagination.pageSize),
          skip: Number(input?.offset ? input?.offset : pagination.offset),
          include: {
            callCenter: true,
          },
          where: {
            isArchived: false,
          },
        };
        let user;
        if (ctx.session?.user?.roles.includes(roleValues.agent)) {
          user = await prisma.credentialsUser.findFirst({
            where: {
              id: Number(ctx?.session?.user?.id),
            },
          });
          if (user?.id) {
            queryOptions.where = {
              ...queryOptions.where,
              createdBy: {
                id: user?.id,
              },
            };
          }
        }

        if (input?.filter) {
          const filterArray = input?.filter.split(",");
          // const numberArray = filterArray.map((ele: any) => +ele); // Use map instead of forEach
          queryOptions = {
            // Create where object if it doesn't exist
            ...queryOptions,
            where: {
              status: {
                in: filterArray,
              },
            },
          };
        }

        if (input?.search) {
          queryOptions.where = {
            ...queryOptions.where,
            OR: [
              {
                imei: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                firstName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: input?.search,
                  mode: "insensitive",
                },
              },
            ],
          };
        }

        if (input?.startDate && input?.endDate) {
          queryOptions.where = {
            ...queryOptions.where, // Spread existing where properties
            dateOfPurchase: {
              gte: new Date(dateConversion(input?.startDate)),
              lte: new Date(dateConversion(input?.endDate)),
            },
          };
        }
        const totalCount = await ctx.prisma.contacts.count({
          where: {
            ...queryOptions?.where,
          },
        });
        const response = await prisma.contacts.findMany(queryOptions);
        const unassignedContacts = await ctx.prisma.contacts.findMany({
          where: {
            createdById: null,
            isArchived: false,
          },
        });
        logInfo(
          `SUCCESS: Successfully LISTED CONTACTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Response: ${JSON.stringify(response)}`
        );
        return {
          totalCount,
          currentPageCount: response?.length,
          data: response,
          unassignedContacts: unassignedContacts,
        };
      } catch (error: any) {
        logError(
          `FAILURE: Error occurred while LISTING COMPLAINTS for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          }, User name: ${
            ctx?.session?.user?.firstName
          }, and Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          phone: z.string().optional(),
          planType: z.string().optional(),
          productCode: z.string().optional(),
          order: z.string().optional(),
          model: z.string().optional(),
          typeOfDevice: z.string().optional(),
          imei: z.string().optional(),
          masterDealer: z.string().optional(),
          dealerRegion: z.string().optional(),
          distribution: z.string().optional(),
          dateOfPurchase: z.string().nullable().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          banNumber: z.string().optional(),
          status: z.enum(contactStatus).optional(),
        })
      )
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const contactRes = await ctx.prisma.contacts.createMany({
          data: input,
        });
        logInfo(
          `SUCCESS: Successfully Uploaded EXCEL DATA, for User Id: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName}`
        );
        return contactRes;
      } catch (err) {
        logError(
          `FAILURE:Error occured while UPLOADING EXCEL DATA, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user?.firstName
          }  Error: ${JSON.stringify(err)}`
        );
        return handleApiResponseError(err);
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {}),

  distribute: protectedProcedure
    .input(
      z.object({
        payload: z.array(
          z.object({
            callCenterId: z.number(),
            contactIds: z.array(z.object({ id: z.number() })),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const callCenterIds = input.payload.map((item) => item.callCenterId);

        const callCenterRes = await ctx.prisma.callCenter.findMany({
          where: {
            id: {
              in: callCenterIds,
            },
          },
          include: {
            user: true,
          },
        });

        const splitContactIdsToUsers = async (
          callCenterRes: any,
          payload: any
        ) => {
          // Precompute user IDs for each call center
          const userMap: UserMap = {};
          for (const center of callCenterRes) {
            userMap[center.id] = center.user.map((user: any) => user.id);
          }

          for (const center of payload) {
            const { callCenterId, contactIds } = center;
            const users = userMap[callCenterId];

            if (!users) continue;

            const chunkSize = Math.ceil(contactIds.length / users.length);

            const promises = [];
            let startIndex = 0;
            for (const user of users) {
              // for (let i = 0; i < chunkSize; i++) {
              const endIndex = Math.min(
                startIndex + chunkSize,
                contactIds.length
              );
              const slicedIds = contactIds.slice(startIndex, endIndex);

              if (slicedIds.length > 0) {
                promises.push(
                  ctx.prisma.contacts.updateMany({
                    where: {
                      id: { in: slicedIds.map((id: any) => id.id) },
                    },
                    data: {
                      createdById: Number(user),
                      assignedAt: new Date(),
                    },
                  })
                );
              }
              startIndex = endIndex; // Move the startIndex for the next chunk
              // }
            }

            await Promise.all(promises);
          }

          console.log("API calls completed successfully.");
        };

        // Usage
        const splittedContacts = splitContactIdsToUsers(
          callCenterRes,
          input.payload
        )
          .then((result) => {
            return true;
          })
          .catch((error) => {
            return false;
          });

        logInfo(
          `SUCCESS: Successfully ASSIGNED CONTACTS DATA, for User Id: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${ctx?.session?.user?.firstName}`
        );
        return splittedContacts;
      } catch (err) {
        logError(
          `FAILURE:Error occured while ASSIGNING CONTACTS, for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user?.firstName
          }  Error: ${JSON.stringify(err)}`
        ); // Rethrow the error if needed
      }
    }),
  show: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    try {
      const response = await ctx.prisma.contacts.findFirst({
        where: {
          id: Number(input),
        },
      });
      logInfo(
        `SUCCESS: Successfully retrieved SHOW CONTACTS data for User ID: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User name: ${
          ctx?.session?.user.firstName
        } and contactId: ${input} Response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error) {
      logError(
        `FAILURE: Error occured while retrieving SHOW CONTACT data for user: ${
          ctx?.session?.user?.id && ctx?.session?.user?.id
        } User Name: ${
          ctx.session?.user.firstName
        } and ContactId: ${input} Error: ${JSON.stringify(error)}`
      );
      return handleApiResponseError(error);
    }
  }),

  stauts: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await ctx.prisma.contacts.updateMany({
          where: {
            id: input.id,
          },
          data: {
            status: input.status as ContactStatus,
          },
        });
        logInfo(
          `SUCCESS: Successfully UPDATED STATUS CONTACTS data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } and contactId: ${input} Response: ${JSON.stringify(response)}`
        );
        return response;
      } catch (error) {
        logError(
          `FAILURE: Error occured while updating STATUS CONTACT data for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx.session?.user.firstName
          } and ContactId: ${input} Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),
  archive: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const deleteContact = await ctx.prisma.contacts.update({
          where: {
            id: input,
          },
          data: {
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED CONTACT data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } and contactId: ${input} Response: ${JSON.stringify(deleteContact)}`
        );
        return deleteContact;
      } catch (error) {
        logError(
          `FAILURE: Error occured while DELETING CONTACT data for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx.session?.user.firstName
          } and ContactId: ${input} Error: ${JSON.stringify(error)}`
        );
        return handleApiResponseError(error);
      }
    }),

  archiveBulk: protectedProcedure
    .input(z.array(z.number()))
    .mutation(async ({ ctx, input }) => {
      try {
        const deleteContact = await ctx.prisma.contacts.updateMany({
          where: {
            id: {
              in: input,
            },
          },
          data: {
            isArchived: true,
          },
        });
        logInfo(
          `SUCCESS: Successfully DELETED CONTACT data for User ID: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User name: ${
            ctx?.session?.user.firstName
          } and contactId: ${input} Response: ${JSON.stringify(deleteContact)}`
        );
        return deleteContact;
      } catch (error) {
        logError(
          `FAILURE: Error occured while DELETING CONTACTS data for user: ${
            ctx?.session?.user?.id && ctx?.session?.user?.id
          } User Name: ${
            ctx.session?.user.firstName
          } and ContactId: ${input} Error: ${JSON.stringify(error)}`
        );
      }
    }),
});
