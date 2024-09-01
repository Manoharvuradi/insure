import { bankOptions } from "./bankOptions";

export const paymentInputs = [
  {
    label: "Bank",
    type: "select",
    name: "bank",
    required: false,
    options: bankOptions,
  },
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
    label: "Account number",
    type: "text",
    name: "accountNumber",
    required: false,
  },
  {
    label: "Account holder",
    type: "text",
    name: "accountHolder",
    required: false,
  },
  {
    label: "Branch code",
    type: "text",
    name: "branchCode",
    required: false,
    disabled: true,
  },
  {
    label: "Billing address",
    type: "text",
    name: "billingAddress",
    required: false,
    disabled: false,
  },
  {
    label: "Account type",
    type: "select",
    name: "accountType",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Savings", value: "SAVINGS" },
      { label: "Cheque", value: "CHEQUE" },
    ],
  },
];

export const policyPaymentInputs = [
  {
    label: "Policy",
    type: "select",
    name: "policy",
    required: true,
    options: [{ label: "Select", value: "" }],
  },
  ...paymentInputs,
];

export const claimPaymentInputs = [
  {
    label: "Claim",
    type: "select",
    name: "claim",
    required: true,
    options: [{ label: "Select", value: "" }],
  },
  ...paymentInputs,
];

export const tranactionsColumn = [
  { key: "amount", label: "Amount" },
  { key: "balance", label: "Balance" },
  { key: "createdAt", label: "Created at" },
];

export const historyColumn = [
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
  { key: "billingDate", label: "Billing Date" },
  { key: "createdAt", label: "Created at" },
];

export const paymetMethodTypes = [
  {
    label: "Select payment",
    type: "select",
    name: "paymentMethodType",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Debit from salary", value: "DEBIT_FROM_SALARY" },
      { label: "Debit from bank account", value: "DEBIT_FROM_BANK_ACCOUNT" },
    ],
  },
];

export const LAPSE_POLICY_THRESHOLD_IN_MONTHS = 3;

export async function convertArrayToCSV(data: any[]) {
  // const csv = parse(data, { delimiter: ',' })
  // return csv;
  let converter = require("json-2-csv");
  const csv = await converter.json2csv(data);
  return csv;
}

export const paymentFormInputs = (category: string) => {
  if (category === "lead") {
    return paymentInputs.map((input) => ({
      ...input,
      required: true,
    }));
  }
  return paymentInputs.map((input) => ({
    ...input,
    required: false,
  }));
};

export const validateMonthYear = (str: string) => {
  const regex = /^(20\d{2})-(0[1-9]|1[0-2])$/;
  return regex.test(str);
};

export const compareDates = (fromDate: string, toDate: string) => {
  if (!fromDate || !toDate) {
    return false;
  }

  const fromParts = fromDate.split("-") as [string, string];
  const toParts = toDate.split("-") as [string, string];

  if (fromParts.length !== 2 || toParts.length !== 2) {
    return false;
  }

  const [fromYear, fromMonth] = fromParts;
  const [toYear, toMonth] = toParts;

  const fromDateValue = parseInt(fromYear) * 12 + parseInt(fromMonth);
  const toDateValue = parseInt(toYear) * 12 + parseInt(toMonth);

  return fromDateValue < toDateValue;
};

export const getLastDayOfMonth = (month: number, year: number) => {
  // Handling the case where the month is December (12) to get the correct number of days
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return new Date(nextYear, nextMonth, 0).getDate();
};
