import { dateConversion, generateMonthArray } from "../helpers";
import { packageNames } from ".";
import { env } from "~/env.mjs";

export const ApplicationStatusValues = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

export const maxDaysForUnattendedApplication = 3;

export const getApplicationString = (applicationArray: any) => {
  const currentDate = new Date();
  const threeDaysAgo = new Date(
    currentDate.getTime() - 3 * 24 * 60 * 60 * 1000
  );
  const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const applicationsInLast3Days = applicationArray.filter(
    (application: any) => new Date(application.createdAt) >= threeDaysAgo
  );

  const applicationsInLastWeek = applicationArray.filter(
    (application: any) =>
      new Date(application.createdAt) < threeDaysAgo &&
      new Date(application.createdAt) >= oneWeekAgo
  );

  const applicationsInLastMonthAndEarlier = applicationArray.filter(
    (application: any) => new Date(application.createdAt) < oneWeekAgo
  );

  let resultString = ` `;
  resultString += `<h3>Total Applications in <strong>Pending</strong>: ${applicationArray.length}</h3>`;

  if (applicationsInLast3Days.length > 0) {
    resultString += `<h4>Applications in the Last 3 Days:</h4>${generateTable(
      applicationsInLast3Days
    )}`;
  }

  if (applicationsInLastWeek.length > 0) {
    resultString += `<h4>Applications in the Last Week:</h4>${generateTable(
      applicationsInLastWeek
    )}`;
  }

  if (applicationsInLastMonthAndEarlier.length > 0) {
    resultString += `<h4>Applications in the Last Month and Earlier:</h4>${generateTable(
      applicationsInLastMonthAndEarlier
    )}`;
  }

  return resultString;
};

const generateTable = (applications: any[]) => {
  return `
    <table border="">
      <thead>
        <tr>
          <th>Policyholder</th>
          <th>Total premium</th>
          <th>Created At</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${applications
          .map(
            (application: any) =>
              `<tr>
              <td style="padding: 5px">${
                application?.policyholder?.firstName +
                " " +
                application?.policyholder?.lastName
              }</td>
              <td style="padding: 5px">${application.totalPremium}</td>
              <td style="padding: 5px">${dateConversion(
                application.createdAt
              )}</td>
              <td style="padding: 5px">
              <a href="${env.NEXT_PUBLIC_URL}/application/${
                application.id
              }/show" style="text-decoration: underline;">View</a>
              </td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
};

export const getEditApplicationData = (packageName: string) => {
  let applicatinInputs;
  const commonInputs = [
    {
      label: "Billing Frequency",
      type: "select",
      name: "billingFrequency",
      required: true,
      options: [{ label: "Monthly", value: "MONTHLY" }],
    },

    {
      label: "Billing day",
      type: "select",
      name: "billingDay",
      required: true,
      options: generateMonthArray(),
    },
    {
      label: "Start Date",
      type: "date",
      name: "startDate",
      required: false,
      disabled: true,
    },
    {
      label: "Auto Renewal",
      type: "checkbox",
      name: "autoRenewal",
      required: false,
    },
  ];
  switch (packageName) {
    case packageNames.funeral:
      const options = {
        label: "Options",
        type: "select",
        name: "options",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "A", value: "A" },
          { label: "B", value: "B" },
          { label: "C", value: "C" },
          { label: "D", value: "D" },
          { label: "E", value: "E" },
          { label: "Telkom free Benefit", value: "TELKOM_FREE_BENEFIT" },
        ],
      };
      return [options, ...commonInputs];
      break;
    default:
      return commonInputs;
  }
};

export const creditLifeInputs = [
  {
    label: "Outstanding Settlement Balance",
    type: "text",
    name: "outstandingSettlementBalance",
    required: true,
  },
  {
    label: "Vin Number",
    type: "text",
    name: "vinNumber",
    required: true,
  },
  {
    label: "Vehcile financed by",
    type: "select",
    name: "vehicleFinancedBy",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Myself", value: "MYSELF" },
      { label: "My spouse", value: "MY SPOUSE" },
      { label: "Partner", value: "PARTNER" },
      { label: "Telkom", value: "TELKOM" },
    ],
  },
];

export const deviceDetailsInputs = [
  {
    label: "Select Device",
    type: "select",
    name: "deviceType",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Laptop", value: "LAPTOP" },
      { label: "Mobile", value: "MOBILE" },
    ],
  },
  {
    label: "Cost of Device",
    type: "text",
    name: "devicePrice",
    required: true,
    // placeholder: "Enter a value less than 50000",
  },
  {
    label: "Device Unique Number",
    type: "text",
    name: "deviceUniqueNumber",
    required: true,
  },
  {
    label: "Device Brand",
    type: "select",
    name: "deviceBrand",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Iphone", value: "IPHONE" },
      { label: "Samsung", value: "SAMSUNG" },
    ],
  },
  {
    label: "Device Model",
    type: "select",
    name: "deviceModel",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Iphone 11", value: "IPHONE11" },
      { label: "Samsung s22 Ultra", value: "SAMSUNG S22 ULTRA" },
    ],
  },
  {
    label: "Device Color",
    type: "select",
    name: "deviceModelColor",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Black", value: "BLACK" },
      { label: "Green", value: "GREEN" },
      { label: "Grey", value: "GREY" },
    ],
  },
];

export const deviceAppInputs = [
  {
    label: "IMEI Number/Serial Number",
    type: "text",
    name: "deviceUniqueNumber",
    required: true,
  },
  {
    label: "Device Details",
    type: "text",
    name: "deviceDetails",
    required: false,
    // disabled: true,
  },
  {
    label: "Device Brand",
    type: "select",
    name: "deviceBrand",
    required: true,
    options: [],
  },
  {
    label: "Device Model",
    type: "select",
    name: "deviceModel",
    required: true,
    options: [
      // { label: "Select", value: "" },
      // { label: "Iphone 11", value: "IPHONE11" },
      // { label: "Samsung s22 Ultra", value: "SAMSUNG S22 ULTRA" },
    ],
  },
  {
    label: "Device Color",
    type: "select",
    name: "deviceModelColor",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Black", value: "BLACK" },
      { label: "Green", value: "GREEN" },
      { label: "Grey", value: "GREY" },
    ],
  },
];

export const deviceInsuraceInputs = [
  {
    label: "IMEI Number/Serial Number",
    type: "text",
    name: "deviceUniqueNumber",
    required: true,
  },
  {
    label: "Device Brand",
    type: "select",
    name: "deviceBrand",
    required: true,
    options: [],
  },
  {
    label: "Device Model",
    type: "select",
    name: "deviceModel",
    required: true,
    options: [
      // { label: "Select", value: "" },
      // { label: "Iphone 11", value: "IPHONE11" },
      // { label: "Samsung s22 Ultra", value: "SAMSUNG S22 ULTRA" },
    ],
  },
  {
    label: "Device Color",
    type: "select",
    name: "deviceModelColor",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Black", value: "BLACK" },
      { label: "Green", value: "GREEN" },
      { label: "Grey", value: "GREY" },
    ],
  },
];

export const financedBy = ["MYSELF", "MY SPOUSE", "PARTNER", "TELKOM"] as const;

export const creditLifeDeviceInputs = [
  {
    label: "Outstanding Settlement Balance",
    type: "text",
    name: "outstandingSettlementBalance",
    required: true,
  },
  {
    label: "Device Unique Number",
    type: "text",
    name: "deviceUniqueNumber",
    required: true,
  },
  {
    label: "Device Financed By",
    type: "select",
    name: "deviceFinancedBy",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Myself", value: "MYSELF" },
      { label: "My spouse", value: "MY SPOUSE" },
      { label: "Partner", value: "PARTNER" },
      { label: "Telkom", value: "TELKOM" },
    ],
  },
];

export const exludePackages = ["DEVICE_INSURANCE", "DEVICE_CREDITLIFE"];
