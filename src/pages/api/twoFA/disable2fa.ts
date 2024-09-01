import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";
import { logError, logInfo } from "~/server/api/constants/logger";

const DISABLE2FAHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      const disable2FA = await caller.twofa.disable2FA(req.body);
      logInfo(
        `Success log at DISABLE 2FA response : ${JSON.stringify(disable2FA)}`
      );
      res.status(200).json(disable2FA);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        if (httpCode === 400) {
          let errorMessage = JSON.parse(cause.message);
          cause.message = errorMessage;
        }
        return res.status(httpCode).json(cause.message);
      }
      logError(`Error log at DISABLE 2FA response : ${JSON.stringify(cause)}`);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at DISABLE 2FA : Method not allowed`);
    res.status(500).json({ message: "Method Not Allowed" });
  }
};

export default DISABLE2FAHandler;
