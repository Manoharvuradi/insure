import { type NextApiRequest, type NextApiResponse } from "next";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPCError } from "@trpc/server";
import { logError, logInfo } from "~/server/api/constants/logger";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";

// const upload = multer({ storage: multer.memoryStorage() });

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

const updatePolicyPayment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  if (req.method == "POST") {
    logInfo(`MANUAL UPDATE POLICY PAYMENT API REQUEST :${req.body}`);
    try {
      const formData = req.body;
      const updatePayments =
        await caller.paymentActions.updatePolicyPaymentManually(formData);
      logInfo(`MANUAL UPDATE POLICY PAYMENT API RESPONSE: ${updatePayments}`);
      res.status(200).json({ status: true, data: updatePayments });
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
        `Error log at MANUAL UPDATE POLICY PAYMENT API RESPONSE : ${JSON.stringify(
          cause
        )}`
      );
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  } else {
    logError(
      `Error log at MANUAL UPDATE POLICY PAYMENT API : method not allowed`
    );
    res.status(405).json({ status: false, message: "Method Not Allowed" });
  }
};

export default updatePolicyPayment;
