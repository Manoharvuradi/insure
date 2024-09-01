import { type NextApiRequest, type NextApiResponse } from "next";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { getSession } from "next-auth/react";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { logError, logInfo } from "~/server/api/constants/logger";

const getTokenHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  const session: any = await getSession({ req: req });
  if (req.method === "POST") {
    try {
      const request = {
        id: session?.user.id,
        name: session?.user.firstName,
        email: session?.user.email,
        roles: session?.user.roles,
        iat: session?.user.iat,
        exp: session?.user.exp,
        jti: session?.user.jti,
      };
      const token = await caller.tokens.createToken(request);
      logInfo(
        `Success log at CREATE AUTH TOKEN response : ${JSON.stringify(token)}`
      );
      res.status(200).json({ token });
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(JSON.parse(cause.message));
      }
      logError(
        `Error log at CREATE AUTH TOKEN response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at CREATE AUTH APPLICATION : Method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default getTokenHandler;
