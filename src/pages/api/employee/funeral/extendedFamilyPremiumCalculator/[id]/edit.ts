import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "../../../../../../server/api/root";
import { createTRPCContext } from "../../../../../../server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { Policyholder } from "@prisma/client";
import { logError } from "~/server/api/constants/logger";

const ExtendedFamilyCalculatorEditHandler = async (
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
      const extendedFamilyPremiumCalculator =
        await caller.extendedFamilyPremiumCalculator.update(request);
      res
        .status(200)
        .json({ status: true, data: extendedFamilyPremiumCalculator });
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
        `Error log at editFuneralExtendedPremium response ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default ExtendedFamilyCalculatorEditHandler;
