import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { convertStringToDateFormate } from "~/utils/constants";
import { logError, logInfo } from "~/server/api/constants/logger";

const ApplicationEditHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      //const body = { ...req.body, startDate: new Date(req.body.startDate) };
      const body = convertStringToDateFormate(req.body);
      const request: any = {
        id: req.query.id,
        body: body,
      };
      const application = await caller.application.update(request);
      logInfo(
        `Success log at EDIT APPLICATION response : ${JSON.stringify(
          application
        )}`
      );
      res.status(200).json({ status: true, data: application });
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
        `Error log at EDIT APPLICATION response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT APPLICATION : Method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default ApplicationEditHandler;
