/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { User, type Session } from "next-auth";

import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return {
    req,
    res,
    prisma,
    session,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { env } from "process";
import { request } from "http";
import {
  APILayerAccessLevelsDefinition,
  combineAccessLevelsForRoles,
} from "~/utils/constants";
import { UserRole } from "@prisma/client";
import { APIMethod, ApiUrl, funeralAPIUrl } from "~/interfaces/common";
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  const { req, session } = ctx;
  const token = req.headers.authorization?.split(" ")[1];

  let user: any = null;
  let requestWithPackageName = { ...ctx.req.query };
  let canUserAccess = false;
  if (token) {
    try {
      const requestMethod = req.method as APIMethod;
      const reqURL = req?.url?.split("/");
      const secret = env.NEXTAUTH_SECRET as string;
      if (reqURL && reqURL[2] === "user" && requestMethod === "POST") {
        const userCount = await prisma.credentialsUser.count();
        if (userCount === 0) {
          return next({
            ctx: {
              req: {
                ...ctx.req,
                query: requestWithPackageName,
              },
              session: session,
            },
          });
        }
      }
      user = jwt.verify(token, secret) as User;
      try {
        const credentialsUser = await prisma.credentialsUser.findFirst({
          where: {
            id: user.id,
          },
        });
        if (credentialsUser?.email !== user.email) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        user.roles = credentialsUser?.roles;
        user.packageName = credentialsUser?.packageName;
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      if (
        typeof reqURL === "object" &&
        reqURL &&
        reqURL.length > 0 &&
        reqURL[2]
      ) {
        const currentRoles = user.roles as UserRole[];
        let url: ApiUrl | funeralAPIUrl;
        switch (reqURL[3]) {
          case "funeral": {
            url = reqURL[4] as funeralAPIUrl;
            break;
          }
          case "motorcreditlife": {
            url = reqURL[4] as funeralAPIUrl;
            break;
          }
          case "devicecreditlife": {
            url = reqURL[4] as funeralAPIUrl;
            break;
          }
          case "device": {
            url = reqURL[4] as funeralAPIUrl;
            break;
          }
          default: {
            url = reqURL[2] as ApiUrl;
          }
        }

        // const getFeaturesBasedonRoles =
        const getFeaturesBasedonRoles = combineAccessLevelsForRoles(
          currentRoles,
          APILayerAccessLevelsDefinition
        );
        canUserAccess = getFeaturesBasedonRoles[url][requestMethod];
      }
    } catch (err) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }

  const authenticatedUser: any = user || session?.user;
  if (!authenticatedUser || (token && !canUserAccess)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const availablePackages: string = authenticatedUser.packageName
    ?.join(",")
    .replace(/,\s+/g, ",");
  requestWithPackageName.packageName = availablePackages as string;
  const updatedSession = { ...session, user: authenticatedUser };

  return next({
    ctx: {
      req: {
        ...ctx.req,
        query: requestWithPackageName,
      },
      session: updatedSession,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
