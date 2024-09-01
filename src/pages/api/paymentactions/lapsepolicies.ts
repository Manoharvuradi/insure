import { type NextApiRequest, type NextApiResponse } from "next";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { convertStringToDateFormate } from "~/utils/constants";

const LapsePolicyHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method == "PUT") {
    logInfo("SUCCESS REQUEST in PUT, LAPSE POLICY");
    try {
      const obj = convertStringToDateFormate({ date: req.query.date });
      const lapsedPolicies = await caller.paymentActions.lapsePolicies({
        startDateThreshold: obj.date,
      });
      logInfo("SUCCESS RESPONSE in PUT, LAPSE POLICY, ${lapsedPolicies}");
      res.status(200).json({ status: true, data: lapsedPolicies });
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
      logError(`Error log at LAPSE POLICY response : ${JSON.stringify(cause)}`);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at  LAPSE POLICY : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default LapsePolicyHandler;
