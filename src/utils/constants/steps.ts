import NewUserForm from "~/components/admin/newUserForm";
import ApplicationForm from "~/components/application/funeral/applicationForm";
import ClaimantForm from "~/components/claim/claimantForm";
import PaymentForm from "~/components/payments/paymentform";
// import SelectClaimPolicyTable from "~/components/policy/selectClaimPolicyTable";
// import SelectComplaintPolicyTable from "~/components/policy/selectComplaintPolicyTable";
import PolicyholderForm from "~/components/policyholder/checkPolicyholder";
import QuoteForm from "~/components/quote/funeral/quoteForm";
import ComplaintForm from "~/components/complaint/complaintForm";
import SelectPolicyTable from "~/components/policy/selectPolicyTable";
import DeviceQuoteForm from "~/components/quote/device/deviceQuoteForm";
import DeviceAppForm from "~/components/application/device/deviceAppForm";
import RetailDeviceQuote from "~/components/quote/retailDeviceQuote/quote";
import RetailDeviceAppForm from "~/components/application/retailDevice/applicationForm";
import RetailPaymentsForm from "~/components/payments/retailPayments";

export const createPolicySteps = [
  {
    name: "Quote",
    description: "",
    href: "#",
    status: "current",
    component: QuoteForm,
  },
  {
    name: "Policyholder",
    description: "",
    href: "#",
    status: "upcoming",
    component: PolicyholderForm,
  },
  {
    name: "Application",
    description: "",
    href: "#",
    status: "upcoming",
    component: ApplicationForm,
  },
  {
    name: "Payment details",
    description: "",
    href: "#",
    status: "upcoming",
    component: PaymentForm,
  },
];

export const creatClaimsSteps = [
  {
    name: "Create claimant",
    description: "",
    href: "#",
    status: "current",
    component: ClaimantForm,
  },
  {
    name: "Link Claim to Policy",
    description: "",
    href: "#",
    status: "upcoming",
    // component: SelectClaimPolicyTable,
    component: SelectPolicyTable,
  },
];
export const creatComplaintSteps = [
  {
    name: "Enter Complaint Details",
    description: "",
    href: "#",
    status: "current",
    component: ComplaintForm,
  },
  {
    name: "Link Complaint to Policy",
    description: "",
    href: "#",
    status: "upcoming",
    // component: SelectComplaintPolicyTable,
    component: SelectPolicyTable,
  },
];

export const createUserSteps = [
  {
    name: "Create user",
    description: "",
    href: "#",
    status: "current",
    component: NewUserForm,
  },
];

export const devicePolicySteps = [
  {
    name: "Quote",
    description: "",
    href: "#",
    status: "current",
    component: DeviceQuoteForm,
  },
  {
    name: "Policyholder",
    description: "",
    href: "#",
    status: "upcoming",
    component: PolicyholderForm,
  },
  {
    name: "Application",
    description: "",
    href: "#",
    status: "upcoming",
    component: DeviceAppForm,
  },
  {
    name: "Payment details",
    description: "",
    href: "#",
    status: "upcoming",
    component: PaymentForm,
  },
];

export const retailDevicePolicySteps = [
  {
    name: "Quote",
    description: "",
    href: "#",
    status: "current",
    component: RetailDeviceQuote,
  },
  {
    name: "Policyholder",
    description: "",
    href: "#",
    status: "upcoming",
    component: PolicyholderForm,
  },
  {
    name: "Application",
    description: "",
    href: "#",
    status: "upcoming",
    component: RetailDeviceAppForm,
  },
  {
    name: "Payment details",
    description: "",
    href: "#",
    status: "upcoming",
    component: RetailPaymentsForm,
  },
];
