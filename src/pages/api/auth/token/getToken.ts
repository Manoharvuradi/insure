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
  if (req.method === "GET") {
    try {
      const allTokens = await caller.tokens.getTokens(req.body.id);
      logInfo(
        `Success log at GET AUTH TOKEN response : ${JSON.stringify(allTokens)}`
      );
      res.status(200).json({ status: true, data: allTokens });
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at GET AUTH TOKEN response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at GET AUTH TOKEN : Method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default getTokenHandler;
