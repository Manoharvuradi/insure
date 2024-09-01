export const roleValues = {
  agent: "AGENT",
  policyAdminstrator: "POLICY_ADMINISTRATOR",
  claimAssesor: "CLAIM_ASSESSOR",
  claimSupervisor: "CLAIM_SUPERVISOR",
  developer: "DEVELOPER",
  superAdmin: "SUPER_ADMIN",
};

export const RoleLabelNames = {
  AGENT: "Agent",
  POLICY_ADMINISTRATOR: "Policy Adminstrator",
  CLAIM_ASSESSOR: "Claim Assessor",
  CLAIM_SUPERVISOR: "Claim Supervisor",
  DEVELOPER: "Developer",
  SUPER_ADMIN: "Super Admin",
};

export const packageNameValues = {
  EMPLOYEE_MOTOR_INSURANCE: "Employee motor insurance",
  EMPLOYEE_FUNERAL_INSURANCE: "Employee funeral insurance",
  EMPLOYEE_DEVICE_INSURANCE: "Employee device insurance",
  EMPLOYEE_MOTOR_CREDITLIFE: "Employee motor credit life",
  EMPLOYEE_DEVICE_CREDITLIFE: "Employee device credit life",
  DEVICE_INSURANCE: "Device insurance",
  DEVICE_CREDITLIFE: "Device creditlife",
};
export const userInputs = [
  {
    label: "Email",
    type: "email",
    name: "email",
    required: true,
  },
  {
    label: "Password",
    type: "text",
    name: "password",
    required: true,
  },
  {
    label: "Role",
    type: "select",
    name: "role",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Admin", value: "ADMIN" },
      { label: "Super admin", value: "SUPER_ADMIN" },
      { label: "Claimant", value: "CLAIMANT" },
    ],
  },
];

export const roleInputs = [
  {
    label: "Product type",
    type: "select",
    name: "productType",
    required: true,
    options: [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "C", value: "c" },
      { label: "D", value: "d" },
      { label: "Telkom free Benefit", value: "TELKOM_FREE_BENEFIT" },
    ],
  },
  {
    label: "Collection name",
    type: "select",
    name: "collectionName",
    required: true,
    options: [
      { label: "Yearly", value: "yearly" },
      { label: "Monthly", value: "monthly" },
    ],
  },
];

export const roleCheckOptions = [
  { label: "Can create", value: "canCreate" },
  { label: "Can edit", value: "canEdit" },
  { label: "Can delete", value: "canDelete" },
  { label: "Can see", value: "canSee" },
];

export const editUserDetailsModal: any = [
  {
    label: "First Name",
    type: "text",
    name: "firstName",
    required: true,
  },
  {
    label: "Last Name",
    type: "text",
    name: "lastName",
    required: true,
  },
  {
    label: "Phone number",
    type: "phone",
    name: "phone",
    required: true,
  },
  {
    label: "Roles",
    type: "multi-select",
    name: "roles",
    required: true,
    multipleOptions: [
      {
        label: "Agent",
        name: "AGENT",
        type: "checkbox",
        required: false,
      },
      {
        label: "Claim assessor",
        name: "CLAIM_ASSESSOR",
        type: "checkbox",
        required: false,
      },
      {
        label: "Developer",
        name: "DEVELOPER",
        type: "checkbox",
        required: false,
      },
      {
        label: "Policy administrator",
        name: "POLICY_ADMINISTRATOR",
        type: "checkbox",
        required: false,
      },
      {
        label: "Super admin",
        name: "SUPER_ADMIN",
        type: "checkbox",
        required: false,
      },
      {
        label: "Claim supervisor",
        name: "CLAIM_SUPERVISOR",
        type: "checkbox",
        required: false,
      },
    ],
  },
  {
    label: "Package Name",
    type: "multi-select",
    name: "packageName",
    required: true,
    multipleOptions: [
      {
        label: "Employee motor insurance",
        type: "checkbox",
        name: "EMPLOYEE_MOTOR_INSURANCE",
        required: false,
      },
      {
        label: "Employee funeral insurance",
        type: "checkbox",
        name: "EMPLOYEE_FUNERAL_INSURANCE",
        required: false,
      },
      {
        label: "Employee device insurance",
        type: "checkbox",
        name: "EMPLOYEE_DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Employee motor credit life",
        type: "checkbox",
        name: "EMPLOYEE_MOTOR_CREDITLIFE",
        required: false,
      },
      {
        label: "Employee device credit life",
        type: "checkbox",
        name: "EMPLOYEE_DEVICE_CREDITLIFE",
        required: false,
      },
      {
        label: "Device insurance",
        type: "checkbox",
        name: "DEVICE_INSURANCE",
        required: false,
      },
      {
        label: "Device creditlife",
        type: "checkbox",
        name: "DEVICE_CREDITLIFE",
        required: false,
      },
    ],
  },
];

export const rolesList = {
  label: "Roles",
  type: "select",
  name: "role",
  required: true,
  options: [
    {
      label: "Agent",
      value: "AGENT",
    },
    {
      label: "Claim assessor",
      value: "CLAIM_ASSESSOR",
    },
    {
      label: "Developer",
      value: "DEVELOPER",
    },
    {
      label: "Policy administrator",
      value: "POLICY_ADMINISTRATOR",
    },
    {
      label: "Super admin",
      value: "SUPER_ADMIN",
    },
    {
      label: "Claim supervisor",
      value: "CLAIM_SUPERVISOR",
    },
  ],
};

export const callCenterInputs = [
  {
    label: "Call center name",
    type: "text",
    name: "name",
    required: true,
  },
  {
    label: "Description",
    type: "textarea",
    name: "description",
    required: true,
  },
];
