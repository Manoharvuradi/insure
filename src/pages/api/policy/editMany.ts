import { type NextApiRequest, type NextApiResponse } from "next";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { convertStringToDateFormate } from "~/utils/constants";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

const PolicyEditManyHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      const body = convertStringToDateFormate(req.body);
      const request: any = {
        body: body.data,
      };
      const policy = await caller.policy.updateMany(request.body);
      logInfo(
        `Success log at EDIT MANY POLICY response : ${JSON.stringify(policy)}`
      );
      res.status(200).json({ status: true, data: policy });
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
        `Error log at EDIT MANY POLICY response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT MANY POLICY : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default PolicyEditManyHandler;
