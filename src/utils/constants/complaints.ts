export const complainFormInputs = [
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: false,
  },
  {
    label: "Last name",
    type: "text",
    name: "lastName",
    required: false,
  },
  {
    label: "Email",
    type: "email",
    name: "email",
    required: false,
  },
  {
    label: "Cell",
    type: "text",
    name: "cell",
    required: false,
  },
  {
    label: "Date of Birth",
    type: "date",
    name: "dateOfBirth",
    required: false,
  },
  {
    label: "Description",
    type: "text",
    name: "description",
    required: false,
  },
  {
    label: "Policy",
    type: "select",
    name: "policy",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "C", value: "c" },
      { label: "D", value: "d" },
      { label: "E", value: "e" },
      { label: "Telkom free Benefit", value: "TELKOM_FREE_BENEFIT" },
    ],
  },
  {
    label: "Claim status",
    type: "select",
    name: "claimStatus",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Yearly", value: "YEARLY" },
      { label: "Monthly", value: "MONTHLY" },
    ],
  },
  {
    label: "Approval status",
    type: "select",
    name: "approvalStatus",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Yearly", value: "yearly" },
      { label: "Monthly", value: "monthly" },
    ],
  },
  {
    label: "Claim date",
    type: "date",
    name: "claimDate",
    required: false,
  },
  {
    label: "Requested amount",
    type: "number",
    name: "requestedAmount",
    required: true,
  },
  {
    label: "Granted Amount",
    type: "number",
    name: "grantedAmount",
    required: false,
  },
];

export const complaintFormInputs = [
  {
    label: "First name",
    type: "text",
    name: "complainantFirstName",
    required: true,
  },
  {
    label: "Last name",
    type: "text",
    name: "complainantLastName",
    required: true,
  },
  {
    label: "Email",
    type: "email",
    name: "complainantEmail",
    required: true,
  },
  {
    label: "Reason",
    type: "textarea",
    name: "reason",
    required: true,
  },
  {
    label: "Phone number",
    type: "phone",
    name: "complainantMobileNumber",
    required: true,
  },
];

export const editComplaint = [
  {
    label: "First name",
    type: "text",
    name: "complainantFirstName",
    required: true,
  },
  {
    label: "Last name",
    type: "text",
    name: "complainantLastName",
    required: true,
  },
  {
    label: "Email",
    type: "email",
    name: "complainantEmail",
    required: true,
  },
  {
    label: "Reason",
    type: "textarea",
    name: "reason",
    required: true,
  },
  {
    label: "Phone number",
    type: "phone",
    name: "complainantMobileNumber",
    required: true,
  },
];
export const ReasonTitle = "Reason";

export const ComplaintsStatusValues = {
  open: "OPEN",
  closed: "CLOSED",
};
