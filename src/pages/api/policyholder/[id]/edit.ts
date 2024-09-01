import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { Policyholder } from "@prisma/client";
import { logError, logInfo } from "~/server/api/constants/logger";
import { convertStringToDateFormate } from "~/utils/constants";

const PolicyHolderEditHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      const body = convertStringToDateFormate(req.body);
      const request: any = {
        id: req.query.id,
        body: body,
      };
      const policyholder = await caller.policyholder.update(request);
      logInfo(
        `Success log at EDIT POLICYHOLDER response : ${JSON.stringify(
          policyholder
        )}`
      );
      res.status(200).json({ status: true, data: policyholder });
    } catch (cause) {
      if (cause instanceof TRPCError) {
        const httpCode = getHTTPStatusCodeFromError(cause);
        if (httpCode === 400) {
          let errorMessage = JSON.parse(cause.message);
          cause.message = errorMessage;
        }
        return res.status(httpCode).json(cause.message);
      }
      logError(
        `Error log at EDIT POLICYHOLDER response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT POLICYHOLDER : method not allowed`);
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default PolicyHolderEditHandler;
