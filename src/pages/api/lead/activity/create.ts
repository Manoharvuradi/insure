import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
// import { logError, logInfo } from "~/server/api/constants/logger";
import { logError, logInfo } from "../../../../server/api/constants/logger";

const ApplicationCreateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      const application = await caller.applicationActivity.create(req.body);
      logInfo(
        `Success log at ACTIVITY CREATE APPLICATION response : ${JSON.stringify(
          application
        )}`
      );
      res.status(200).json(application);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at ACTIVITY CREATE APPLICATION response : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at ACTIVITY CREATE APPLICATION : Method not allowed`);
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default ApplicationCreateHandler;
