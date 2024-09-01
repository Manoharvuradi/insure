import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { convertStringToDateFormate } from "~/utils/constants";
import { logError, logInfo } from "~/server/api/constants/logger";

const AccessLevelsEditHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "PUT") {
    try {
      const body = convertStringToDateFormate(req.body);
      const request: any = {
        id: parseInt(req.query.id as string),
        body: body,
      };
      const access = await caller.accessLevels.update(request);
      logInfo(
        `Success log at EDIT ACCESS LEVEL response : ${JSON.stringify(access)}`
      );
      res.status(200).json(access);
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
        `Error log at EDIT ACCESS LEVEL response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at EDIT ACCESS LEVEL : Method not allowed`);
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default AccessLevelsEditHandler;
