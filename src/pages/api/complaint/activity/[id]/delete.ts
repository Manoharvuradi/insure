import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../../server/api/root";
import { createTRPCContext } from "../../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError } from "~/server/api/constants/logger";

const ComplaintActivityDeleteHandler = async (
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
        const complaint = await caller.complaintsActivity.delete(input);
        res.status(200).json(complaint);
      }
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at delete ComplaintActivity response ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default ComplaintActivityDeleteHandler;
