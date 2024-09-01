import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const ReportsCreateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      const reports = await caller.reports.create(req.body.data);
      logInfo(
        `Success log at CREATE REPORTS response : ${JSON.stringify(reports)}`
      );

      res.status(200).json(reports);
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
        `Error log at CREATE REPORTS response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at CREATE REPORTS : method not allowed`);
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default ReportsCreateHandler;
