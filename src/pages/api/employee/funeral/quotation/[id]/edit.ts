import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../../../server/api/root";
import { createTRPCContext } from "../../../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const QuotationEditHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      const request: any = {
        id: Number(req.query.id),
        body: req.body,
      };
      const quotation = await caller.quotation.update(request);
      logInfo(
        `Success log at EDIT QUOTATION response : ${JSON.stringify(quotation)}`
      );
      res.status(200).json({ status: true, data: quotation });
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
        `Error log at EDIT QUOTATION response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT QUOTATION : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default QuotationEditHandler;
