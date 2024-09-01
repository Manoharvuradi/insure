//imports
//interfaces
//Main render function

//roles related constants
// api related use mutations and use queries
//useState variables
//any other functions or constants
//useEffects
//return(HTMLElement)

import React, { useEffect, useMemo, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";
import {
  employeeFuneralAges,
  packageNames,
  prospectTabs,
} from "~/utils/constants";
import TabsBar from "~/common/tabs";
import Loader from "~/common/loader";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Modal from "~/common/Modal";
import ImagePreview from "~/common/imagePreview";
import UploadFile from "~/common/uploadFile";
import { IBeneficiary, IMember } from "~/interfaces/policy";
import AddNoteModal from "../addNoteModal";
import ShowNotesAndActivity from "~/common/showNotesAndActivity";
import {
  CoverageOptions,
  LeadStatus,
  PolicyStatus,
  PremiumFrequency,
  SchemeType,
  UserRole,
} from "@prisma/client";
import { toast } from "react-toastify";
import { BsArrowRightSquareFill } from "react-icons/bs";
import ErrorComponent from "~/common/errorPage";
import { useSession } from "next-auth/react";
import { IEditBeneficiary } from "../application";
import { AiOutlineDelete } from "react-icons/ai";
import FormComponent from "~/common/form";
import {
  LeadStatusValues,
  childrenEdit,
  deviceMaxPrice,
  editApplicationIdentification,
  editBeneficiaryDetails,
  extendedFamilyEdit,
  getEditPolicyData,
  notesInput,
  policyDataEdit,
  policyStillBornInputs,
} from "~/utils/constants/policy";
import { IEvent } from "~/interfaces/common/form";
import AddButton from "~/common/buttons/addButton";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import Button from "~/common/buttons/filledButton";
import InputField from "~/common/form/input";
import { IUploadFile } from "~/interfaces/common";
import { paymentInputs } from "~/utils/constants/payments";
import {
  dateOfBirthValidation,
  dateSAIDvalidation,
  validateAge,
  validateEmail,
  validateFrom,
  validatePhoneNum,
  validateSAIDNum,
} from "~/utils/helpers/validations";
import { bankOptions } from "~/utils/constants/bankOptions";
import { checkRequiredFields } from "~/utils/helpers/errors";
import NoAccessComponent from "~/common/noAccess";
import ShowDropdown from "~/common/showDropDown";
import SecondaryButton from "~/common/buttons/secondaryButton";
import PolicyDataComponent from "~/common/policyData";
import { claimantFormInputs } from "~/utils/constants/claims";
import { IClaimantFormValues } from "~/interfaces/claimComplaint";
import PolicyScheduleUrl from "~/common/policyScheduleUrl";
import {
  creditLifeDeviceInputs,
  creditLifeInputs,
  deviceDetailsInputs,
} from "~/utils/constants/application";
import Status from "~/common/status";
import ArchivedComponent from "~/common/archivedText";

export type IEditPolicy = {
  id?: string;
  policyNumber?: string;
  policyholderId?: string;
  applicationId?: string;
  status?: PolicyStatus;
  options?: CoverageOptions;
  billingFrequency?: PremiumFrequency;
  policyData?: {
    members?: {
      spouse?: {
        firstName: string;
        lastName: string;
      };
      mainMember?: any;
      children?: any;
      extendedFamily?: any;
    };
    packageName?: any;
  };
  sumAssured?: number | null;
  basePremium?: number | null;
  billingDay?: number;
  billingAmount?: number | null;
  nextBillingDate?: Date | null;
  nextBillingAmount?: number | null;
  balance?: number | null;
  startDate?: any;
  endDate?: any;
  schemeType?: SchemeType | null;
  renewalDate?: any;
  autoRenewal?: boolean | null;
  appData?: any;
  isArchived?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdById?: number | null;
  updatedById?: number | null;
  beneficiaries?: any;
  createdBy?: any;
  updatedBy?: any;
};

interface IDetails {
  claims: Array<{
    approvalStatus: string;
    claimStatus: string;
  }>;
}

function LeadView(props: any) {
  const router = useRouter();
  const leadId = router.query.id as string;
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const {
    isLoading,
    data,
    error,
    refetch: dataRefetch = () => {},
  } = currentRoleAccessLevels?.Leads?.canView
    ? api.lead.show.useQuery(leadId)
    : { isLoading: false, data: null as any, error: null };

  let {
    isLoading: noteDataLoading,
    data: noteData,
    error: noteError,
    refetch: noteRefetch = () => {},
  } = api.leadNote.findByLeadId.useQuery(router.query.id as string);

  //Activity API
  let {
    data: activityData,
    refetch = () => {},
    error: activityError,
  } = api.leadActivity.findByApplicationId.useQuery(router.query.id as string);

  const { data: deviceCatalogData } = api.deviceCatalog.list.useQuery({
    filter: "true",
  });

  const createFile = api.uploadLibrary.create.useMutation();
  const updateLead = api.lead.update.useMutation();
  const paymentUpdate = api.lead.updatePayment.useMutation();
  const updateBeneficiary = api.lead.updateBeneficiary.useMutation();
  const updateLeadStatus = api.lead.status.useMutation();
  const archivedLead = api.lead.archived.useMutation();
  const deleteBeneficiary = api.beneficiaries.delete.useMutation();
  const submitClaim = api.claim.create.useMutation();
  const addnote = api.leadNote.create.useMutation();

  const [activeTab, setActiveTab] = useState("policyDetails");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileUpload, setFileUpload] = useState<any>([]);
  const [files, setFiles] = useState([{ name: "", type: "", fileUrl: "" }]);
  const [fileStore, setFileStore] = useState<any>([]);
  const [formErrors, setFormErrors] = useState({
    spouse: [{}],
    children: [{}],
    extendedFamily: [{}],
    beneficiaries: [{}],
    paymentMethod: {},
  });
  const [policyData, setPolicyData] = useState({} as any);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<any>();
  const [policyNote, setPolicyNote] = useState({} as any);
  const [showActivitySection, setShowActivitySection] = useState(true);
  const [selectedBar, setSelectedBar] = useState(null);
  const [policyScheduleModalOpen, setPolicyScheduleModalOpen] = useState(false);
  const [beneficiaryEdit, setBeneficiaryEdit] = useState(false);
  const [includeChildren, setIncludeChildren] = useState({
    includeChildren: false,
  });
  const [editBenValid, setEditBenValid] = useState(false);
  const [includeSpouse, setIncludeSpouse] = useState({ includeSpouse: false });
  const [extendedFamily, setExtendedFamily] = useState({
    extendedFamily: false,
  });
  const [disable, setDisable] = useState(false);
  const [alterDisable, setAlterDisable] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>([]);
  const [beneficiaryErrors, setBeneficiaryErrors] = useState<Array<any>>([]);
  const [policyEdit, setPolicyEdit] = useState(false);
  const [paymentEdit, setPaymentEdit] = useState(false);
  const [showIsArchive, setShowIsArchive] = useState(false);
  const [showIsArchivePolicyModel, setShowIsArchivePolicyModel] =
    useState(false);
  const [showRefuseLeadModal, setShowRefuseLeadModal] = useState(false);
  const [showAcceptLeadModal, setShowAcceptLeadModal] = useState(false);
  const [beneficiariesData, setBeneficiariesData] = useState<any[]>([]);
  const [objects, setObjects] = useState<{ [key: string]: any }>({});
  const [arrays, setArrays] = useState<{ [key: string]: any[] }>({});
  const [key, setKey] = useState("");
  const [policyDataNew, setPolicyDataNew] = useState<{ [key: string]: any }>(
    {}
  );
  const [remaining, setRemaining] = useState<{ [key: string]: any }>({});
  const [details, setDetails] = useState<IDetails>({ claims: [] });
  const [policyHolderName, setPolicyHolderName] = useState<string>("");
  const [paymentMethodData, setPaymentMethodData] = useState<{
    [key: string]: any;
  }>({});
  const [paymentToggle, setPaymentToggle] = useState(true);
  const [showDetails, setShowDetails] = useState({
    spouse: false,
    children: false,
    extendedFamily: false,
    paymentMethod: false,
    beneficiaries: false,
    payments: false,
    policyPayments: false,
    documents: false,
  });

  const [createClaim, setCreateClaim] = useState(false);
  const [claimantFormValues, setClaimFormValues] = useState(
    {} as IClaimantFormValues
  );
  const [claimantFormErrors, setClaimantFormErrors] = useState(
    {} as IClaimantFormValues
  );
  const [editPolicyInputs, setEditPolicyInputs] = useState({} as any);
  const [loanSettlement, setLoanSettlement] = useState(0);
  const [fileDisable, setFileDisable] = useState<Boolean>(false);
  const [deviceFormErrors, setDeviceFormErrors] = useState({} as any);
  const [hiddenTabs, setHiddenTabs] = useState([] as string[]);
  const deviceList = deviceCatalogData?.data
    ? Object.keys(deviceCatalogData?.data)
    : [];
  const [deviceInputs, setDeviceInputs] = useState(deviceDetailsInputs);
  const [deviceType, setDevice] = useState({ list: [] as any, selected: "" });
  const [brand, setbrand] = useState({ list: [] as any, selected: "" });
  const [modelName, setModelName] = useState({ list: [] as any, selected: "" });
  const [color, setColor] = useState({ list: [] as any, selected: "" });
  const [count, setCount] = useState(1);
  const [paymentInput, setPaymentInput] = useState(paymentInputs);
  const [notes, setNotes]: any = useState([]);
  const [updatedData, setUpdateData] = useState<{ [key: string]: any }>({});

  const handleSendToApplication = async () => {
    setShowAcceptLeadModal(!showAcceptLeadModal);
    setLoading(true);
    try {
      const mainMember = policyData?.policyData?.members?.mainMember;
      const req: any = {
        isArchived: policyData.isArchived,
        billingDay: Number(policyData?.billingDay),
        ...(data?.packageName === packageNames.funeral && {
          options: policyData?.options,
        }),
        status: LeadStatusValues.inreview,
        billingFrequency: policyData?.billingFrequency ?? "MONTHLY",
        applicationData: generatePolicyData(
          policyData,
          data?.packageName,
          mainMember
        ),
        startDate: new Date(policyData.startDate),
        endDate: new Date(policyData.endDate),
        schemeType: policyData.schemeType ?? "GROUP",
        autoRenewal: policyData.autoRenewal ?? false,
        policyNumber: policyData?.policyNumber,
        policyholderId: policyData?.policyholderId,
      };
      if (paymentMethod[paymentMethod.length - 1]) {
        req.paymentMethod = {
          ...paymentMethod[paymentMethod.length - 1],
          ...(paymentMethod[paymentMethod.length - 1].billingAddress
            ? {
                billingAddress:
                  paymentMethod[paymentMethod.length - 1].billingAddress,
              }
            : { billingAddress: "" }),
          externalReference: "",
        };
      }
      const sendToApplication = await updateLead.mutateAsync({
        id: data?.id as string,
        body: req,
      });
      if (sendToApplication) {
        toast.success("Prospect sent to application");
      } else {
        toast.error("Failed To Update Prospect Status");
      }
    } catch (err) {
      toast.error("Failed To Update Prospect Status");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const handleRefuseLead = async () => {
    setShowRefuseLeadModal(!showRefuseLeadModal);
    setLoading(true);
    try {
      const refuseLead = await updateLeadStatus.mutateAsync({
        id: data?.id ?? "",
        status: LeadStatusValues.refused as LeadStatus,
      });
      if (refuseLead) {
        toast.success("Prospect refused Successfully");
        router.push("/lead/list");
        setLoading(false);
      } else {
        toast.error("Failed to refuse Prospect");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to refuse Prospect");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const updateFieldOptions = (
    fieldName: string,
    newOptions: { label: string; value: string }[]
  ) => {
    setDeviceInputs((prevState) =>
      prevState.map((input) => {
        if (input.name === "deviceUniqueNumber") {
          return {
            ...input,
            disabled: session.data?.user?.roles?.includes("SUPER_ADMIN")
              ? false
              : true,
          };
        }
        if (input.name === fieldName && input.type === "select") {
          return { ...input, options: newOptions };
        }
        return input;
      })
    );
  };

  const modalClose = () => {
    setSelectedBar(null);
    setImageModalOpen(false);
  };

  const imageOverview = (index: any) => {
    setImageModalOpen(true);
    setSelectedBar(index);
  };

  const closeModal = () => {
    setFileUpload([]);
    setIsModalOpen(false);
  };

  const beneficiaryEditSave = async () => {
    setLoading(true);
    const req: any = {
      beneficiaries: beneficiaries.map((beneficiary: any) => {
        return {
          ...beneficiary,
          percentage: parseInt(beneficiary?.percentage),
          ...(beneficiary?.dateOfBirth && {
            dateOfBirth: new Date(beneficiary?.dateOfBirth),
          }),
          phone: beneficiary?.phone.replace(/[\s-]/g, ""),
        };
      }),
    };
    try {
      const applicationRes = await updateBeneficiary.mutateAsync({
        id: data?.id ?? ("" as string),
        body: req,
      });
      if (applicationRes) {
        setBeneficiaryEdit(false);
        setBeneficiaries(
          applicationRes.beneficiaries?.map((beneficiary: any) => {
            return {
              ...beneficiary,
              ...(beneficiary?.dateOfBirth && {
                dateOfBirth: dateConversion(beneficiary.dateOfBirth),
              }),
            };
          })
        );
        setPolicyData({
          ...policyData,
          beneficiaries: applicationRes.beneficiaries,
        });
        setLoading(false);
        toast.success("Beneficiary updated successfully");
      } else {
        setLoading(false);
        toast.error("Failed to  update Beneficiary");
      }
    } catch (err: any) {
      toast.error("Failed to  update Beneficiary");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const generatePolicyData = (
    policyData: any,
    packageName: string,
    mainMember?: any
  ) => {
    switch (packageName) {
      case packageNames.creditLifeMotor:
        return {
          packageName: policyData?.packageName,
          creditLife: {
            ...policyData.policyData.creditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              policyData.policyData.creditLife.outstandingSettlementBalance
            ),
            ...(loanSettlement && {
              loanSettlementAtInception: Number(loanSettlement),
            }),
          },
        };
      case packageNames.funeral:
        const formattedData = {
          packageName: policyData?.packageName,
          members: {
            ...policyData?.policyData?.members,
            mainMember: {
              ...policyData?.policyData?.members?.mainMember,
              dateOfBirth: new Date(mainMember?.dateOfBirth),
              ...(mainMember?.createdAt
                ? { createdAt: new Date(mainMember?.createdAt) }
                : {}),
              ...(mainMember?.updatedAt
                ? { updatedAt: new Date(mainMember?.updatedAt) }
                : {}),
            },
          },
        };
        if (includeSpouse.includeSpouse) {
          formattedData.members.spouse =
            policyData?.policyData.members.spouse.map((spouse: any) => {
              return {
                // ...spouse,
                firstName: spouse.firstName,
                lastName: spouse.lastName,
                ...(spouse.email !== "" && { email: spouse.email }),
                said: spouse.said,
                dateOfBirth: new Date(spouse?.dateOfBirth),
                ...(spouse.createdAt
                  ? { createdAt: new Date(spouse.createdAt) }
                  : {}),
                ...(spouse.updatedAt
                  ? { updatedAt: new Date(spouse.updatedAt) }
                  : {}),
              };
            });
        }
        if (includeChildren.includeChildren) {
          formattedData.members.children =
            policyData?.policyData?.members?.children?.map((child: any) => {
              if (child?.isStillBorn) {
                const { dateOfBirth, ...restChild } = child;
                return {
                  firstName: restChild.firstName,
                  lastName: restChild.lastName,
                  age: 0,
                  isDisabled: restChild.isDisabled,
                  isStillBorn: restChild.isStillBorn,
                  isStudying: restChild.isStudying,
                  ...(restChild.createdAt
                    ? { createdAt: new Date(restChild.createdAt) }
                    : {}),
                  ...(restChild.updatedAt
                    ? { updatedAt: new Date(restChild.updatedAt) }
                    : {}),
                };
              } else if (!child?.isStillBorn && child?.dateOfBirth) {
                return {
                  ...child,
                  dateOfBirth: new Date(child?.dateOfBirth),
                  ...(child.createdAt
                    ? { createdAt: new Date(child.createdAt) }
                    : {}),
                  ...(child.updatedAt
                    ? { updatedAt: new Date(child.updatedAt) }
                    : {}),
                };
              } else {
                return child;
              }
            });
        }
        if (extendedFamily.extendedFamily) {
          formattedData.members.extendedFamily =
            policyData?.policyData?.members?.extendedFamily?.map(
              (family: any) => {
                return {
                  // ...family,
                  options: family.options,
                  firstName: family.firstName,
                  lastName: family.lastName,
                  said: family.said,
                  ...(family.email !== "" && { email: family.email }),
                  relation: family.relation ?? "parent",
                  dateOfBirth: new Date(family?.dateOfBirth),
                  ...(family.createdAt
                    ? { createdAt: new Date(family.createdAt) }
                    : {}),
                  ...(family.updatedAt
                    ? { updatedAt: new Date(family.updatedAt) }
                    : {}),
                };
              }
            );
        }
        return formattedData;
      case packageNames.retailDeviceInsurance:
        return {
          packageName: policyData?.packageName,
          deviceData: {
            ...policyData?.applicationData?.deviceData,
            devicePrice: Number(
              policyData?.applicationData?.deviceData?.devicePrice
            ),
          },
        };
      case packageNames.retailDeviceCreditLife:
        return {
          packageName: policyData?.packageName,
          deviceCreditLife: {
            ...policyData.applicationData.deviceCreditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              policyData.applicationData.deviceCreditLife
                .outstandingSettlementBalance
            ),
            ...(loanSettlement && {
              loanSettlementAtInception: Number(loanSettlement),
            }),
          },
        };
      default:
        return null;
    }
  };

  const onLeadEditSave = async () => {
    setLoading(true);
    const mainMember = policyData?.policyData?.members?.mainMember;
    const req: any = {
      isArchived: policyData.isArchived,
      billingDay: Number(policyData?.billingDay),
      ...(data?.packageName === packageNames.funeral && {
        options: policyData?.options,
      }),
      ...(data?.applicationOnHold && { applicationOnHold: false }),
      status:
        data.status == LeadStatusValues.refused
          ? LeadStatusValues.draft
          : policyData.status,
      billingFrequency: policyData?.billingFrequency ?? "MONTHLY",
      applicationData: generatePolicyData(
        policyData,
        data?.packageName,
        mainMember
      ),
      startDate: new Date(policyData.startDate),
      endDate: new Date(policyData.endDate),
      schemeType: policyData.schemeType ?? "GROUP",
      autoRenewal: policyData.autoRenewal ?? false,
      policyNumber: policyData?.policyNumber,
      policyholderId: policyData?.policyholderId,
    };
    if (paymentMethod[paymentMethod.length - 1]) {
      req.paymentMethod = {
        ...paymentMethod[paymentMethod.length - 1],
        ...(paymentMethod[paymentMethod.length - 1].billingAddress
          ? {
              billingAddress:
                paymentMethod[paymentMethod.length - 1].billingAddress,
            }
          : { billingAddress: "" }),
        externalReference: "",
      };
    }
    try {
      const updatePolicyRes = await updateLead.mutateAsync({
        id: data?.id as string,
        body: req,
      });
      let res;
      if (updatePolicyRes) {
        res = await addnote.mutateAsync({
          leadsId: data?.id as string,
          title: policyNote?.title,
          description: policyNote?.description,
        });
      }
      if (updatePolicyRes && res) {
        setPolicyEdit(false);
        setPolicyNote({});
        toast.success("Prospect updated successfully");
      } else {
        toast.error("Failed to update Prospect");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update Prospect");
    } finally {
      setLoading(false);
      handleDataRefetch();
      noteRefetch();
      refetch();
    }
  };

  const onPaymentUpdate = async () => {
    setLoading(true);
    const req: any = {
      paymentMethodType: "DEBIT_FROM_BANK_ACCOUNT",
      collectionType:
        paymentMethod[paymentMethod.length - 1].collectionType || "",
      accountHolder:
        paymentMethod[paymentMethod.length - 1].accountHolder || "",
      bank: paymentMethod[paymentMethod.length - 1].bank || "",
      branchCode: paymentMethod[paymentMethod.length - 1].branchCode || "",
      accountNumber:
        paymentMethod[paymentMethod.length - 1].accountNumber || "",
      accountType: paymentMethod[paymentMethod.length - 1].accountType || "",
      externalReference:
        paymentMethod[paymentMethod.length - 1].externalReference || "",
      billingAddress:
        paymentMethod[paymentMethod.length - 1].billingAddress || "",
    };
    try {
      const paymentUpdateResponse = await paymentUpdate.mutateAsync({
        id: data?.id as string,
        body: req,
      });
      if (paymentUpdateResponse) {
        setLoading(false);
        setPaymentEdit(false);
        toast.success("Payment updated successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update payment method");
      }
    } catch (err) {
      toast.error("Failed to update payment method");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const onBeneficiaryEditSave = (event: any) => {
    event.preventDefault();
    let totalPercentage: number = 0;
    beneficiaries.map((beneficiary: IBeneficiary, index: number) => {
      totalPercentage += Number(beneficiary.percentage);
    });
    if (totalPercentage === 100) {
      beneficiaryEditSave();
    } else if (totalPercentage < 100) {
      toast.warning(
        "Add more beneficiaries,Total beneficiary percentage should be 100%",
        {
          toastId: "lesspercentageError",
        }
      );
    } else if (totalPercentage > 100) {
      toast.warning(
        "Remove beneficiaries,Total beneficiary percentage should be 100%",
        {
          toastId: "morepercentageError",
        }
      );
    }
  };

  const onModalClose = () => {
    let totalPercentage: number = 0;
    beneficiaries.map((beneficiary: IBeneficiary, index: number) => {
      totalPercentage += Number(beneficiary.percentage);
    });
    if (totalPercentage === 100) {
      setBeneficiaryEdit(false);
      handleDataRefetch();
    } else if (totalPercentage < 100) {
      toast.warning(
        "Add more beneficiaries,Total beneficiary percentage should be 100%",
        {
          toastId: "lesspercentageError",
        }
      );
    } else if (totalPercentage > 100) {
      toast.warning(
        "Remove beneficiaries,Total beneficiary percentage should be 100%",
        {
          toastId: "morepercentageError",
        }
      );
    }
  };

  const archivePolicy = async () => {
    setShowIsArchivePolicyModel(!showIsArchivePolicyModel);
    setLoading(true);
    try {
      const archivedPolicy = await archivedLead.mutateAsync({
        id: data?.id ?? "",
      });
      if (archivedPolicy) {
        router.push("/lead/list");
        setLoading(false);
      } else {
        toast.error("Failed to archive Prospect");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to archive Prospect");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const handleEditPolicyDataChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    const form: any = { ...policyData };
    if (name == "autoRenewal") {
      form[name] = checked;
    } else {
      form[name] = value;
    }
    setPolicyData({ ...form });
  };

  const handleCheckbox = (event: IEvent, index: number = 0) => {
    const { name, checked } = event.target;
    setIncludeChildren({ includeChildren: checked as boolean });

    const form: any = { ...policyData };

    if (!checked) {
      form.policyData.members.children = [];
    } else if (
      !form.policyData.members.children ||
      form.policyData.members.children.length === 0
    ) {
      form.policyData.members["children"] = [
        {
          firstName: "",
          lastName: "",
          isStudying: false,
          isDisabled: false,
          isStillBorn: false,
        },
      ];
    }

    setPolicyData(form);
  };

  const handleIncludeSpouse = (event: IEvent, index: number = 0) => {
    const { name, checked } = event.target;
    setIncludeSpouse({ includeSpouse: checked as boolean });

    const form: any = { ...policyData };

    if (!checked) {
      form.policyData.members.spouse = [];
    } else if (
      !form.policyData.members.spouse ||
      form.policyData.members.spouse.length === 0
    ) {
      form.policyData.members["spouse"] = [
        {
          firstName: "",
          lastName: "",
          email: "",
        },
      ];
    }
    setPolicyData(form);
  };

  const handleEditSpouse = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const errors = { ...formErrors };
    const updatedPolicyData = { ...policyData };
    if (!updatedPolicyData.policyData.members.spouse) {
      updatedPolicyData.policyData.members.spouse = [{}];
    }
    const spouse = updatedPolicyData.policyData.members.spouse[index];
    spouse[name] = value;
    let dateOfBirth;
    if (name === "said") {
      let errorMessage = "";
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        const age = validateAge(dateOfBirth);

        if (
          age < employeeFuneralAges.spouse.minAge ||
          (!spouse.id ? age > employeeFuneralAges.spouse.maxAge : false)
        ) {
          errorMessage = `Spouse age should be between ${employeeFuneralAges.spouse.minAge} and ${employeeFuneralAges.spouse.maxAge}`;
        }
      } else if (value !== "") {
        errorMessage = "Invalid SA-ID";
        dateOfBirth = "";
      }

      errors.spouse[index] = {
        ...errors.spouse[index],
        [name]: errorMessage,
      };

      spouse.dateOfBirth = dateOfBirth;
    }

    if (name === "email") {
      if (validateEmail(value) || value == "") {
        errors.spouse[index] = {
          ...errors.spouse[index],
          [name]: "",
        };
      } else {
        errors.spouse[index] = {
          ...errors.spouse[index],
          [name]: "Invalid email",
        };
      }
    }

    setFormErrors({ ...errors });
    setPolicyData({ ...updatedPolicyData });
  };

  const addNewSpouse = () => {
    const updatedPolicyData = { ...policyData };
    setPolicyData({
      ...updatedPolicyData,
      policyData: {
        ...updatedPolicyData?.policyData,
        members: {
          ...updatedPolicyData?.policyData?.members,
          spouse: [...updatedPolicyData?.policyData?.members?.spouse, {}],
        },
      },
    });
  };

  const deleteSpouse = (index: number) => {
    const slicedData = { ...policyData };
    slicedData.policyData.members.spouse.splice(index, 1);
    formErrors.spouse.splice(index, 1);
    if (slicedData.policyData.members.spouse.length == 0) {
      setIncludeSpouse({ includeSpouse: false });
    }
    setPolicyData({ ...slicedData });
  };

  const handleExtendedFamilyCheckbox = (event: IEvent, index: number = 0) => {
    const { name, checked } = event.target;
    setExtendedFamily({ extendedFamily: checked as boolean });

    const form: any = { ...policyData };

    if (!checked) {
      form.policyData.members.extendedFamily = [];
    } else if (
      !form.policyData.members.extendedFamily ||
      form.policyData.members.extendedFamily.length === 0
    ) {
      form.policyData.members["extendedFamily"] = [
        {
          firstName: "",
          lastName: "",
          email: "",
          relation: "",
        },
      ];
    }

    setPolicyData(form);
  };

  const handleEditChildrenChange = (e: IEvent, index: number = 0) => {
    const { name, value, checked } = e.target;
    const errors = { ...formErrors };
    const updatedPolicyData = { ...policyData };
    if (!updatedPolicyData.policyData.members.children) {
      updatedPolicyData.policyData.members.children = [{}];
    }
    const child = updatedPolicyData.policyData.members.children[index];
    child[name] = value;
    let dateOfBirth;
    const {
      minAge,
      maxAge,
      studyingMaxAge,
      studyingMinAge,
      disabledMinAge,
      disabledMaxAge,
    } = employeeFuneralAges.children;
    let errorMessage = "";
    dateOfBirth = dateSAIDvalidation(child?.said?.substring(0, 6) ?? "");
    const age = validateAge(dateOfBirth);
    switch (name) {
      case "said":
        if (validateSAIDNum(value)) {
          if (
            age < minAge ||
            (age > maxAge && !child.isDisabled && !child.isStudying)
          ) {
            // < 0 & >21
            errorMessage = `Children age should be between ${minAge} and ${maxAge}`;
          }
          if (
            age <= studyingMaxAge && age >= studyingMinAge
              ? !(child.isStudying || child.isDisabled)
              : false
          ) {
            errorMessage = `This age is allowed for children if they are studying or disabled.`;
          } else if (
            age >= disabledMinAge && age <= disabledMaxAge
              ? !child.isDisabled
              : false
          ) {
            errorMessage = `This age is allowed only for disabled children.`;
          } else {
            errorMessage = "";
          }
        } else if (value !== "") {
          errorMessage = "Invalid SA-ID";
          dateOfBirth = "";
        }
        errors.children[index] = {
          ...errors.children[index],
          [name]: errorMessage,
        };
        child.dateOfBirth = dateOfBirth;
        break;
      case "isStudying":
        child[name] = checked;
        if (checked) {
          child.isDisabled = false;
        }
        if (age <= studyingMaxAge && age >= studyingMinAge && !checked) {
          //22-25
          errorMessage = `This age is allowed for children if they are studying or disabled.`;
        } else if (
          age <= disabledMaxAge &&
          age >= disabledMinAge &&
          !child.isDisabled
        ) {
          // >25
          errorMessage = `This age is allowed only for disabled children.`;
        } else {
          errorMessage = "";
        }
        errors.children[index] = {
          ...errors.children[index],
          said: errorMessage,
        };
        break;
      case "isDisabled":
        child[name] = checked;
        if (checked) {
          child.isStudying = false;
        }
        if (age <= studyingMaxAge && age >= studyingMinAge && !checked) {
          //22-25
          errorMessage = `This age is allowed for children if they are studying or disabled.`;
        } else if (age <= disabledMaxAge && age >= disabledMinAge && !checked) {
          // > 25
          errorMessage = `This age is allowed only for disabled children.`;
        } else {
          errorMessage = "";
        }
        errors.children[index] = {
          ...errors.children[index],
          said: errorMessage,
        };
        break;
      case "isStillBorn":
        child.age = 0;
        child[name] = checked;
        break;
      default:
        break;
    }

    if (name === "email") {
      if (validateEmail(value) || !value) {
        errors.children[index] = {
          ...errors.children[index],
          [name]: "",
        };
      } else {
        errors.children[index] = {
          ...errors.children[index],
          [name]: "Invalid email",
        };
      }
    }
    setFormErrors({ ...errors });
    setPolicyData({ ...updatedPolicyData });
  };

  const handleEditExtendedFamily = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const errors = { ...formErrors };
    const updatedPolicyData = { ...policyData };
    if (!updatedPolicyData.policyData.members.extendedFamily) {
      updatedPolicyData.policyData.members.extendedFamily = [{}];
    }
    const extendedFamily =
      updatedPolicyData.policyData.members.extendedFamily[index];
    extendedFamily[name] = value;
    let dateOfBirth;
    if (name === "said") {
      let errorMessage = "";
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        const age = validateAge(dateOfBirth);

        if (
          age < employeeFuneralAges.extendedFamily.minAge ||
          (!extendedFamily.id
            ? age > employeeFuneralAges.extendedFamily.maxAge
            : false)
        ) {
          errorMessage = `Extended Family age should be between ${employeeFuneralAges.extendedFamily.minAge} and ${employeeFuneralAges.extendedFamily.maxAge}`;
        }
      } else if (value !== "") {
        errorMessage = "Invalid SA-ID";
        dateOfBirth = "";
      }

      errors.extendedFamily[index] = {
        ...errors.extendedFamily[index],
        [name]: errorMessage,
      };

      extendedFamily.dateOfBirth = dateOfBirth;
    }
    if (name === "email") {
      if (validateEmail(value) || !value) {
        errors.extendedFamily[index] = {
          ...errors.extendedFamily[index],
          [name]: "",
        };
      } else {
        errors.extendedFamily[index] = {
          ...errors.extendedFamily[index],
          [name]: "Invalid email",
        };
      }
    }
    setFormErrors({ ...errors });
    setPolicyData({ ...updatedPolicyData });
  };

  const handleNotes = (e: IEvent) => {
    const { name, value } = e.target;
    setPolicyNote((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addNewChild = () => {
    const updatedPolicyData = { ...policyData };
    setPolicyData({
      ...updatedPolicyData,
      policyData: {
        ...updatedPolicyData.policyData,
        members: {
          ...updatedPolicyData.policyData.members,
          children: [
            ...updatedPolicyData.policyData.members.children,
            {
              isStudying: false,
              isDisabled: false,
              isStillBorn: false,
            },
          ],
        },
      },
    });
  };

  const deleteChild = (index: number) => {
    const slicedData = { ...policyData };
    slicedData.policyData.members.children.splice(index, 1);
    formErrors.children.splice(index, 1);
    if (slicedData.policyData.members.children.length == 0) {
      setIncludeChildren({ includeChildren: false });
    }
    setPolicyData({ ...slicedData });
  };

  const addNewExtendedMember = () => {
    const updatedPolicyData = { ...policyData };
    setPolicyData({
      ...updatedPolicyData,
      policyData: {
        ...updatedPolicyData?.policyData,
        members: {
          ...updatedPolicyData?.policyData?.members,
          extendedFamily: [
            ...updatedPolicyData?.policyData?.members?.extendedFamily,
            {},
          ],
        },
      },
    });
  };

  const deleteExtendedMember = (index: number) => {
    const slicedData = { ...policyData };
    slicedData.policyData.members.extendedFamily.splice(index, 1);
    formErrors.extendedFamily.splice(index, 1);
    if (slicedData.policyData.members.extendedFamily.length == 0) {
      setExtendedFamily({ extendedFamily: false });
    }
    setPolicyData({ ...slicedData });
  };

  const handleBeneficiaryIdentificationChange = (
    e: IEvent,
    index: number = 0
  ) => {
    const { name, value } = e.target;
    const form: any = [...beneficiaries];
    const error: any = [...beneficiaryErrors];
    form[index].identification[name] = value;

    let dateOfBirth;
    if (name === "said") {
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        error[index] = {
          ...error[index],
          [name]: "",
        };
      } else {
        dateOfBirth = "";
        error[index] = {
          ...error[index],
          [name]: "Invalid SA-ID",
        };
      }
      form[index].dateOfBirth = dateOfBirth;
    }

    if (editBenValid && name === "number") {
      const result = validateSAIDNum(value);
      if (!result) {
        error[index] = {
          ...error[index],
          [name]: "Invalid SA-ID",
        };
      } else {
        error[index] = {
          ...error[index],
          [name]: "",
        };
      }
    }

    setBeneficiaryErrors([...error]);
    setBeneficiaries([...form]);
  };

  const handleBeneficiaryPhoneChange = (
    name: string,
    value: any,
    index: number = 0
  ) => {
    const form: any = [...beneficiaries];
    const error: any = [...beneficiaryErrors];
    form[index][name] = value;
    if (name === "phone") {
      let result = validatePhoneNum(value);
      error[index] = {
        ...error[index],
        [name]: result ? "" : "Invalid phone number",
      };
    }

    setBeneficiaryErrors([...error]);
    setBeneficiaries([...form]);
  };

  const handleBeneficiaryChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = [...beneficiaries];
    const error: any = [...beneficiaryErrors];

    form[index][name] = value;

    if (name == "email") {
      const result = validateEmail(value);
      error[index] = {
        ...error[index],
        [name]: result ? "" : "Invalid email",
      };
    }
    if (name == "dateOfBirth") {
      const result = dateOfBirthValidation(value);
      error[index] = {
        ...error[index],
        [name]: result ? "" : "Invalid date of birth",
      };
    }
    setBeneficiaryErrors([...error]);
    setBeneficiaries([...form]);
  };

  const addNewMember = () => {
    setBeneficiaries([...beneficiaries, { identification: {} }]);
    setBeneficiaryErrors([...beneficiaryErrors, { identification: {} }]);
  };

  const deleteMember = async (index: number) => {
    if (beneficiaries[index].id) {
      setLoading(true);
      try {
        const deletedBeneficiary = await deleteBeneficiary.mutateAsync({
          id: beneficiaries[index].id,
        });
        if (deletedBeneficiary) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error("Unable to delete beneficiary please try again later");
      } finally {
        setLoading(false);
        handleDataRefetch();
      }
    }
    const beneficiaryDetails = [...beneficiaries];
    beneficiaryDetails.splice(index, 1);
    setBeneficiaries([...beneficiaryDetails]);
    const beneficiariesErrors = [...beneficiaryErrors];
    beneficiariesErrors.splice(index, 1);
    setBeneficiaryErrors([...beneficiariesErrors]);
  };

  const onClickAlterPolicy = () => {
    setPolicyEdit(true);
  };

  const onClickPaymentEdit = () => {
    setPaymentEdit(true);
    if (paymentMethod.length == 0) {
      setPaymentMethod([...paymentMethod, {}]);
    }
  };
  const handleIsArchived = () => {
    setShowIsArchivePolicyModel(!showIsArchivePolicyModel);
  };

  const handleIsRefuseLead = () => {
    setShowRefuseLeadModal(!showRefuseLeadModal);
  };

  const handleIsSendToApplication = () => {
    setShowAcceptLeadModal(!showAcceptLeadModal);
  };

  const handlePaymentDetailsChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    let payment = [...paymentMethod];
    if (!payment) {
      payment = [];
    }
    if (payment.length == 0) {
      payment = [...payment, {}];
    }

    payment[index][name] = value;

    if (name === "bank") {
      if (value === "") {
        payment[index].branchCode = "";
      } else {
        const selectedBank = bankOptions.find((bank) => bank.value === value);
        if (selectedBank) {
          payment[index].branchCode = selectedBank.code;
        }
      }
    }
    setPaymentMethod(payment);
  };

  const handleImagePreviewClose = (index: number) => {
    const removeFileOnClose = [...fileUpload];
    removeFileOnClose.splice(index, 1);
    const convertedFile = [...files];
    convertedFile.splice(index, 1);
    setFileUpload(removeFileOnClose);
    setFiles(convertedFile);
    setButtonDisable(true);
  };

  const imageData = () => {
    const filesCopy: IUploadFile[] = [];
    fileUpload.map((file: any, i: number) => {
      const reader = new FileReader();
      reader?.readAsDataURL(file);
      reader.onload = () => {
        const base64String: any = reader.result;
        filesCopy[i] = {
          name: file.name,
          type: file.type,
          fileUrl: base64String,
          size: file.size / (1024 * 1024),
        };
      };
    });
    setFiles(filesCopy);
  };

  const handleModalOpen = () => {
    setFileUpload([]);
    setIsModalOpen(true);
  };

  const checkFileSize = () => {
    if (fileUpload.length < 1) {
      setButtonDisable(true);
      return;
    }
    for (const item of fileUpload) {
      if (item.size > 8 * 1024 * 1024) {
        setButtonDisable(true);
        return;
      }
    }
  };

  const handleDataRefetch = () => {
    dataRefetch();
  };

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  const handleNoteChange = (e: IEvent, index: number = 0) => {
    let form = { ...note };

    const { name, value } = e.target;
    form[name] = value;
    setNote({ ...form });
  };

  const handleNoteSubmit = async (title: string, description: string) => {
    setLoading(true);
    let res;
    try {
      const res = await addnote.mutateAsync({
        leadsId: router.query.id as string,
        title: title,
        description: description,
      });
      if (res) {
        toast.success("Notes added successfully");
        let copy = [...notes];
        copy.push(res);
        setNotes(copy);
        setNote({ title: "", description: "" });
      } else {
        toast.error("Failed to add notes");
      }
    } catch (error) {
      toast.error("Failed to add notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    setOpen(true);
  };

  const handleDocumentsSubmit = async () => {
    setLoading(true);
    try {
      const uploadingFiles = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            referenceId: leadId,
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            category: "lead",
            createdById: data?.createdById,
          };
          const res = await createFile.mutateAsync(req);
          if (data?.application?.id) {
            const req: any = {
              referenceId: data?.application?.id,
              name: file.name,
              type: file.type,
              fileContent: file.fileUrl,
              category: "application",
              createdById: data?.createdById,
            };
            const res = await createFile.mutateAsync(req);
          }
          if (!res) {
            toast.error("Failed to upload document.");
          }
          return res;
        })
      );
      setFileStore([...fileStore, ...uploadingFiles]);
      setLoading(false);
      setIsModalOpen(false);
      toast.success("Document uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload document.");
      setLoading(false);
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  function flattenObject(obj: { [key: string]: any }): { [key: string]: any } {
    const flattened: { [key: string]: any } = {};

    for (let key in obj) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        const nestedObject = flattenObject(obj[key]);
        for (let nestedKey in nestedObject) {
          flattened[nestedKey] = nestedObject[nestedKey];
        }
      } else {
        flattened[key] = obj[key];
      }
    }
    return flattened;
  }

  const checkProperty = () => {
    setLoading(true);
    if (policyData?.createdBy && policyData?.createdBy !== null) {
      policyData.createdBy =
        data?.createdBy?.firstName + "" + data?.createdBy?.lastName;
    }
    if (policyData?.updatedBy && policyData?.updatedBy !== null) {
      policyData.updatedBy =
        data?.updatedBy?.firstName + "" + data?.updatedBy?.lastName;
    }
  };

  const Tab = ({ label, isActive, onClick }: any) => {
    const tabStyle = isActive
      ? "py-2 px-4 border-b-2 border-blue-500 font-bold text-blue-500 cursor-pointer"
      : "py-2 px-4 cursor-pointer";

    return (
      <div onClick={onClick} className={tabStyle}>
        {label}
      </div>
    );
  };

  const handleFormInputChange = (e: IEvent) => {
    const { name, value } = e.target;
    setClaimFormValues({
      ...claimantFormValues,
      [name]: value,
    });
    if (name == "email") {
      if (validateEmail(value)) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  };

  const handleClaimPhoneNumber = (name: string, value: string) => {
    setDisable(!validatePhoneNum(value));
    setClaimFormValues({
      ...claimantFormValues,
      phone: value,
    });
  };

  const handleClaimSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const errors = validateFrom(claimantFormValues, claimantFormInputs);
    const isFormValid = Object.values(errors).some(Boolean);
    if (isFormValid) {
      setClaimantFormErrors(errors);
      return;
    }
    setCreateClaim(false);
    setLoading(true);
    try {
      const claimResult = await submitClaim.mutateAsync({
        claimant: {
          ...claimantFormValues,
          phone: claimantFormValues.phone.replace(/[\s-]/g, ""),
        },
        claimStatus: "OPEN",
        requestedAmount: 0,
        packageName: data?.packageName,
        policyId: data.id as string,
      });
      if (claimResult) {
        toast.success("Claims created successfully", {
          toastId: "createcomplaintSuccess",
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push(`/claim/${claimResult?.id}/show`);
        }, 2000);
      } else {
        setLoading(false);
        toast.error("Error in creating claim.", {
          toastId: "createClaimError",
          autoClose: 2000,
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to create claim plese try again later");
      setClaimFormValues({} as IClaimantFormValues);
    } finally {
      setClaimFormValues({} as IClaimantFormValues);
      handleDataRefetch();
    }
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  const category = router.pathname.split("/")[1];

  const handleCreditLifeChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setPolicyData({
      ...policyData,
      policyData: {
        ...policyData.policyData,
        creditLife: {
          ...policyData?.policyData?.creditLife,
          [name]: value,
        },
      },
      startDate: dateConversion(data?.startDate),
      nextBillingDate: dateConversion(data?.nextBillingDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });
  };

  const handleDeviceDataChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setPolicyData({
      ...policyData,
      applicationData: {
        ...policyData.applicationData,
        deviceData: {
          ...policyData?.applicationData?.deviceData,
          [name]: name === "isRecentPurchase" ? checked : value,
        },
      },
      startDate: dateConversion(data?.startDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });
    if (name === "devicePrice") {
      setPolicyData({
        ...policyData,
        applicationData: {
          ...policyData.applicationData,
          deviceData: {
            ...policyData?.applicationData?.deviceData,
            [name]: value,
          },
        },
      });
      if (value > deviceMaxPrice) {
        setAlterDisable(true);
        setDeviceFormErrors({
          ...deviceFormErrors,
          [name]: "please enter value less then 60000",
        });
      } else {
        setAlterDisable(false);
        setDeviceFormErrors({
          ...deviceFormErrors,
          [name]: "",
        });
      }
    }
    if (name == "deviceUniqueNumber") {
      if (value.length < 6) {
        setAlterDisable(true);
        setDeviceFormErrors({
          ...deviceFormErrors,
          [name]: "Device Unique Number should be at least 6 characters long",
        });
      } else {
        setAlterDisable(false);
        setDeviceFormErrors({ ...deviceFormErrors, [name]: "" });
      }
    }

    if (name == "deviceType") {
      setDevice({ ...deviceType, selected: value });
    }

    if (name == "deviceBrand") {
      setbrand({ ...brand, selected: value });
      setCount(count + 1);
    }

    if (name == "deviceModel") {
      setModelName({ ...modelName, selected: value });
    }

    if (name == "deviceModelColor") {
      setColor({ ...color, selected: value });
    }
  };

  const handleDeviceCreditLife = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setPolicyData({
      ...policyData,
      applicationData: {
        ...policyData.applicationData,
        deviceCreditLife: {
          ...policyData.applicationData.deviceCreditLife,
          [name]: value,
        },
      },
      startDate: dateConversion(data?.startDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });
  };

  useEffect(() => {
    if (data) {
      setColor({
        ...color,
        selected: `${data?.applicationData?.deviceData?.deviceModelColor}`,
      });
      setModelName({
        ...modelName,
        selected: `${data?.applicationData?.deviceData?.deviceModel}`,
      });
      setDevice({
        ...deviceType,
        selected: `${data?.applicationData?.deviceData?.deviceType}`,
      });

      setDevice({ ...deviceType, list: [deviceList] });
      const brandList = deviceCatalogData?.data?.[
        data?.applicationData?.deviceData?.deviceType
      ]
        ? Object.keys(
            deviceCatalogData?.data?.[
              data?.applicationData?.deviceData?.deviceType
            ]
          )
        : [];
      setbrand({
        ...brand,
        list: [brandList],
        selected: `${data?.applicationData?.deviceData?.deviceBrand}`,
      });
      const modelList = deviceCatalogData?.data?.[
        data?.applicationData?.deviceData?.deviceType
      ]?.[data?.applicationData?.deviceData?.deviceBrand]?.map(
        (item: any) => item.modelName
      );
      setModelName({ ...modelName, list: [modelList] });
      const colors = (
        (deviceCatalogData?.data?.[
          data?.applicationData?.deviceData?.deviceType
        ]?.[data?.applicationData?.deviceData?.deviceBrand] as {
          modelName: string;
          colour: string;
        }[]) || []
      )
        .filter(
          (model) =>
            model.modelName === data?.applicationData?.deviceData?.deviceModel
        )
        .map((model) => model.colour);
      const colours = colors?.flatMap((colorString: any) =>
        colorString?.split(",")
      );
      setColor({ ...color, list: [colours] });
      updateFieldOptions("deviceModelColor", [
        { label: "Select", value: "" },
        ...(colours?.map((data: any) => ({
          label: data,
          value: data,
        })) || []),
      ]);
      updateFieldOptions("deviceType", [
        { label: "Select", value: "" },
        ...(deviceList?.map((data: any) => ({
          label: data,
          value: data,
        })) || []),
      ]);
      updateFieldOptions("deviceBrand", [
        { label: "Select", value: "" },
        ...(brandList?.map((data: any) => ({
          label: data,
          value: data,
        })) || []),
      ]);
      updateFieldOptions("deviceModel", [
        { label: "Select", value: "" },
        ...(modelList?.map((data: any) => ({
          label: data,
          value: data,
        })) || []),
      ]);
    }
    setPaymentInput((previnput) =>
      previnput.map((input) => {
        return { ...input, required: true };
        return input;
      })
    );
  }, [data, policyEdit]);

  useEffect(() => {
    if (!deviceType.selected) return;
    delete policyData?.applicationData?.deviceData?.deviceBrand;
    delete policyData?.applicationData?.deviceData?.deviceModel;
    delete policyData?.applicationData?.deviceData?.deviceModelColor;
    const brandList = deviceCatalogData?.data?.[deviceType.selected]
      ? Object.keys(deviceCatalogData?.data?.[deviceType.selected])
      : [];
    setbrand({ ...brand, list: [brandList], selected: "" });
    updateFieldOptions("deviceBrand", [
      { label: "Select", value: "" },
      ...(brandList?.map((data: any) => ({
        label: data,
        value: data,
      })) || []),
    ]);

    updateFieldOptions("deviceModel", [{ label: "Select", value: "" }]);
    updateFieldOptions("deviceModelColor", [{ label: "Select", value: "" }]);
  }, [deviceType.selected]);

  useEffect(() => {
    if (!brand.selected) return;
    if (
      (policyData?.applicationData?.deviceData?.deviceBrand &&
        brand.selected !=
          policyData?.applicationData?.deviceData?.deviceBrand) ||
      count > 1
    ) {
      delete policyData?.applicationData?.deviceData?.deviceModel;
      delete policyData?.applicationData?.deviceData?.deviceModelColor;
    }
    updateFieldOptions("deviceModelColor", [{ label: "Select", value: "" }]);
    const device = deviceType.selected
      ? deviceType.selected
      : data?.applicationData?.deviceData?.deviceType;
    const modelList = deviceCatalogData?.data?.[device]?.[brand.selected]?.map(
      (item: any) => item.modelName
    );
    updateFieldOptions("deviceModel", [
      { label: "Select", value: "" },
      ...(modelList?.map((data: any) => ({
        label: data,
        value: data,
      })) || []),
    ]);
  }, [brand.selected]);

  useEffect(() => {
    delete policyData?.applicationData?.deviceData?.deviceModelColor;
    const device = deviceType.selected
      ? deviceType.selected
      : data?.applicationData?.deviceData?.deviceType;
    const colors = (
      (deviceCatalogData?.data?.[device]?.[brand.selected] as {
        modelName: string;
        colour: string;
      }[]) || []
    )
      .filter((model) => model.modelName === modelName.selected)
      .map((model) => model.colour);
    const colours = colors?.flatMap((colorString: any) =>
      colorString?.split(",")
    );
    updateFieldOptions("deviceModelColor", [
      { label: "Select", value: "" },
      ...(colours?.map((data: any) => ({
        label: data,
        value: data,
      })) || []),
    ]);
  }, [modelName.selected]);

  useEffect(() => {
    document.title = "Telkom Leads";
  }, []);

  useEffect(() => {
    if (policyData.policyScheduleKey) {
      setKey(policyData.policyScheduleKey);
    }
  }, [policyData.policyScheduleKey]);

  useEffect(() => {
    let totalPercentage: number = 0;
    if (beneficiaries && beneficiaries.length > 0) {
      beneficiaries.map((beneficiary: IBeneficiary, index: number) => {
        totalPercentage += Number(beneficiary.percentage);
      });
      if (totalPercentage < 100) {
        setBeneficiaryEdit(true);
        toast.warning(
          "Add more beneficiaries,Total beneficiary percentage should be 100%",
          {
            toastId: "lesspercentageError",
          }
        );
      } else if (totalPercentage > 100) {
        setBeneficiaryEdit(true);
        toast.warning(
          "Remove beneficiaries,Total beneficiary percentage should be 100%",
          {
            toastId: "morepercentageError",
          }
        );
      }
    }
  }, [beneficiaries.length]);

  useEffect(() => {
    if (isLoading) {
      setObjects({});
      setArrays({});
      setRemaining({});
      setBeneficiariesData([]);
    } else {
      Object.entries(details).forEach(([key, value]) => {
        let newKey = key;
        if (Array.isArray(value)) {
          setArrays((prevArrays) => ({ ...prevArrays, [newKey]: value }));
        } else if (typeof value === "object") {
          if (
            key !== "updatedBy" &&
            key !== "createdBy" &&
            key !== "updatedAt" &&
            key !== "createdAt" &&
            key !== "endDate" &&
            key !== "renewalDate" &&
            key !== "startDate"
          ) {
            setObjects((prevObjects) => ({ ...prevObjects, [newKey]: value }));
          } else {
            setRemaining((prevObjects) => ({
              ...prevObjects,
              [newKey]: value,
            }));
          }
        } else {
          if (key === "leadNumber" || key === "packageName") {
            if (key === "leadNumber") {
              newKey = "prospectNumber";
            }
            setPolicyDataNew((prevObjects) => ({
              ...prevObjects,
              [newKey]:
                value === "EMPLOYEE_DEVICE_CREDITLIFE"
                  ? "EMPLOYEE_DEVICE_CREDIT_LIFE"
                  : value,
            }));
          } else {
            setRemaining((prevObjects) => ({
              ...prevObjects,
              [newKey]: value,
            }));
          }
        }
      });
    }
  }, [isLoading, details]);

  useEffect(() => {
    const createdDate = dateConversion(remaining.createdAt);
    const updatedDate = dateConversion(remaining.updatedAt);
    const endDate = dateConversion(remaining?.endDate);
    const renewalDate = dateConversion(remaining?.renewalDate);
    const startDate = dateConversion(remaining?.startDate);
    const createdBy = remaining.createdBy
      ? remaining.createdBy?.firstName + " " + remaining?.createdBy?.lastName
      : null;
    const updatedBy = remaining.updatedBy
      ? remaining.updatedBy?.firstName + " " + remaining?.updatedBy?.lastName
      : null;

    const createObject = {
      createdAt: createdDate,
      updatedAt: updatedDate,
      startDate: startDate,
      endDate: endDate,
      renewalDate: renewalDate,
      createdBy: createdBy,
      updatedBy: updatedBy,
    };
    setUpdateData((prevObjects) => ({
      ...prevObjects,
      ...remaining,
      ...createObject,
    }));

    if (data?.leadType == "APPLICATION") {
      let {
        leadNumber,
        status,
        policyholderId,
        claimOnHold,
        claimRejected,
        ...rest
      } = data;
      setUpdateData(rest);
    } else if (data?.leadType == "CLAIM") {
      let {
        leadNumber,
        status,
        policyholderId,
        applicationRejected,
        applicationOnHold,
        ...rest
      } = data;
      setUpdateData(rest);
    }

    const updatedDetails: any = { ...details };

    if ("leadNumber" in updatedDetails) {
      updatedDetails["prospectNumber"] = updatedDetails["leadNumber"];
      delete updatedDetails["leadNumber"];
    }

    if ("leadType" in updatedDetails) {
      updatedDetails["prospectType"] = updatedDetails["leadType"];
      delete updatedDetails["leadType"];
    }
    setUpdateData(updatedDetails);
  }, [remaining]);

  useEffect(() => {
    const words = objects?.policyholder?.firstName.toLowerCase().split(" ");
    const capitalizedWords = words?.map((word: any) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1);
      return firstLetter + restOfWord;
    });
    const holderName =
      capitalizedWords?.join(" ") + " " + objects?.policyholder?.lastName;
    setPolicyHolderName(holderName);
  }, [objects]);

  useEffect(() => {
    setBeneficiariesData([]);
    arrays?.beneficiaries?.map((item: any) => {
      const mergedObject = flattenObject(item);
      delete mergedObject?.policyId;
      setBeneficiariesData((prevData: any[]) => [...prevData, mergedObject]);
    });
  }, [isLoading, details, arrays]);

  useMemo(() => {
    imageData();
    if (fileUpload && fileUpload.length > 0) {
      setButtonDisable(false);
      if (fileDisable) {
        setButtonDisable(true);
      }
    }
    checkFileSize();
    return null;
  }, [fileUpload, fileDisable]);

  useEffect(() => {
    setIncludeChildren({
      includeChildren:
        policyData.policyData?.members?.children?.length > 0 || false,
    });

    setIncludeSpouse({
      includeSpouse:
        policyData.policyData?.members?.spouse?.length > 0 || false,
    });

    setExtendedFamily({
      extendedFamily:
        policyData.policyData?.members?.extendedFamily?.length > 0 || false,
    });
  }, [policyData]);

  useEffect(() => {
    if (data) {
      setDetails(data);
      setFileStore(data.fileIds);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      let alterData = data as any;
      if (data.paymentMethod && data?.paymentMethod?.length > 0) {
        const paymentMethodData = data.paymentMethod;
        paymentMethodData?.map((item: any) => {
          delete item.policyId;
          delete item.policyholderId;
        });
        setPaymentMethod(paymentMethodData);
        delete alterData.paymentMethod;
      }
      switch (data?.packageName) {
        case packageNames.funeral:
          const policyData = {
            ...alterData,
            policyData: {
              ...alterData?.policyData,
              members: {
                ...alterData?.policyData?.members,
                mainMember: {
                  ...alterData?.policyData?.members?.mainMember,
                  dateOfBirth: dateConversion(
                    alterData?.policyData?.members?.mainMember?.dateOfBirth
                  ),
                },
                ...(alterData?.policyData?.members?.spouse && {
                  spouse: alterData?.policyData?.members?.spouse?.map(
                    (spouse: any) => {
                      return {
                        ...spouse,
                        dateOfBirth: dateConversion(spouse?.dateOfBirth),
                      };
                    }
                  ),
                }),
                children: alterData?.policyData?.members?.children?.map(
                  (child: any) => {
                    return {
                      ...child,
                      dateOfBirth: dateConversion(child?.dateOfBirth),
                    };
                  }
                ),
                extendedFamily:
                  alterData?.policyData?.members?.extendedFamily?.map(
                    (family: any) => {
                      return {
                        ...family,
                        dateOfBirth: dateConversion(family?.dateOfBirth),
                      };
                    }
                  ),
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          };

          setPolicyData(policyData);
          setPolicyData(policyData);
          break;
        case packageNames.creditLifeMotor:
          setPolicyData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              creditLife: {
                ...data?.applicationData?.creditLife,
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.retailDeviceInsurance:
          setPolicyData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              deviceData: {
                ...data?.applicationData?.deviceData,
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.retailDeviceCreditLife:
          setPolicyData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              deviceCreditLife: {
                ...data?.applicationData.deviceCreditLife,
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        default:
          null;
      }

      const beneficiaries = alterData.beneficiaries.map((beneficiary: any) => {
        return {
          ...beneficiary,
          dateOfBirth: dateConversion(beneficiary.dateOfBirth),
        };
      });

      setBeneficiaries(beneficiaries);
      const editPolicyInputsData = getEditPolicyData(data?.packageName);
      setEditPolicyInputs(editPolicyInputsData);
    }
  }, [data]);

  useEffect(() => {
    if (data?.createdBy || data?.updatedBy) {
      checkProperty();
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const canArchive =
        !data?.isArchived && currentRoleAccessLevels?.Leads.canDelete;
      setShowIsArchive(canArchive);
      setLoanSettlement(
        policyData?.policyData?.creditLife?.loanSettlementAtInception
      );
      if (data?.packageName === packageNames.device) {
        const hiddenTabs = ["beneficiaries"];
        setHiddenTabs(hiddenTabs);
      }
    }
  }, [data]);

  useEffect(() => {
    const selectedTab: any = document.getElementById(`${activeTab}`);
    selectedTab?.scrollIntoView({
      block: "center",
      behavior: "smooth",
      inline: "center",
    });
  }, [activeTab]);

  useEffect(() => {
    if (error || activityError || noteError) {
      toast.error("Failed to fetch data");
    }
  }, [error, noteError, activityError]);

  useEffect(() => {
    setDisable(!checkRequiredFields(beneficiaryErrors));
  }, [beneficiaryErrors]);

  useEffect(() => {
    if (checkRequiredFields(formErrors)) {
      setAlterDisable(false);
    } else {
      setAlterDisable(true);
    }
  }, [formErrors]);

  useEffect(() => {
    setPaymentMethodData(paymentMethod[paymentMethod.length - 1]);
    setPaymentToggle(!paymentToggle);
  }, [paymentMethod]);

  useEffect(() => {
    delete paymentMethodData?.updatedAt;
    delete paymentMethodData?.createdAt;
  }, [paymentToggle]);

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  return currentRoleAccessLevels?.Leads?.canView ? (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : !error || !noteError || !activityError ? (
        <div className={`flex flex-row `}>
          <div className="w-full border-r-2 border-solid border-gray-300">
            <div className="relative flex justify-between border-b">
              <TabsBar
                tabs={prospectTabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleTabChange={handleTabChange}
                hide={hiddenTabs}
              />
              <div className="flex items-center justify-center p-2">
                <BsArrowRightSquareFill
                  className={`${
                    !showActivitySection && "rotate-180"
                  } h-8 w-8 cursor-pointer text-primary-blue transition duration-300 hover:text-hover-blue`}
                  aria-hidden="true"
                  onClick={() => setShowActivitySection(!showActivitySection)}
                />
              </div>
            </div>
            <div
              className={`flex h-[calc(100vh-65px)] flex-col gap-5 overflow-auto p-4 scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md ${
                data?.isArchived ? "bg-gray-300" : "bg-[#f3f7fa]"
              }`}
            >
              <div
                className={`rounded-10 p-4 ${
                  data?.isArchived
                    ? "bg-gray-300 text-gray-500 text-opacity-50"
                    : "bg-white"
                }`}
              >
                <div
                  className="flex items-center justify-between"
                  id="leadDetails"
                >
                  <div className="flex gap-x-3">
                    <h3 className="text-[26px] font-bold leading-9 text-dark-grey">
                      Prospect Details
                    </h3>
                    <Status
                      status={data?.status}
                      page="Lead"
                      applicationOnHold={data?.applicationOnHold}
                      applicationRejected={data?.applicationRejected}
                      claimOnHold={data?.claimOnHold}
                      claimRejected={data?.ClaimRejected}
                    />
                    {data?.isArchived && <ArchivedComponent />}
                  </div>
                  {currentRoleAccessLevels?.Leads?.canUpdate &&
                    !data?.isArchived && (
                      <ActionButtons
                        isVisible={true}
                        alterLead={
                          data?.status == LeadStatusValues.draft &&
                          currentRoleAccessLevels?.Leads?.canUpdate &&
                          !data?.isArchived &&
                          data?.applicationOnHold == false
                        }
                        onClickAlterLead={onClickAlterPolicy}
                        resubmitLead={
                          (data?.status == LeadStatusValues.inreview &&
                            data?.applicationOnHold == true) ||
                          data.status == LeadStatusValues.refused
                        }
                        showAddNotes={true}
                        onClick={handleAddNote}
                        showIsArchive={showIsArchive}
                        onClickIsArchived={handleIsArchived}
                        displayRefuse={
                          data?.status == LeadStatusValues.draft &&
                          props?.userType !== "AGENT"
                        }
                        onClickRefuseLead={handleIsRefuseLead}
                        displaySendToApplication={
                          data?.status == LeadStatusValues.draft &&
                          props?.userType !== "AGENT"
                        }
                        onClickSendToApplication={handleIsSendToApplication}
                      />
                    )}
                </div>
                <div className="mt-6">
                  {policyDataNew ? (
                    <DescriptionList data={policyDataNew} />
                  ) : (
                    ""
                  )}
                  <div className="mt-2 grid w-full grid-cols-2 justify-between justify-items-center gap-x-[45px] gap-y-4">
                    <div className="grid w-full grid-cols-2">
                      <div className="text-sm font-semibold leading-6 text-gray-900">
                        Policyholder :
                      </div>
                      <div className=" text-sm leading-6  text-primary-blue underline ">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => {
                            router.push(
                              `/policyholder/${data.policyholderId}/show`
                            );
                          }}
                        >
                          {policyHolderName}
                        </span>
                      </div>
                    </div>
                    {data?.application?.id && (
                      <>
                        <div className="grid w-full grid-cols-2">
                          <div className="text-sm font-semibold leading-6 text-gray-900">
                            Application Id :
                          </div>
                          <div className=" text-sm leading-6  text-primary-blue underline ">
                            <span
                              className="hover:cursor-pointer"
                              onClick={() => {
                                router.push(
                                  `/application/${data?.application?.id}/show`
                                );
                              }}
                            >
                              {data?.application?.id}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {data?.policy?.policyNumber && (
                      <>
                        <div className="grid w-full grid-cols-2">
                          <div className="text-sm font-semibold leading-6 text-gray-900">
                            Policy :
                          </div>
                          <div className=" text-sm leading-6  text-primary-blue underline ">
                            <span
                              className="hover:cursor-pointer"
                              onClick={() => {
                                router.push(`/policy/${data?.policy?.id}/show`);
                              }}
                            >
                              {data?.policy?.policyNumber}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <PolicyDataComponent
                  policyData={data?.applicationData}
                  title={"Prospect Data"}
                />
                {updatedData ? <DescriptionList data={updatedData} /> : ""}
              </div>
              <ShowDropdown
                id={"paymentMethod"}
                title={"Payment Method"}
                status={data?.status}
                checkStatus={
                  data?.application?.id
                    ? LeadStatusValues.inreview
                    : LeadStatusValues.draft
                }
                canUpdate={
                  currentRoleAccessLevels?.Leads?.canUpdate &&
                  !data?.isArchived &&
                  (data?.status === LeadStatusValues.inreview
                    ? data?.applicationOnHold
                    : true)
                }
                handleEdit={onClickPaymentEdit}
                handleToggle={() =>
                  setShowDetails({
                    ...showDetails,
                    paymentMethod: !showDetails.paymentMethod,
                  })
                }
                toggleValue={showDetails.paymentMethod}
                dropDownArray={paymentMethod}
                mainObject={paymentMethod[paymentMethod.length - 1]}
              />
              {data?.packageName !== packageNames.device &&
                data?.packageName !== packageNames.retailDeviceInsurance && (
                  <ShowDropdown
                    id={"beneficiaries"}
                    title={"Beneficiary Details"}
                    status={data?.status}
                    checkStatus={
                      data?.application?.id
                        ? LeadStatusValues.inreview
                        : LeadStatusValues.draft
                    }
                    canUpdate={
                      currentRoleAccessLevels?.Leads?.canUpdate &&
                      !data?.isArchived &&
                      (data?.status === LeadStatusValues.inreview
                        ? data?.applicationOnHold
                        : true)
                    }
                    handleEdit={() => setBeneficiaryEdit(true)}
                    handleToggle={() =>
                      setShowDetails({
                        ...showDetails,
                        beneficiaries: !showDetails.beneficiaries,
                      })
                    }
                    toggleValue={showDetails.beneficiaries}
                    dropDownArray={data?.beneficiaries}
                    mainArray={beneficiariesData}
                  />
                )}

              <ShowDropdown
                id={"documents"}
                title={"Documents"}
                status={data?.status ?? ""}
                checkStatus={
                  data?.application?.id
                    ? LeadStatusValues.inreview
                    : LeadStatusValues.draft
                }
                canUpdate={
                  currentRoleAccessLevels?.Leads?.canUpdate &&
                  !data?.isArchived &&
                  (data?.status === LeadStatusValues.inreview
                    ? data?.applicationOnHold
                    : true)
                }
                handleEdit={() => handleModalOpen()}
                handleToggle={() =>
                  setShowDetails({
                    ...showDetails,
                    documents: !showDetails.documents,
                  })
                }
                toggleValue={showDetails.documents}
                dropDownArray={fileStore}
                documentRefetch={dataRefetch}
                category={category}
              />
            </div>
          </div>
          <ShowNotesAndActivity
            notes={notes}
            activity={activityData}
            showActivitySection={showActivitySection}
          />

          {beneficiaryEdit && (
            <Modal
              title="Update Beneficiary Details"
              onCloseClick={onModalClose}
              border
            >
              <form
                onSubmit={onBeneficiaryEditSave}
                className="max-h-[75vh] overflow-auto scrollbar-none"
              >
                {beneficiaries?.map((item: IEditBeneficiary, index: number) => {
                  return (
                    <div key={index}>
                      <div className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                        <div className="text-lg font-bold text-gray-900">
                          Identification {index + 1}
                        </div>
                        {beneficiaries.length > 1 && (
                          <span>
                            <AiOutlineDelete
                              color="red"
                              onClick={() => {
                                deleteMember(index);
                              }}
                            />
                          </span>
                        )}
                      </div>
                      <FormComponent
                        inputs={editApplicationIdentification}
                        formValues={item.identification}
                        index={index}
                        handleChange={handleBeneficiaryIdentificationChange}
                        formErrors={beneficiaryErrors?.[index]}
                        tailwindClass="grid grid-cols-2 gap-x-4"
                      />
                      <div className="text-lg font-bold text-gray-900">
                        Details
                      </div>
                      <FormComponent
                        inputs={editBeneficiaryDetails}
                        formValues={item}
                        index={index}
                        handleChange={handleBeneficiaryChange}
                        handlePhoneChange={handleBeneficiaryPhoneChange}
                        formErrors={beneficiaryErrors?.[index]}
                        tailwindClass="grid grid-cols-2 gap-x-4"
                      />
                    </div>
                  );
                })}
                <div className="flex w-full justify-center">
                  <Button
                    text="Save"
                    type={"submit"}
                    className="mr-3"
                    disabled={disable}
                  />
                  <AddButton
                    name="Add Beneficiaries"
                    handleClick={() => addNewMember()}
                  />
                </div>
              </form>
            </Modal>
          )}
          {policyEdit && (
            <Modal
              title="Update Prospect Details"
              onCloseClick={() => {
                setPolicyEdit(false);
                handleDataRefetch();
                setCount(1);
                setDevice({ ...deviceType, selected: "" });
                setbrand({ ...brand, selected: "" });
                setModelName({ ...modelName, selected: "" });
                setColor({ ...color, selected: "" });
              }}
              border
            >
              <form
                onSubmit={onLeadEditSave}
                className="max-h-[75vh] overflow-auto scrollbar-none"
              >
                <FormComponent
                  inputs={editPolicyInputs}
                  formValues={policyData}
                  handleChange={handleEditPolicyDataChange}
                  formErrors={beneficiaryErrors}
                  tailwindClass="grid grid-cols-2 gap-x-4"
                />
                {data?.packageName === packageNames.creditLifeMotor && (
                  <>
                    <FormComponent
                      inputs={creditLifeInputs}
                      formValues={policyData?.policyData?.creditLife}
                      handleChange={handleCreditLifeChange}
                      tailwindClass="grid grid-cols-2 gap-x-4"
                    />
                  </>
                )}

                {data?.packageName === packageNames.retailDeviceInsurance && (
                  <>
                    <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                      Update Device
                    </h2>
                    <FormComponent
                      inputs={deviceInputs}
                      formValues={policyData?.applicationData?.deviceData}
                      handleChange={handleDeviceDataChange}
                      formErrors={deviceFormErrors}
                      tailwindClass="grid grid-cols-2 gap-x-4"
                    />
                    {/* <InputField 
                    input={}
                    formValues={}
                      handleChange={}
                    /> */}
                  </>
                )}

                {data?.packageName === packageNames.retailDeviceCreditLife && (
                  <div id="creditLifeDevice">
                    <>
                      <FormComponent
                        inputs={creditLifeDeviceInputs}
                        formValues={
                          policyData?.applicationData?.deviceCreditLife
                        }
                        handleChange={handleDeviceCreditLife}
                        tailwindClass="grid grid-cols-2 gap-x-4"
                      />
                    </>
                  </div>
                )}

                {data?.packageName === packageNames.funeral && (
                  <>
                    <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                      Spouse
                    </h2>
                    <InputField
                      handleChange={handleIncludeSpouse}
                      input={{
                        label: "Include Spouse",
                        type: "checkbox",
                        name: "includeSpouse",
                        required: false,
                      }}
                      formValues={includeSpouse}
                      formErrors={includeSpouse}
                    />
                    {includeSpouse.includeSpouse && (
                      <>
                        {policyData?.policyData?.members?.spouse?.map(
                          (item: any, index: number) => {
                            return (
                              <div
                                className="mb-5 rounded border border-l-8 border-blue-200 p-5"
                                key={index}
                              >
                                <AiOutlineDelete
                                  color="red"
                                  onClick={() => {
                                    deleteSpouse(index);
                                  }}
                                  className="w-100 float-right "
                                />
                                <FormComponent
                                  inputs={policyDataEdit}
                                  formValues={item}
                                  formErrors={formErrors.spouse[index]}
                                  handleChange={handleEditSpouse}
                                  tailwindClass="grid grid-cols-2 gap-4"
                                  index={index}
                                />
                              </div>
                            );
                          }
                        )}
                        {policyData?.policyData?.members?.spouse?.length <
                          4 && (
                          <AddButton
                            name="Add Spouse"
                            handleClick={() => addNewSpouse()}
                          />
                        )}
                      </>
                    )}

                    <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                      Children
                    </h2>
                    <InputField
                      handleChange={handleCheckbox}
                      input={{
                        label: "Include children",
                        type: "checkbox",
                        name: "includeChildren",
                        required: false,
                      }}
                      formValues={includeChildren}
                    />
                    {includeChildren.includeChildren && (
                      <>
                        {policyData?.policyData?.members?.children?.map(
                          (item: IMember, index: number) => {
                            return (
                              <div
                                className="mb-5 rounded border border-l-8 border-blue-200 p-5"
                                key={index}
                              >
                                <AiOutlineDelete
                                  color="red"
                                  onClick={() => {
                                    deleteChild(index);
                                  }}
                                  className="w-100 float-right "
                                />
                                <InputField
                                  handleChange={handleEditChildrenChange}
                                  input={{
                                    label: "Stillborn",
                                    type: "checkbox",
                                    name: "isStillBorn",
                                    required: false,
                                  }}
                                  index={index}
                                  formValues={item}
                                />

                                {item.isStillBorn ? (
                                  <FormComponent
                                    inputs={policyStillBornInputs}
                                    formValues={item}
                                    handleChange={handleEditChildrenChange}
                                    formErrors={formErrors.children[index]}
                                    index={index}
                                    tailwindClass="grid grid-cols-2 gap-4"
                                  />
                                ) : (
                                  <FormComponent
                                    inputs={childrenEdit}
                                    formValues={item}
                                    handleChange={handleEditChildrenChange}
                                    formErrors={formErrors.children[index]}
                                    index={index}
                                    tailwindClass="grid grid-cols-2 gap-4"
                                  />
                                )}
                              </div>
                            );
                          }
                        )}{" "}
                        <AddButton
                          name="Add Child"
                          handleClick={() => addNewChild()}
                        />
                      </>
                    )}
                    <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                      Extended Family
                    </h2>
                    <InputField
                      handleChange={handleExtendedFamilyCheckbox}
                      input={{
                        label: "Extended Family",
                        type: "checkbox",
                        name: "extendedFamily",
                        required: false,
                      }}
                      formValues={extendedFamily}
                    />
                    {extendedFamily.extendedFamily && (
                      <>
                        {policyData?.policyData?.members?.extendedFamily?.map(
                          (item: any, index: number) => {
                            return (
                              <div
                                className="mb-5 rounded border border-l-8 border-blue-200 p-5"
                                key={index}
                              >
                                <AiOutlineDelete
                                  color="red"
                                  onClick={() => {
                                    deleteExtendedMember(index);
                                  }}
                                  className="w-100 float-right "
                                />

                                <FormComponent
                                  inputs={extendedFamilyEdit}
                                  formValues={item}
                                  handleChange={handleEditExtendedFamily}
                                  formErrors={formErrors.extendedFamily[index]}
                                  tailwindClass="grid grid-cols-2 gap-4"
                                  index={index}
                                />
                              </div>
                            );
                          }
                        )}
                        {policyData?.policyData?.members?.extendedFamily
                          ?.length < 14 && (
                          <AddButton
                            name="Add Family Member"
                            handleClick={() => addNewExtendedMember()}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
                <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                  Add Notes
                </h2>
                <FormComponent
                  inputs={notesInput}
                  formValues={policyNote}
                  handleChange={handleNotes}
                  tailwindClass="grid grid-cols-2 gap-4 "
                />
                <div className="flex w-full justify-end">
                  <Button
                    text="Save"
                    type={"submit"}
                    className="mr-3"
                    disabled={alterDisable}
                  />
                  <Button
                    text="Cancel"
                    onClick={() => {
                      setPolicyEdit(false);
                      handleDataRefetch();
                      setDeviceFormErrors({
                        ...deviceFormErrors,
                        ["devicePrice"]: "",
                      });
                    }}
                  />
                </div>
              </form>
            </Modal>
          )}

          {paymentEdit && (
            <Modal
              title="Update Payment Details"
              onCloseClick={() => {
                setPaymentEdit(false);
                handleDataRefetch();
                setPaymentMethod([...paymentMethod, {}]);
              }}
              border
            >
              <div>
                <form
                  className="max-h-[75vh] overflow-auto scrollbar-none"
                  onSubmit={onPaymentUpdate}
                >
                  {/* <FormComponent
                    inputs={paymetMethodTypes}
                    formValues={{ paymentMethodType: selectPaymentType }}
                    handleChange={handlePaymentChange}
                  /> */}
                  <FormComponent
                    index={paymentMethod.length - 1}
                    inputs={paymentInput}
                    formValues={paymentMethod[paymentMethod.length - 1]}
                    handleChange={handlePaymentDetailsChange}
                    tailwindClass="grid grid-cols-2 gap-x-4"
                  />
                  <div className="flex w-full justify-end">
                    <Button text="Save" className="mr-3" type={"submit"} />
                    <SecondaryButton
                      text="Cancel"
                      onClick={() => {
                        setPaymentEdit(false);
                        handleDataRefetch();
                        setPaymentMethod([...paymentMethod, {}]);
                      }}
                    />
                  </div>
                </form>
              </div>
            </Modal>
          )}

          {createClaim && (
            <Modal
              title="Create Claim"
              onCloseClick={() => {
                setClaimFormValues({} as IClaimantFormValues);
                setCreateClaim(false);
                handleDataRefetch();
              }}
              border
            >
              <form className="w-full" onSubmit={handleClaimSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {claimantFormInputs.map((input, index) => (
                    <InputField
                      key={"employee" + index}
                      input={input}
                      handleChange={handleFormInputChange}
                      handlePhoneChange={handleClaimPhoneNumber}
                      formValues={claimantFormValues}
                      formErrors={claimantFormErrors}
                    />
                  ))}
                </div>
                <div className="my-2 flex justify-end">
                  <Button text={"Submit"} type="submit" disabled={disable} />
                </div>
              </form>
            </Modal>
          )}

          {open && (
            <AddNoteModal
              open={open}
              setOpen={setOpen}
              note={note}
              setNote={setNote}
              handleNoteChange={handleNoteChange}
              handleSubmit={handleNoteSubmit}
            />
          )}
          {isModalOpen && (
            <Modal
              title={"Upload documents"}
              onCloseClick={() => {
                closeModal();
                handleDataRefetch();
              }}
              onSaveClick={() => handleDocumentsSubmit()}
              showButtons
              border
              buttonDisabled={buttonDisable}
            >
              <div>
                <div className="mt-10 flex justify-center align-middle">
                  <div className="flex">
                    <UploadFile
                      title={
                        "You can upload your excel sheet or photo to import"
                      }
                      setFileUpload={setFileUpload}
                      fileUpload={fileUpload}
                      uploadMultiple={true}
                    />
                  </div>
                </div>
                <div>
                  {files &&
                    fileUpload.length > 0 &&
                    fileUpload.map((item: any, index: number) => {
                      return (
                        <div
                          className="mb-2 justify-center align-middle"
                          key={index}
                        >
                          <ImagePreview
                            message={item.name}
                            size={item.size}
                            onClick={() => imageOverview(index)}
                            handleClose={() => handleImagePreviewClose(index)}
                            setFileDisable={setFileDisable}
                          />
                        </div>
                      );
                    })}
                </div>
                <div>
                  {imageModalOpen && files && files.length > 0 && (
                    <div>
                      {selectedBar !== null && (
                        <Modal
                          onCloseClick={() => modalClose()}
                          onSaveClick={() => setImageModalOpen(false)}
                          showButtons={false}
                          border={false}
                        >
                          {files[selectedBar]?.type == "application/pdf" ? (
                            <div className="flex h-full w-full justify-center border border-gray-300 align-middle">
                              <iframe
                                src={files[selectedBar]?.fileUrl}
                                title="PDF"
                                height="600px"
                                width="100%"
                                className="overflow-hidden"
                              ></iframe>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <img
                                className="top-0 h-auto w-[400px]"
                                src={files[selectedBar]?.fileUrl}
                                alt="upload image"
                              />
                            </div>
                          )}
                        </Modal>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Modal>
          )}
        </div>
      ) : (
        <>
          <ErrorComponent />
        </>
      )}
      {policyScheduleModalOpen && (
        <Modal
          onCloseClick={() => setPolicyScheduleModalOpen(false)}
          onSaveClick={() => setPolicyScheduleModalOpen(false)}
          showButtons={false}
          border={false}
        >
          <PolicyScheduleUrl pdfkey={key} />
        </Modal>
      )}
      {showIsArchivePolicyModel && (
        <Modal
          onCloseClick={() => {
            handleDataRefetch();
            setShowIsArchivePolicyModel(!showIsArchivePolicyModel);
          }}
          showButtons={true}
          okButtonTitle="Confirm"
          onSaveClick={archivePolicy}
          title={"Archive Prospect"}
        >
          <div>
            <p>Click confirm to archive this Prospect</p>
          </div>
        </Modal>
      )}
      {showRefuseLeadModal && (
        <Modal
          onCloseClick={() => {
            handleDataRefetch();
            setShowRefuseLeadModal(!showRefuseLeadModal);
          }}
          showButtons={true}
          okButtonTitle="Confirm"
          onSaveClick={handleRefuseLead}
          title={"Refuse Prospect"}
        >
          <div>
            <p>Click confirm to Refuse this Prospect</p>
          </div>
        </Modal>
      )}
      {showAcceptLeadModal && (
        <Modal
          onCloseClick={() => {
            handleDataRefetch();
            setShowAcceptLeadModal(!showAcceptLeadModal);
          }}
          showButtons={true}
          okButtonTitle="Confirm"
          onSaveClick={handleSendToApplication}
          title={"Accept Prospect"}
        >
          <div>
            <p>Click confirm to Accept this Prospect</p>
          </div>
        </Modal>
      )}
    </>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}

export default DefaultLayout(LeadView);
