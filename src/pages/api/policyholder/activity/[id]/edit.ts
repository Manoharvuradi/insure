import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../../server/api/root";
import { createTRPCContext } from "../../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError } from "~/server/api/constants/logger";

const PolicyholderEditHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      const request: any = {
        id: req.query.id,
        body: req.body,
      };
      const application = await caller.application.update(request);
      res.status(200).json(application);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at ACTIVITIES EDIT POLICYHOLDER response : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at ACTIVITIES EDIT POLICYHOLDER : method not allowed`);
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default PolicyholderEditHandler;
