import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const NotificationEditHandler = async (
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
      const eventNotification = await caller.eventNotification.update(request);
      logInfo(
        `Success log at EDIT EVENT NOTIFICATION response : ${JSON.stringify(
          eventNotification
        )}`
      );
      res.status(200).json({ status: true, data: eventNotification });
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
        `Error log at EDIT EVENT NOTIFICATION response : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT EVENT NOTIFICATION : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default NotificationEditHandler;
