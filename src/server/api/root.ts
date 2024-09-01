import { createTRPCRouter } from "~/server/api/trpc";
import { policyholderRouter } from "./routers/policyholder";
import { credentialUserRouter } from "./routers/credentialuser";
import { applicationRouter } from "./routers/application";
import { policyRouter } from "./routers/policy";
import { claimRouter } from "./routers/claim";
import { quotationRouter } from "./routers/funeral/quotation";
import { premiumCalculatorRouter } from "./routers/funeral/premiumCalculator";
import { extendedFamilyPremiumCalculatorRouter } from "./routers/funeral/extendedFamilyPremiumCalculator";
import { tokensRouter } from "./routers/tokens";
import { uploadLibraryRouter } from "./routers/upload";
import { applicationActivityRouter } from "./routers/activity/application";
import { claimActivityRouter } from "./routers/activity/claim";
import { policyActivityRouter } from "./routers/activity/policy";
import { policyholderActivityRouter } from "./routers/activity/policyholder";
import { applicationNoteRouter } from "./routers/note/application";
import { claimNoteRouter } from "./routers/note/claim";
import { policyNoteRouter } from "./routers/note/policy";
import { beneficiariesRouter } from "./routers/beneficiaries";
import { complaintRouter } from "./routers/complaint";
import { complaintNoteRouter } from "./routers/note/complaint";
import { complaintActivityRouter } from "./routers/activity/complaint";
import { paymentsRouter } from "./routers/payments";
import { eventNotificationRouter } from "./routers/eventnotification";
import { accessLevelsRouter } from "./routers/accessLevels";
import { callCenterRouter } from "./routers/callCenter";
import { reportsRouter } from "./routers/reports";
import { employeeDataRouter } from "./routers/employeedata";
import { packageNamesRouter } from "./routers/packages";
import { attachmentsRouter } from "./routers/attachments";
import { creditLifeQuotationRouter } from "./routers/creditlife/quotation";
import { TwofaRouter } from "./routers/2fa";
import { vehicleDataRouter } from "./routers/vehicledata";
import { devicePremiumCalculatorRouter } from "./routers/device/devicePremiumCalculator";
import { deviceQuotationRouter } from "./routers/device/quotation";
import { paymentActionsRouter } from "./routers/paymentActions";
import { deviceCatalogRouter } from "./routers/devicecatalog";
import { deviceCreditLifeRouter } from "./routers/deviceCreditLife/quotation";
import { retailDeviceQuoteRouter } from "./routers/retailDevice/quotation";
import { leadRouter } from "./routers/lead";
import { leadsNoteRouter } from "./routers/note/leads";
import { leadActivityRouter } from "./routers/activity/lead";
import { dashboardRouter } from "./routers/dashboard";
import { actionRequiredPolicyRouter } from "./routers/actionRequiredPolicy";
import { SmsOtpRouter } from "./routers/smsOtp";
import { contactsRouter } from "./routers/contacts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  policyholder: policyholderRouter,
  credentialUser: credentialUserRouter,
  lead: leadRouter,
  application: applicationRouter,
  policy: policyRouter,
  claim: claimRouter,
  quotation: quotationRouter,
  premiumCalculator: premiumCalculatorRouter,
  extendedFamilyPremiumCalculator: extendedFamilyPremiumCalculatorRouter,
  tokens: tokensRouter,
  applicationNote: applicationNoteRouter,
  policyNote: policyNoteRouter,
  claimNote: claimNoteRouter,
  policyholderActivity: policyholderActivityRouter,
  applicationActivity: applicationActivityRouter,
  policyActivity: policyActivityRouter,
  claimActivity: claimActivityRouter,
  uploadLibrary: uploadLibraryRouter,
  beneficiaries: beneficiariesRouter,
  complaints: complaintRouter,
  complaintNotes: complaintNoteRouter,
  complaintsActivity: complaintActivityRouter,
  payments: paymentsRouter,
  eventNotification: eventNotificationRouter,
  accessLevels: accessLevelsRouter,
  callCenter: callCenterRouter,
  reports: reportsRouter,
  employeeData: employeeDataRouter,
  packages: packageNamesRouter,
  attachments: attachmentsRouter,
  creditLifeQuotation: creditLifeQuotationRouter,
  twofa: TwofaRouter,
  vehicleData: vehicleDataRouter,
  devicePremiumCalculator: devicePremiumCalculatorRouter,
  deviceQuotation: deviceQuotationRouter,
  paymentActions: paymentActionsRouter,
  deviceCatalog: deviceCatalogRouter,
  deviceCreditLife: deviceCreditLifeRouter,
  retailDeviceQuote: retailDeviceQuoteRouter,
  leadNote: leadsNoteRouter,
  leadActivity: leadActivityRouter,
  dashboard: dashboardRouter,
  actionRequiredPolicy: actionRequiredPolicyRouter,
  smsOtp: SmsOtpRouter,
  contacts: contactsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
