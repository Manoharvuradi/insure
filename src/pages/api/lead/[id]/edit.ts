import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { convertStringToDateFormate } from "~/utils/constants";
import { logError, logInfo } from "~/server/api/constants/logger";

const LeadEditHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      const body = convertStringToDateFormate(req.body);
      const request: any = {
        id: req.query.id,
        body: body,
      };
      const updatedLead = await caller.lead.update(request);
      logInfo(
        `Success log at EDIT LEAD response : ${JSON.stringify(updatedLead)}`
      );
      res.status(200).json({ status: true, data: updatedLead });
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
      logError(`Error log at EDIT LEAD response : ${JSON.stringify(cause)}`);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT LEAD : Method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default LeadEditHandler;
