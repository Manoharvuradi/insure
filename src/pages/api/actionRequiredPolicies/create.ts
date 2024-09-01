import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { convertStringToDateFormate } from "~/utils/constants";

const ActionRequiredPoliciesCreateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "POST") {
    try {
      // const data = req.body;
      const data = convertStringToDateFormate(req.body);
      const actionRequiredPolicy = await caller.actionRequiredPolicy.create(
        data
      );
      logInfo(
        `Success log at CREATE CLAIM response : ${JSON.stringify(
          actionRequiredPolicy
        )}`
      );
      res.status(200).json({ status: true, data: actionRequiredPolicy });
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
        `Error log at CREATING ActionRequiredPolicy response : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at CREATE ActionRequiredPolicy : Method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default ActionRequiredPoliciesCreateHandler;
