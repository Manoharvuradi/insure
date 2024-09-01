import { generateMonthArray } from "../helpers";
import { pdfKit } from "../helpers/pdfkit";
import {
  dateSAIDvalidation,
  validateAge,
  validateSAIDNum,
} from "../helpers/validations";
import { employeeFuneralAges, packageNames } from ".";
import { logError } from "~/server/api/constants/logger";
import { env } from "~/env.mjs";
import { Label } from "@headlessui/react/dist/components/label/label";

export const policyMemberInputs = [
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
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
    required: false,
  },
  {
    label: "Citizenship Id",
    type: "said",
    name: "said",
    required: true,
  },
  {
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: true,
    disabled: true,
  },
];
export const policyStillBornInputs = [
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
];

export const policyDataEdit = [
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
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
    required: false,
  },
  {
    label: "Citizenship Id",
    type: "said",
    name: "said",
    required: true,
  },
  {
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: true,
    disabled: true,
  },
];

export const extendedFamilyEdit = [
  {
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
    ],
  },
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
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
    required: false,
  },
  {
    label: "Citizenship Id",
    type: "said",
    name: "said",
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
    label: "Relation",
    type: "select",
    name: "relation",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Parent", value: "parent" },
      { label: "Parent-in-law", value: "parent_in_law" },
      { label: "Brother", value: "brother" },
      { label: "Sister", value: "sister" },
      { label: "Uncle", value: "uncle" },
      { label: "Aunt", value: "aunt" },
      { label: "Nephew", value: "nephew" },
      { label: "Niece", value: "niece" },
      { label: "Additional Child", value: "additional_child" },
      { label: "Grandparent", value: "grandparent" },
      { label: "Cousin", value: "cousin" },
    ],
  },
];

export const notesInput = [
  {
    label: "Title",
    type: "text",
    name: "title",
    required: true,
  },
  {
    label: "Description",
    type: "text",
    name: "description",
    required: true,
  },
];
export const childrenEdit = [
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
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
    required: false,
  },
  {
    label: "Citizenship Id",
    type: "said",
    name: "said",
    required: true,
  },
  {
    label: "Disabled",
    type: "checkbox",
    name: "isDisabled",
    required: false,
  },
  {
    label: "Studying",
    type: "checkbox",
    name: "isStudying",
    required: false,
  },
  {
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: true,
    disabled: true,
  },
];

export const getEditPolicyData = (packageName: string) => {
  let policyInputs;
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

export const editApplicationIdentification = [
  {
    label: "Country",
    type: "select",
    name: "country",
    options: [
      { label: "Select", value: "" },
      { label: "South Africa", value: "south africa" },
      { label: "Other", value: "other" },
    ],
    required: true,
  },
  {
    label: "Citizenship Id",
    type: "said",
    name: "said",
    required: false,
  },
  {
    label: "Passport Number",
    type: "text",
    name: "passportNumber",
    required: false,
  },
  {
    label: "Trust number",
    type: "text",
    name: "trustNumber",
    required: false,
  },
];
export const editApplicationDetails = [
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
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: true,
  },
  {
    label: "Gender",
    type: "select",
    name: "gender",
    required: false,
    options: [
      { label: "Select", value: "" },
      { label: "Male", value: "MALE" },
      { label: "Female", value: "FEMALE" },
      { label: "Other", value: "OTHER" },
    ],
  },
];
export const editApplicationContactDetails = [
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
];

export const editApplicationAddress = [
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
    label: "Area Code",
    type: "text",
    name: "areaCode",
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
];

export const editBeneficiaryDetails = [
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
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: false,
    disabled: true,
  },
  {
    label: "Percentage",
    type: "number",
    name: "percentage",
    required: true,
  },
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
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
    label: "Phone",
    type: "phone",
    name: "phone",
    required: true,
  },
  {
    label: "Relation",
    type: "select",
    name: "relation",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Main Member", value: "MAIN_MEMBER" },
      { label: "Spouse", value: "SPOUSE" },
      { label: "Parent", value: "PARENT" },
      { label: "Son", value: "SON" },
      { label: "Daughter", value: "DAUGHTER" },
      { label: "Aunt or Uncle", value: "AUNT_OR_UNCLE" },
      { label: "Grandparent", value: "GRANDPARENT" },
      { label: "Brother", value: "BROTHER" },
      { label: "Sister", value: "SISTER" },
      { label: "Cousin or Relative", value: "COUSIN_OR_RELATIVE" },
      { label: "Employer", value: "EMPLOYER" },
      { label: "Policyholder", value: "POLICYHOLDER" },
      { label: "Cessionary", value: "CESSIONARY" },
      { label: "Estate", value: "ESTATE" },
      { label: "Credit Provider", value: "CREDIT_PROVIDER" },
      { label: "Trust", value: "TRUST" },
      { label: "Guardian Fund", value: "GUARDIAN_FUND" },
      { label: "Funeral Parlour", value: "FUNERAL_PARLOUR" },
      { label: "Daughter-in-law", value: "DAUGHTER_IN_LAW" },
      { label: "Son-in-law", value: "SON_IN_LAW" },
      { label: "Father-in-law", value: "FATHER_IN_LAW" },
      { label: "Mother-in-law", value: "MOTHER_IN_LAW" },
      { label: "Grandchild", value: "GRAND_CHILD" },
      { label: "Other", value: "OTHER" },
      { label: "Niece or Nephew", value: "NIECE_OR_NEPHEW" },
    ],
  },
];

export const coverageOptions = {
  label: "Coverage options",
  type: "select",
  name: "coverageOption",
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

function getCoverageOptions(removeFreeBenefit: boolean) {
  // Define the coverage options
  const coverageOptions = {
    label: "Coverage options",
    type: "select",
    name: "coverageOption",
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

  if (removeFreeBenefit) {
    coverageOptions.options = coverageOptions.options.filter(
      (option) => option.value !== "TELKOM_FREE_BENEFIT"
    );
  }

  return coverageOptions;
}

export const extendedFamilyCoverageOptions = {
  label: "Coverage options",
  type: "select",
  name: "coverageOption",
  required: true,
  options: [
    { label: "Select", value: "" },
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "C", value: "C" },
    { label: "D", value: "D" },
    { label: "E", value: "E" },
  ],
};
export const billingFrequencyInput = {
  label: "Billing frequency",
  type: "select",
  name: "billingFrequency",
  required: true,
  options: [
    { label: "Monthly", value: "MONTHLY" },
    // { label: "Yearly", value: "YEARLY" },
  ],
};
export const ageInput = {
  label: "Age",
  type: "number",
  name: "age",
  required: true,
};

export const startDate = {
  label: "Commencement date",
  type: "date",
  name: "startDate",
  required: true,
};

export const billingDayInput = {
  label: "Billing day",
  type: "select",
  name: "billingDay",
  required: true,
  options: generateMonthArray(),
};

export const startDateBillingFrequency = [
  startDate,
  billingFrequencyInput,
  billingDayInput,
];

// export const mainMemberQuote = [getCoverageOptions(flag: boolean), ageInput];

export function getMainMemberQuote(flag: boolean) {
  const coverageOptions = getCoverageOptions(flag);

  // Define the age input
  const ageInput = {
    label: "Age",
    type: "number",
    name: "age",
    required: true,
  };

  return [coverageOptions, ageInput];
}

export const policyPremiumInputs = [
  { ...coverageOptions },
  {
    label: "Premium frequency",
    type: "select",
    name: "premiumFrequency",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Yearly", value: "yearly" },
      { label: "Monthly", value: "monthly" },
    ],
  },
];

export const policyExtendMemberInputs = [
  {
    label: "Select relation",
    type: "select",
    name: "relation",
    required: true,
    options: [
      { label: "Parent", value: "parent" },
      { label: "Parent-in-law", value: "parent_in_law" },
      { label: "Brother", value: "brother" },
      { label: "Sister", value: "sister" },
      { label: "Uncle", value: "uncle" },
      { label: "Aunt", value: "aunt" },
      { label: "Nephew", value: "nephew" },
      { label: "Niece", value: "niece" },
      { label: "Additional Child", value: "additional_child" },
      { label: "Grandparent", value: "grandparent" },
      { label: "Cousin", value: "cousin" },
    ],
  },
  ...policyMemberInputs,
];

export const policyFormInputs = [
  {
    label: "Start date",
    type: "date",
    name: "startDate",
    required: false,
  },
  {
    label: "End date",
    type: "date",
    name: "endDate",
    required: false,
  },
  {
    label: "Status",
    type: "select",
    name: "status",
    required: false,
  },
  {
    label: "Billing day",
    type: "select",
    name: "billingDay",
    required: true,
    options: generateMonthArray(),
  },
  {
    label: "Policyholder",
    type: "select",
    name: "policyholder",
    required: true,
    options: [],
  },
  {
    label: "Application",
    type: "select",
    name: "application",
    required: true,
    options: [{ label: "Select", value: "" }],
  },
];

export const policyBeneficiaryInputs = [
  {
    label: "First name",
    type: "text",
    name: "firstName",
    required: true,
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
    label: "Phone Number",
    type: "phone",
    name: "phone",
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
    label: "Relation",
    type: "select",
    name: "relation",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Main Member", value: "MAIN_MEMBER" },
      { label: "Spouse", value: "SPOUSE" },
      { label: "Parent", value: "PARENT" },
      { label: "Son", value: "SON" },
      { label: "Daughter", value: "DAUGHTER" },
      { label: "Aunt or Uncle", value: "AUNT_OR_UNCLE" },
      { label: "Grandparent", value: "GRANDPARENT" },
      { label: "Brother", value: "BROTHER" },
      { label: "Sister", value: "SISTER" },
      { label: "Cousin or Relative", value: "COUSIN_OR_RELATIVE" },
      { label: "Employer", value: "EMPLOYER" },
      { label: "Policyholder", value: "POLICYHOLDER" },
      { label: "Cessionary", value: "CESSIONARY" },
      { label: "Estate", value: "ESTATE" },
      { label: "Credit Provider", value: "CREDIT_PROVIDER" },
      { label: "Trust", value: "TRUST" },
      { label: "Guardian Fund", value: "GUARDIAN_FUND" },
      { label: "Funeral Parlour", value: "FUNERAL_PARLOUR" },
      { label: "Daughter-in-law", value: "DAUGHTER_IN_LAW" },
      { label: "Son-in-law", value: "SON_IN_LAW" },
      { label: "Father-in-law", value: "FATHER_IN_LAW" },
      { label: "Mother-in-law", value: "MOTHER_IN_LAW" },
      { label: "Grandchild", value: "GRAND_CHILD" },
      { label: "Other", value: "OTHER" },
      { label: "Niece or Nephew", value: "NIECE_OR_NEPHEW" },
    ],
  },
  {
    label: "Percentage",
    type: "number",
    name: "percentage",
    required: true,
  },
  {
    label: "Citizenship Id",
    type: "said",
    name: "said",
    required: false,
  },
  {
    label: "Date of birth",
    type: "date",
    name: "dateOfBirth",
    required: false,
    disabled: true,
  },
  {
    label: "Passport Number",
    type: "text",
    name: "passportNumber",
    required: false,
  },
  {
    label: "Identification country",
    type: "select",
    name: "identificationCountry",
    options: [
      { label: "Select", value: "" },
      { label: "South africa", value: "southAfrica" },
      { label: "Other", value: "other" },
    ],
    required: true,
  },
  {
    label: "Trust number",
    type: "text",
    name: "trustNumber",
    required: false,
  },
];

export const applicationInputs = [
  {
    label: "Start date",
    type: "date",
    name: "startDate",
    required: true,
  },
  {
    label: "Policyholder",
    type: "select",
    name: "policyholder",
    required: true,
    options: [{ label: "Select", value: "" }],
  },
];

export const calculateNextBillingDate = (billingDay: any, startDate: any) => {
  let [year, month, day] = startDate.split("-");
  let nextBillingDate: Date;
  month = Number(month);
  if (day >= billingDay) {
    nextBillingDate = new Date(Number(year), month, Number(billingDay) + 1);
  } else {
    month -= 1;
    nextBillingDate = new Date(Number(year), month, Number(billingDay) + 1);
  }
  return nextBillingDate;
};

export const calculateStartDate = (startDate: any) => {
  const currentDate = new Date();
  if (startDate > currentDate) {
    return startDate;
  } else {
    return currentDate;
  }
};
export const PolicyStatusValues = {
  active: "ACTIVE",
  cancelled: "CANCELLED",
};

interface UploadConfig {
  policy: any;
  ctx: any;
  bucketName: string;
  s3: any;
  prisma: any;
  description: string;
  fileName: string;
  base64: any;
}

export function ValidateChildAge(said: string, child: any) {
  let errorMessage;
  let dateOfBirth;
  if (validateSAIDNum(said)) {
    dateOfBirth = dateSAIDvalidation(said.substring(0, 6));
    const age = validateAge(dateOfBirth);
    const { minAge, maxAge, studyingMaxAge, disabledMaxAge } =
      employeeFuneralAges.children;

    if (
      age < minAge ||
      (age > maxAge && !child.isDisabled && !child.isStudying)
    ) {
      errorMessage = `Children age should be between ${minAge} and ${maxAge}`;
    }
    if (age <= studyingMaxAge && (!child.isStudying || !child.isDisabled)) {
      errorMessage = `This age is allowed for children if they are studying or disabled.`;
    }
    if (age <= disabledMaxAge && !child.isDisabled) {
      errorMessage = `This age is allowed only for disabled children.`;
    } else {
      errorMessage = "";
    }
  } else if (said !== "") {
    errorMessage = "Invalid SA-ID";
    dateOfBirth = "";
  }
  return { errorMessage, dateOfBirth };
}

export async function generatePolicySchedule(config: UploadConfig) {
  try {
    const {
      policy,
      ctx,
      bucketName,
      s3,
      prisma,
      description,
      fileName,
      base64,
    } = config;
    const timeNow = Date.now();
    const fileKey = `admincms/${timeNow}.pdf`;
    const params: any = {
      Bucket: env.AWS_BUCKET,
      Key: fileKey,
      Body: Buffer.from(
        base64.replace(/^data:(image|application)\/\w+;base64,/, ""),
        "base64"
      ),
      ContentType: "application/pdf",
    };

    const data: any = await new Promise((resolve, reject) => {
      s3.upload(params, (error: Error, data: any) => {
        if (error) {
          logError(
            `Error Failed to upload s3 bucket for user: ${
              ctx?.session?.user?.id
            } and response: ${JSON.stringify(error)}`
          );
          reject(new Error("Failed to upload s3 bucket"));
        } else {
          resolve(data);
        }
      });
    });

    if (data && data.Location) {
      if (policy.id && data.key) {
        await ctx.prisma.policy.update({
          where: {
            id: policy.id,
          },
          data: {
            policyScheduleKey: data.key,
          },
        });
      }
      const uploadLibrary = await prisma.uploadLibrary.create({
        data: {
          fileUrl: data.Location,
          policyIds: policy.id,
          s3response: data,
          name: fileName,
          type: "application/pdf",
          description: description,
          createdById: ctx?.session?.user?.id,
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return uploadLibrary;
    }

    throw new Error("Data location is not available.");
  } catch (error) {
    throw error;
  }
}

export const deviceInputs: any = [
  {
    label: "Select Device",
    type: "select",
    name: "deviceType",
    required: true,
    options: [
      // { label: "Select", value: "" },
      // { label: "Laptop", value: "LAPTOP" },
      // { label: "Mobile", value: "MOBILE" },
      // ...(op?.map((data: any) => ({
      //   label: data,
      //   value: data,
      // })) || []),
    ],
  },
  {
    label: "Has the Device been bought less than 7 days ago?",
    type: "checkbox",
    name: "isRecentPurchase",
    required: false,
    checked: true,
  },
  {
    label: "Cost of Device",
    type: "text",
    name: "devicePrice",
    required: true,
    placeholder: "Enter a value less than 50000",
  },
];

export const deviceMaxPrice = 60000;

export const creditLifeOptCheckbox = {
  label: "Opt for credit life",
  type: "checkbox",
  name: "creditLifeOpt",
  required: false,
};

export const creditLifeOptInputs = [
  {
    label: "Outstanding settlement balance",
    type: "text",
    name: "outstandingSettlementBalance",
    required: true,
  },
  {
    label: "Device financed by",
    type: "select",
    name: "deviceFinancedBy",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "My self", value: "MYSELF" },
      { label: "My spouse", value: "MY SPOUSE" },
      { label: "Partner", value: "PARTNER" },
      { label: "Telkom", value: "TELKOM" },
    ],
  },
];

export const retailDeviceInputs: any = [
  {
    label: "Select Device",
    type: "select",
    name: "deviceType",
    required: true,
    options: [],
  },
  {
    label: "Have the Device been bought less than 21 days ago?",
    type: "checkbox",
    name: "isRecentPurchase",
    required: false,
    checked: true,
  },
  {
    label: "Cost of Device",
    type: "text",
    name: "devicePrice",
    required: true,
    placeholder: "Enter a value less than 60000",
  },
  {
    label: "Phone number",
    type: "phone",
    name: "phone",
    required: true,
  },
];

export const LeadStatusValues = {
  draft: "DRAFT",
  refused: "REFUSED",
  inreview: "INREVIEW",
  declined: "DECLINED",
  accepted: "ACCEPTED",
};

export const retailDeviceCreditLifeOpt = {
  label: "Click to confirm credit life",
  type: "checkbox",
  name: "confirmCreditLife",
  required: false,
};

export const renewalPolicyInputs = [
  {
    label: "Renewal Date",
    type: "date",
    name: "renewalDate",
    required: true,
  },
  {
    label: "End Date",
    type: "date",
    name: "endDate",
    reuired: true,
  },
];

export const contactStatusValues = {
  open: "OPEN",
  notInterested: "NOT_INTERESTED",
  expired: "EXPIRED",
  callScheduled: "CALL_SCHEDULED",
  interested: "INTERESTED",
};
