export const eventInputs = [
  {
    label: "Event Name",
    type: "select",
    name: "eventName",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Policy issued", value: "POLICY_ISSUED" },
      {
        label: "Policy beneficiary updated",
        value: "POLICY_BENEFICIARY_UPDATED",
      },
      {
        label: "Policy policyholder updated",
        value: "POLICY_POLICYHOLDER_UPDATED",
      },
      { label: "Policy updated", value: "POLICY_UPDATED" },
      { label: "Policy cancelled", value: "POLICY_CANCELLED" },
      { label: "Claim approved", value: "CLAIM_APPROVED" },
      { label: "Cliam recieved", value: "CLAIM_RECEIVED" },
      { label: "Cliam repudiated", value: "CLAIM_REPUDIATED" },
      {
        label: "Claim sent to review claimant",
        value: "CLAIM_SENT_TO_REVIEW_CLAIMENT",
      },
      { label: "Lead accepted", value: "LEAD_ACCEPTED" },
      { label: "Lead refused", value: "LEAD_REFUSED" },
      { label: "Lead unattended", value: "LEAD_UNATTENDED" },
      { label: "Application unattended", value: "APPLICATION_UNATTENDED" },
    ],
  },
  {
    label: "Event Category",
    type: "select",
    name: "eventCategory",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Policy", value: "POLICY" },
      { label: "Claim", value: "CLAIM" },
      { label: "Application", value: "APPLICATION" },
      { label: "Complaint", value: "COMPLAINT" },
      { label: "Policyholder", value: "POLICYHOLDER" },
      { label: "Leads", value: "LEAD" },
    ],
  },
  {
    label: "Package Name",
    type: "select",
    name: "packageName",
    required: false,
    options: [
      { label: "Select", value: "" },
      {
        label: "Employee Motor Insurance",
        value: "EMPLOYEE_MOTOR_INSURANCE",
      },
      {
        label: "Employee Funeral Insurance",
        value: "EMPLOYEE_FUNERAL_INSURANCE",
      },
      {
        label: "Employee Device Insurance",
        value: "EMPLOYEE_DEVICE_INSURANCE",
      },
      {
        label: "Employee Motor Insurance",
        value: "EMPLOYEE_MOTOR_CREDITLIFE",
      },
      {
        label: "Employee Device Creditlife",
        value: "EMPLOYEE_DEVICE_CREDITLIFE",
      },
      {
        label: "Device Insurance",
        value: "DEVICE_INSURANCE",
      },
      {
        label: "Device Creditlife",
        value: "DEVICE_CREDITLIFE",
      },
    ],
  },
];
