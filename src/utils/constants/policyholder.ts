export const policyHolderFormInputs = [
  {
    label: "Type",
    type: "select",
    name: "type",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Individual", value: "individual" },
    ],
  },
  {
    label: "Intials",
    type: "text",
    name: "intials",
    required: true,
  },
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
  },
  {
    label: "Middle name",
    type: "text",
    name: "middleName",
    required: false,
  },
  {
    label: "Last name",
    type: "text",
    name: "lastName",
    required: true,
  },
  {
    label: "Date of Birth",
    type: "date",
    name: "dateOfBirth",
    required: true,
  },
  {
    label: "Gender",
    type: "select",
    name: "gender",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Male", value: "MALE" },
      { label: "Female", value: "FEMALE" },
      { label: "Other", value: "OTHER" },
    ],
  },
  {
    label: "Email",
    type: "email",
    name: "email",
    required: true,
  },
  {
    label: "Phone",
    type: "phone",
    name: "phone",
    required: true,
  },
  {
    label: "Alternate Number",
    type: "phone",
    name: "phoneOther",
    required: false,
  },
  {
    label: "South africa ID number",
    type: "text",
    name: "citizenshipId",
    required: true,
  },
  {
    label: "Salary reference number",
    type: "text",
    name: "salaryReferenceNumber",
    required: true,
  },
];

export const policyholderMemberInputs = [
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
  },
  {
    label: "Middle name",
    type: "text",
    name: "middleName",
    required: false,
  },
  {
    label: "Last name",
    type: "text",
    name: "lastName",
    required: true,
  },
  {
    label: "Email",
    type: "email",
    name: "email",
    required: true,
  },
  {
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: true,
    disabled: true,
  },
  {
    label: "Gender",
    type: "select",
    name: "gender",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Male", value: "MALE" },
      { label: "Female", value: "FEMALE" },
      { label: "Other", value: "OTHER" },
    ],
  },
  {
    label: "Phone number",
    type: "phone",
    name: "phone",
    required: true,
  },
  {
    label: "Alternate mobile",
    type: "phone",
    name: "phoneOther",
    required: false,
  },
];

export const phoneInput = {
  label: "Phone number",
  type: "phone",
  name: "phone",
  required: true,
};

export const phoneOtherInputs = [
  phoneInput,
  {
    label: "Alternate mobile",
    type: "phone",
    name: "phoneOther",
    required: false,
  },
];
export const citizenshipIdInput = {
  label: "Citizenship Id",
  type: "said",
  name: "citizenshipId",
  required: true,
};

export const employeeIds = [
  {
    label: "Citizenship Id",
    type: "said",
    name: "citizenshipId",
    required: true,
    disabled: true,
  },
  {
    label: "Salary reference number",
    type: "text",
    name: "salaryRefNumber",
    required: true,
  },
];

export const addressInputs = [
  {
    label: "Street address 1",
    type: "text",
    name: "streetAddress1",
    required: true,
  },
  {
    label: "Street address 2",
    type: "text",
    name: "streetAddress2",
    required: false,
  },
  {
    label: "Suburb",
    type: "text",
    name: "suburb",
    required: false,
  },
  {
    label: "City",
    type: "text",
    name: "city",
    required: true,
  },
  {
    label: "Country",
    type: "select",
    name: "country",
    options: [
      { label: "Select", value: "" },
      { label: "South Africa", value: "southAfrica" },
      { label: "Other", value: "other" },
    ],
    required: true,
  },
  {
    label: "Area Code",
    type: "text",
    name: "areaCode",
    required: true,
  },
];
export const identityInputs = [
  {
    label: "Identification type",
    type: "select",
    name: "identificationType",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "ID", value: "ID" },
      { label: "Passport", value: "PASSPORT" },
    ],
  },
  {
    label: "Country",
    type: "select",
    name: "country",
    options: [
      { label: "Select", value: "" },
      { label: "South Africa", value: "southAfrica" },
      { label: "Other", value: "other" },
    ],
    required: true,
  },
  {
    label: "Identification Number",
    type: "text",
    name: "identificationNumber",
    required: true,
  },
];

export const paymentMethodInputs = [
  {
    label: "Collection type",
    type: "select",
    name: "collectionType",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Individual", value: "individual" },
    ],
  },
  {
    label: "Account holder",
    type: "text",
    name: "accountHolder",
    required: false,
  },
  {
    label: "Bank",
    type: "select",
    name: "bank",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "ABSA", value: "absa" },
      { label: "African bank", value: "africanBank" },
    ],
  },
  {
    label: "Branch code",
    type: "text",
    name: "branchCode",
    required: false,
  },
  {
    label: "Account number",
    type: "text",
    name: "accountNumber",
    required: false,
  },
  {
    label: "Account type",
    type: "select",
    name: "accountType",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Savings", value: "saving" },
      { label: "Cheque", value: "cheque" },
    ],
  },
  {
    label: "External reference",
    type: "text",
    name: "externalReference",
    required: false,
  },
];

export const complaintPhoneInput = {
  label: "Phone number",
  type: "phone",
  name: "complainantMobileNumber",
  required: true,
};
