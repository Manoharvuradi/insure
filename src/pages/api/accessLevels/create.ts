import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { UserRole } from "@prisma/client";

const AccessLevelsCreateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      const accessLevels = await caller.accessLevels.create(req.body);
      logInfo(
        `Success log at CREATE ACCESS LEVEL response : ${JSON.stringify(
          accessLevels
        )}`
      );
      res.status(200).json(accessLevels);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        if (httpCode === 400) {
          let errorMessage = JSON.parse(cause.message);
          cause.message = errorMessage;
        }
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at CREATE ACCESS LEVEL response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at CREATE ACCESS LEVEL : Method not allowed`);
    res.status(500).json({ message: "Method Not Allowed" });
  }
};

export default AccessLevelsCreateHandler;
