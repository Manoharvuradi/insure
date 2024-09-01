import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { UserRole } from "@prisma/client";

const VALIDATE2FAHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      const validate2FA = await caller.twofa.validate2FA(req.query as any);
      logInfo(
        `Success log at VALIDATE 2FA response : ${JSON.stringify(validate2FA)}`
      );
      res.status(200).json(validate2FA);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        if (httpCode === 400) {
          let errorMessage = JSON.parse(cause.message);
          cause.message = errorMessage;
        }
        return res.status(httpCode).json(cause.message);
      }
      logError(`Error log at VALIDATE 2FA response : ${JSON.stringify(cause)}`);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at VALIDATE 2FA : Method not allowed`);
    res.status(500).json({ message: "Method Not Allowed" });
  }
};

export default VALIDATE2FAHandler;
