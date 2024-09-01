import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../server/api/root";
import { createTRPCContext } from "../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";

const DeviceCatalogListHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method === "GET") {
    try {
      const DeviceCatalogList = await caller.deviceCatalog.list(req.query);
      logInfo(
        `Success log at LIST DEVICE CATALOG response : ${JSON.stringify(
          DeviceCatalogList
        )}`
      );
      res.status(200).json(DeviceCatalogList);
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
        `Error log at LIST DEVICE CATALOG response : ${JSON.stringify(cause)}`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    logError(`Error log at LIST DEVICE CATALOG : method not allowed`);
    res.status(500).json({ message: "Method Not Allowed" });
  }
};

export default DeviceCatalogListHandler;
