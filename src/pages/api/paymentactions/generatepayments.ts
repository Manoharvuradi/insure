import { type NextApiRequest, type NextApiResponse } from "next";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { convertStringToDateFormate } from "~/utils/constants";

const GeneratePaymentsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method == "POST") {
    logInfo("SUCCESS REQUEST in POST, GENERATE PAYMENTS");
    try {
      const obj = convertStringToDateFormate({ date: req.query.date });
      const payments = await caller.paymentActions.generatePayments({
        startDateThreshold: obj.date,
      });
      logInfo("SUCCESS RESPONSE in POST, GENERATE PAYMENTS , ${payments}");
      res.status(200).json({ status: true, data: payments });
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
        `Error log at GENERATE PAYMENTS response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at  GENERATE PAYMENTS : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default GeneratePaymentsHandler;
