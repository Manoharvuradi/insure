import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError } from "~/server/api/constants/logger";

const ShowHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "GET") {
    try {
      const upload = await caller.uploadLibrary.gets3url(req.query);
      res.status(200).json({ status: true, data: upload });
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
      logError(`Error log at GET UPLOAD response :  ${JSON.stringify(cause)}`);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at GET UPLOAD : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export const config = {
  api: {
    responseLimit: "10mb",
  },
};
export default ShowHandler;
