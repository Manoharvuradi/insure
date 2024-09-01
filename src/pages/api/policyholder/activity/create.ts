import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError } from "~/server/api/constants/logger";

const PolicyholderCreateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      const application = await caller.policyholderActivity.create(req.body);
      res.status(200).json(application);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at ACTIVITIES CREATE POLICYHOLDER response : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(
      `Error log at ACTIVITIES CREATE POLICYHOLDER : method not allowed`
    );
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default PolicyholderCreateHandler;
