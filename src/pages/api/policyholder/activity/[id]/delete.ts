import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../../server/api/root";
import { createTRPCContext } from "../../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError } from "~/server/api/constants/logger";

const PolicyholderDeleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method == "DELETE") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ status: false, message: "Invalid id" });
      } else {
        const input = {
          id: Number(id),
        };
        const application = await caller.policyholderActivity.delete(input);
        res.status(200).json(application);
      }
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause);
      }
      logError(
        `Error log at ACTIVITIES DELETE POLICYHOLDER response : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(
      `Error log at ACTIVITIES DELETE POLICYHOLDER : method not allowed`
    );
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default PolicyholderDeleteHandler;
