import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const getPackageNameUrlHandlers = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "GET") {
    try {
      const getUrls = await caller.packages.getPackageKeys(req.body);
      logInfo(
        `Success log at GET S3 URL response : ${JSON.stringify(getUrls)}`
      );

      res.status(200).json(getUrls);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        if (httpCode === 400) {
          let errorMessage = JSON.parse(cause.message);
          cause.message = errorMessage;
        }
        return res.status(httpCode).json(cause.message);
      }
      logError(`Error log at GET S3 URL response : ${JSON.stringify(cause)}`);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at CREATE CALL CENTER : method not allowed`);
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default getPackageNameUrlHandlers;
