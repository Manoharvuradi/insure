import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const CallCenterDeleteHandler = async (
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
        const callCenter = await caller.callCenter.delete(input);
        logInfo(
          `Success log at DELETE CALL CENTER response : ${JSON.stringify(
            callCenter
          )}`
        );
        res.status(200).json({ status: true, data: callCenter });
      }
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        if (httpCode === 400) {
          let errorMessage = JSON.parse(cause.message);
          cause.message = errorMessage;
        }
        return res
          .status(httpCode)
          .json({ status: false, message: cause.message });
      }
      logError(
        `Error log at DELETE CALL CENTER response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at DELETE CALL CENTER :Method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default CallCenterDeleteHandler;
