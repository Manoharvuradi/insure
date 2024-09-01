import { PackageName } from "@prisma/client";
import { Claimantrelations, packageNames } from ".";
import { prisma } from "~/server/db";
import { IUserColumn } from "~/interfaces/common";

export const claimStatusValues = {
  open: "OPEN",
  close: "CLOSED",
  acknowledged: "ACKNOWLEDGED",
  finalized: "FINALIZED",
  reject: "REJECTED",
};

export const claimApprovalStatusValues = {
  pending: "PENDING",
  approved: "APPROVED",
  repudated: "REPUDIATED",
  payoutBlocked: "PAYOUT_BLOCKED",
  payoutProcessed: "PAYOUT_PROCESSED",
};

export const claimFormInputs = [
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
    label: "Date of birth",
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
    label: "Granted amount",
    type: "number",
    name: "grantedAmount",
    required: false,
  },
];

export const editClaimant = [
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
    label: "Relation",
    type: "select",
    name: "relation",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Father", value: "father" },
      { label: "Mother", value: "mother" },
      { label: "Brother", value: "brother" },
      { label: "Sister", value: "sister" },
      { label: "Son", value: "son" },
      { label: "Daughter", value: "daughter" },
      { label: "Aunt/Uncle", value: "aunt_uncle" },
      { label: "Cousin", value: "cousin" },
      { label: "Son in law", value: "son_in_law" },
      { label: "Daughter in law", value: "daughter_in_law" },
      { label: "Father in law", value: "father_in_law" },
      { label: "Mother in law", value: "mother_in_law" },
      { label: "Credit provider", value: "credit_provider" },
      { label: "Cessionary", value: "cessionary" },
      { label: "Employer", value: "employer" },
      { label: "Grandparent", value: "grandparent" },
      { label: "Grandchild", value: "grandchild" },
      { label: "Guardian", value: "guardian" },
      { label: "Main member", value: "main_member" },
      { label: "Funeral parlour", value: "funeral_parlour" },
      { label: "Niece", value: "niece" },
      { label: "Nephew", value: "nephew" },
      { label: "Trust", value: "trust" },
      { label: "Policyholder", value: "policy_holder" },
      { label: "Friend", value: "friend" },
      { label: "Colleague", value: "colleague" },
      { label: "Acquaintance", value: "acquaintance" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Phone",
    type: "phone",
    name: "phone",
    required: true,
  },
];

export const claimantFormInputs = [
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
    label: "Relation",
    type: "select",
    name: "relation",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Father", value: "father" },
      { label: "Mother", value: "mother" },
      { label: "Brother", value: "brother" },
      { label: "Sister", value: "sister" },
      { label: "Son", value: "son" },
      { label: "Daughter", value: "daughter" },
      { label: "Aunt/Uncle", value: "aunt_uncle" },
      { label: "Cousin", value: "cousin" },
      { label: "Son in law", value: "son_in_law" },
      { label: "Daughter in law", value: "daughter_in_law" },
      { label: "Father in law", value: "father_in_law" },
      { label: "Mother in law", value: "mother_in_law" },
      { label: "Credit provider", value: "credit_provider" },
      { label: "Cessionary", value: "cessionary" },
      { label: "Employer", value: "employer" },
      { label: "Grandparent", value: "grandparent" },
      { label: "Grandchild", value: "grandchild" },
      { label: "Guardian", value: "guardian" },
      { label: "Main member", value: "main_member" },
      { label: "Funeral parlour", value: "funeral_parlour" },
      { label: "Niece", value: "niece" },
      { label: "Nephew", value: "nephew" },
      { label: "Trust", value: "trust" },
      { label: "Policyholder", value: "policy_holder" },
      { label: "Friend", value: "friend" },
      { label: "Colleague", value: "colleague" },
      { label: "Acquaintance", value: "acquaintance" },
      { label: "Other", value: "other" },
    ],
  },
  {
    label: "Phone number",
    type: "phone",
    name: "phone",
    required: true,
  },
];

export const deceasedInputs = (memberDetails: any) => {
  let memberIds: { label: any; value: any }[] = [
    { label: "Select", value: "" },
  ];
  function extractIds(obj: any, parentKey?: string) {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => {
            extractIds(item, key);
          });
        } else {
          extractIds(obj[key], key);
        }
      } else if (key === "id") {
        const label = parentKey
          ? `${obj?.firstName} ${obj?.lastName} - (${parentKey})`
          : "main member";
        memberIds.push({ label, value: obj[key] });
      }
    }
  }
  extractIds(memberDetails);
  const inputs = [
    {
      label: "Select member",
      type: "select",
      name: "deceasedMemberId",
      required: false,
      options: memberIds,
    },
    {
      label: "Deceased individual",
      type: "select",
      name: "deceasedIndividual",
      required: false,
      options: [
        { label: "Select", value: "" },
        { label: "Main insured member", value: "MAIN" },
        { label: "Other insured member", value: "OTHER" },
      ],
    },
    {
      label: "First name",
      type: "text",
      name: "firstName",
      required: false,
      disabled: true,
    },
    {
      label: "Last name",
      type: "text",
      name: "lastName",
      required: false,
      disabled: true,
    },
    {
      label: "South africa ID number",
      type: "said",
      name: "said",
      required: false,
      disabled: true,
    },
  ];
  return inputs;
};

export const getIncidentInputs = (packageName: string) => {
  let commonInputs = [
    {
      label: "Claim created date",
      type: "date",
      name: "claimCreatedDate",
      required: true,
      disabled: true,
    },
    {
      label: "Date of death/Incident date ",
      type: "date",
      name: "dateOfDeath",
      required: true,
    },
    {
      label: "Cause",
      type: "select",
      name: "cause",
      required: false,
      options: [
        { label: "Select", value: "" },
        { label: "Unknown", value: "Unknown" },
        { label: "Aids", value: "Aids" },
        { label: "Alzheimers disease", value: "Alzheimers_disease" },
        { label: "Anaemia", value: "Anaemia" },
        { label: "Aneurism", value: "Aneurism" },
        { label: "Asthama", value: "Asthama" },
        { label: "Assault", value: "Assault" },
        { label: "Burns", value: "Burns" },
        { label: "Cancer-breast", value: "Cancer_breast" },
        { label: "Cancer-vaginal", value: "Cancer_vaginal" },
        { label: "Cancer-genito-urinary", value: "Cancer_genito_urinary" },
        { label: "Cancer-stomach", value: "Cancer_stomach" },
        { label: "Cancer-lung", value: "Cancer_lung" },
        { label: "Cancer-pancreas", value: "Cancer_pancreas" },
        { label: "Cancer-renal", value: "Cancer-renal" },
        { label: "Cancer-tumour", value: "Cancer-tumour" },
        { label: "Coad", value: "Coad" },
        {
          label: "Congestive cardiac failure",
          value: "Congestive_cardiac_failure",
        },
        { label: "Copd", value: "Copd" },
        { label: "Cva", value: "Cva" },
        { label: "Dementia", value: "Dementia" },
        { label: "Depression", value: "Depression" },
        { label: "Drowning", value: "Drowing" },
        { label: "Electrocution", value: "Electrocution" },
        {
          label: "Fraud beneficiary involvement",
          value: "Fraud_beneficiary_involement",
        },
        {
          label: "Fraud falsification of document",
          value: "Fraud_falsification_of_document",
        },
        {
          label: "Fraud syndicate involvement",
          value: "Fraud_syndicate_involvement",
        },
        {
          label: "Gastro intestinal related",
          value: "Gastro_intestinal_related",
        },
        {
          label: "Genetic disorder-down syndrome",
          value: "Genetic_disorder_down_syndrome",
        },
        {
          label: "Genetic disorder-other",
          value: "Genetic_disorder_other",
        },
        { label: "Heart attack", value: "Heart_attack" },
        { label: "Hypertension", value: "Hypertension" },
        { label: "Injury", value: "Injury" },
        { label: "Kidney failure", value: "Kidney_failure" },
        { label: "Lupus", value: "Lupus" },
        { label: "Murder shooting", value: "Murder_shooting" },
        { label: "Murder stabbing", value: "Murder_stabbing" },
        { label: "Mva bicycle", value: "Mva_bicycle" },
        { label: "Mva driver", value: "Mva_river" },
        { label: "Mva moterbike", value: "Mva_moter_bike" },
        { label: "Mva passenger", value: "Mva_passenger" },
        { label: "Mva pedestrian", value: "Mva_pedestrian" },
        { label: "Mva public transport", value: "Mva_public_transport" },
        { label: "Renal failure", value: "Renal failure" },
        { label: "Respiratory-ptb", value: "Respiratory_ptb" },
        { label: "Rheumatoid arthritis", value: "Rheumatoid_arthritis" },
        { label: "Rvd", value: "Rvd" },
        { label: "Stepticaemia", value: "Septicaemia" },
        {
          label: "Spinal / back conditions",
          value: "Spianl_back_conditions",
        },
        { label: "Stroke", value: "Stroke" },
        { label: "Sucide", value: "sucide" },
        {
          label: "Urinary tract / kidneys-bladder disorder",
          value: "Urinary_tract_kidneys_bladder_disorder",
        },
        {
          label: "Urinary tract / kidneys-gallbladder",
          value: "Urinary_tract_kidneys_gallbladder",
        },
        { label: "Meternity / Pregnancy", value: "Meternity_pregnancy" },
        {
          label: "Violation of the law comitting crime",
          value: "Violation_of_the_law_committing_crime",
        },
        {
          label: "Violation of the law over the blood alcohol level",
          value: "Violation_of_the_law_over_the_blood_alcohol_level",
        },
        { label: "Under investigation", value: "Under_investigation" },
      ],
    },
    {
      label: "Police case number",
      type: "text",
      name: "policeCaseNumber",
      required: false,
    },
    {
      label: "Reporting police station",
      type: "text",
      name: "reportingPoliceStation",
      required: false,
    },
    {
      label: "Insert incident description",
      type: "text",
      name: "incidentDescription",
      required: false,
    },
  ];
  switch (packageName) {
    case packageNames.funeral:
      const claimType = {
        label: "Claim type",
        type: "select",
        name: "funeralClaimType",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Accidental death", value: "ACCIDENT" },
          { label: "Natural death", value: "NATURAL" },
        ],
      };
      const referenceNumber = {
        label: "DHA1663 reference number",
        type: "text",
        name: "referenceNumber",
        required: false,
      };
      return [...commonInputs, claimType, referenceNumber];
      break;
    case packageNames.creditLifeMotor:
      const placeOfDeath = {
        label: "Place of death",
        type: "text",
        name: "placeOfDeath",
        required: false,
      };
      const creditLifeClaimType = {
        label: "Claim type",
        type: "select",
        name: "creditLifeClaimType",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Accidental death", value: "ACCIDENT" },
          { label: "Natural death", value: "NATURAL" },
        ],
      };
      return [...commonInputs, placeOfDeath, creditLifeClaimType];
      break;
    case packageNames.creditLifeDevice:
      let placeOfDeathInput = {
        label: "Place of death",
        type: "text",
        name: "placeOfDeath",
        required: true,
      };
      const creditLifeClaimTypeInput = {
        label: "Claim type",
        type: "select",
        name: "creditLifeClaimType",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Accidental death", value: "ACCIDENT" },
          { label: "Natural death", value: "NATURAL" },
        ],
      };
      return [...commonInputs, placeOfDeathInput, creditLifeClaimTypeInput];
      break;
    case packageNames.retailDeviceCreditLife:
      const placeOfDeathInputRetail = {
        label: "Place of death",
        type: "text",
        name: "placeOfDeath",
        required: true,
      };
      const creditLifeClaimTypeInputRetail = {
        label: "Claim type",
        type: "select",
        name: "creditLifeClaimType",
        required: true,
        options: [
          { label: "Select", value: "" },
          { label: "Accidental death", value: "ACCIDENT" },
          { label: "Natural death", value: "NATURAL" },
        ],
      };
      return [
        ...commonInputs,
        placeOfDeathInputRetail,
        creditLifeClaimTypeInputRetail,
      ];
      break;
  }
};

export const claimIncidentInputs = [];

export const doctorsInput = [
  {
    label: "Doctors name",
    type: "text",
    name: "doctorName",
    required: false,
  },
  {
    label: "Doctors contact",
    type: "phone",
    name: "doctorContactNumber",
    required: false,
  },
  {
    label: "Doctors address",
    type: "text",
    name: "doctoreAddress",
    required: false,
  },
];

export const checkListColumn: IUserColumn[] = [
  { key: "condition", label: "Conditions" },
  { key: "checked", label: "Checked" },
];

export const getClaimCheckList = async (ctx: any, packageName: PackageName) => {
  const currentCheckList = await ctx.prisma.claimCheckListDefinitions.findMany({
    where: {
      packageName: packageName,
    },
  });
  return currentCheckList;
};

export const claimDeviceIncidentInputs = [
  {
    label: "Claim created date",
    type: "date",
    name: "claimCreatedDate",
    required: true,
    disabled: true,
  },
  {
    label: "Incident date ",
    type: "date",
    name: "incidentDate",
    required: true,
  },
  {
    label: "Claim type",
    type: "select",
    name: "claimType",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Screen damage", value: "SCREEN_DAMAGE" },
      { label: "Hardware damage", value: "HARDWARE_DAMAGE" },
      { label: "Software damage", value: "SOFTWARE_DAMAGE" },
      { label: "Lost", value: "LOST" },
    ],
  },
  {
    label: "Enter incident description",
    type: "textarea",
    name: "incidentDescription",
    required: false,
  },
];

export const claimDeviceInputs = [
  {
    label: "Cause",
    name: "cause",
    type: "text",
    required: false,
  },
  {
    label: "Address of lost",
    name: "address",
    type: "text",
    required: true,
  },
  {
    label: "Suburb",
    name: "suburb",
    type: "text",
    required: false,
  },
  {
    label: "Province",
    name: "province",
    type: "text",
    required: true,
  },
  {
    label: "Postal code",
    name: "postalCode",
    type: "text",
    required: false,
  },
  {
    label: "Police case number",
    type: "text",
    name: "policeCaseNumber",
    required: true,
  },
  {
    label: "Reporting police station",
    type: "text",
    name: "reportingPoliceStation",
    required: true,
  },
];
