import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const PaymentsShowHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ status: false, message: "Invalid id" });
      }
      const payments = await caller.payments.show(id);
      logInfo(
        `Success log at SHOW PAYMENT response : ${JSON.stringify(payments)}`
      );

      res.status(200).json(payments);
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        return res.status(httpCode).json(cause.message);
      }
      logError(`Error log at SHOW PAYMENT response : ${JSON.stringify(cause)}`);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at SHOW PAYMENT : method not allowed`);
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default PaymentsShowHandler;
