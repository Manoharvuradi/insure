import React, { useEffect, useMemo, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";
import {
  claimApprovalStatus,
  employeeFuneralAges,
  packageNames,
  policyTabs,
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
  PolicyStatus,
  PremiumFrequency,
  SchemeType,
  UserRole,
} from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import { BsArrowRightSquareFill } from "react-icons/bs";
import ErrorComponent from "~/common/errorPage";
import { useSession } from "next-auth/react";
import ReactDOMServer from "react-dom/server";
import jsPDF from "jspdf";
import { IEditBeneficiary } from "../application";
import { AiOutlineDelete } from "react-icons/ai";
import FormComponent from "~/common/form";
import {
  PolicyStatusValues,
  childrenEdit,
  deviceMaxPrice,
  editApplicationIdentification,
  editBeneficiaryDetails,
  extendedFamilyEdit,
  getEditPolicyData,
  notesInput,
  policyDataEdit,
  policyStillBornInputs,
  renewalPolicyInputs,
} from "~/utils/constants/policy";
import { IEvent } from "~/interfaces/common/form";
import AddButton from "~/common/buttons/addButton";
import {
  dateConversion,
  displayRenewal,
  getMultipleAccessRoles,
} from "~/utils/helpers";
import Button from "~/common/buttons/filledButton";
import { exludePackages } from "~/utils/constants/application";
import InputField from "~/common/form/input";
import { IUploadFile } from "~/interfaces/common";
import { paymentInputs, paymetMethodTypes } from "~/utils/constants/payments";
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
import PolicySchedule from "../template/policySchedule";
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

function PolicyView(props: any) {
  const [activeTab, setActiveTab] = useState("policyDetails");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileUpload, setFileUpload] = useState<any>([]);
  const [files, setFiles] = useState([{ name: "", type: "", fileUrl: "" }]);
  const router = useRouter();
  const policyId = router.query.id as string;
  const createFile = api.uploadLibrary.create.useMutation();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const {
    isLoading,
    data,
    error,
    refetch: dataRefetch = () => {},
  } = currentRoleAccessLevels?.Policy?.canView
    ? api.policy.show.useQuery(policyId)
    : { isLoading: false, data: null as any, error: null };

  const [fileStore, setFileStore] = useState<any>([]);
  const [formErrors, setFormErrors] = useState({
    spouse: [{}],
    children: [{}],
    extendedFamily: [{}],
    beneficiaries: [{}],
    paymentMethod: {},
  });
  const [policyData, setPolicyData] = useState({} as any);
  const [payments, setPayments] = useState([] as any);
  const [policyPayments, setPolicyPayments] = useState([] as any);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<any>();
  const [policyNote, setPolicyNote] = useState({} as any);
  const [showActivitySection, setShowActivitySection] = useState(true);
  const [selectedBar, setSelectedBar] = useState(null);
  const [policyScheduleModalOpen, setPolicyScheduleModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [showCancelPolicyModel, setShowCancelPolicyModel] = useState(false);
  const [showReinstatePolicy, setShowReinstatePolicy] = useState(false);
  const [beneficiaryEdit, setBeneficiaryEdit] = useState(false);
  const [includeChildren, setIncludeChildren] = useState({
    includeChildren: false,
  });
  const [includeSpouse, setIncludeSpouse] = useState({
    includeSpouse: false,
  });
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
  const [beneficiariesData, setBeneficiariesData] = useState<any[]>([]);
  const [objects, setObjects] = useState<{ [key: string]: any }>({});
  const [arrays, setArrays] = useState<{ [key: string]: any[] }>({});
  const [key, setKey] = useState("");
  const [policyDataNew, setPolicyDataNew] = useState<{ [key: string]: any }>(
    {}
  );
  const [remaining, setRemaining] = useState<{ [key: string]: any }>({});
  const [details, setDetails] = useState<IDetails>({
    claims: [],
  });
  const [policyHolder, setPolicyHolder] = useState<{ [key: string]: any }>({});
  const [policyHolderName, setPolicyHolderName] = useState<string>("");
  const [paymentMethodData, setPaymentMethodData] = useState<{
    [key: string]: any;
  }>({});
  const [paymentToggle, setPaymentToggle] = useState(true);
  const [selectPaymentType, setSelectPaymentType] = useState("");
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
  const updatePolicy = api.policy.update.useMutation();
  const paymentUpdate = api.policy.updatePayment.useMutation();
  const updateBeneficiary = api.policy.updateBeneficiary.useMutation();
  const updatePolicyStatus = api.policy.status.useMutation();
  const archiveedPolicy = api.policy.archived.useMutation();
  const deleteBeneficiary = api.beneficiaries.delete.useMutation();
  const renewalPolicyApi = api.policy.renewalPolicy.useMutation();
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
  const { data: deviceCatalogData } = api.deviceCatalog.list.useQuery({
    filter: "true",
  });
  const deviceList = deviceCatalogData?.data
    ? Object.keys(deviceCatalogData?.data)
    : [];
  const [deviceInputs, setDeviceInputs] = useState(deviceDetailsInputs);
  const [deviceType, setDevice] = useState({ list: [] as any, selected: "" });
  const [brand, setbrand] = useState({ list: [] as any, selected: "" });
  const [modelName, setModelName] = useState({ list: [] as any, selected: "" });
  const [color, setColor] = useState({ list: [] as any, selected: "" });
  const [count, setCount] = useState(1);
  const [renewalPolicy, setRenewalPolicy] = useState(false);
  const [renewalPolicyValues, setRenewalPolicyValues] = useState({
    renewalDate: "",
    endDate: "",
  });
  const [paymentInput, setPaymentInput] = useState(paymentInputs);
  const updateFieldOptions = (
    fieldName: string,
    newOptions: { label: string; value: string }[]
  ) => {
    setDeviceInputs((prevState) =>
      prevState.map((input) => {
        if (input.name === fieldName && input.type === "select") {
          return { ...input, options: newOptions };
        }
        return input;
      })
    );
  };
  useEffect(() => {
    if (data) {
      setDevice({
        ...deviceType,
        selected: `${data?.policyData?.deviceData?.deviceType}`,
      });
      setModelName({
        ...modelName,
        selected: `${data?.policyData?.deviceData?.deviceModel}`,
      });
      setColor({
        ...color,
        selected: `${data?.policyData?.deviceData?.deviceModelColor}`,
      });
      setDevice({ ...deviceType, list: [deviceList] });
      const brandList = deviceCatalogData?.data?.[
        data?.policyData?.deviceData?.deviceType
      ]
        ? Object.keys(
            deviceCatalogData?.data?.[data?.policyData?.deviceData?.deviceType]
          )
        : [];
      setbrand({
        ...brand,
        list: [brandList],
        selected: `${data?.policyData?.deviceData?.deviceBrand}`,
      });
      const modelList = deviceCatalogData?.data?.[
        data?.policyData?.deviceData?.deviceType
      ]?.[data?.policyData?.deviceData?.deviceBrand]?.map(
        (item: any) => item.modelName
      );
      setModelName({ ...modelName, list: [modelList] });
      const colors = (
        (deviceCatalogData?.data?.[data?.policyData?.deviceData?.deviceType]?.[
          data?.policyData?.deviceData?.deviceBrand
        ] as {
          modelName: string;
          colour: string;
        }[]) || []
      )
        .filter(
          (model) =>
            model.modelName === data?.policyData?.deviceData?.deviceModel
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
  }, [data, policyEdit]);

  useEffect(() => {
    if (!deviceType.selected) return;
    delete policyData?.policyData?.deviceData?.deviceBrand;
    delete policyData?.policyData?.deviceData?.deviceModel;
    delete policyData?.policyData?.deviceData?.deviceModelColor;
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
      brand.selected != policyData?.policyData?.deviceData?.deviceBrand ||
      count > 1
    ) {
      delete policyData?.policyData?.deviceData?.deviceModel;
      delete policyData?.policyData?.deviceData?.deviceModelColor;
    }
    setCount(count + 1);
    updateFieldOptions("deviceModelColor", [{ label: "Select", value: "" }]);
    const device = deviceType.selected
      ? deviceType.selected
      : data?.policyData?.deviceData?.deviceType;
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
    delete policyData?.policyData?.deviceData?.deviceModelColor;
    const device = deviceType.selected
      ? deviceType.selected
      : data?.policyData?.deviceData?.deviceType;
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

  const submitClaim = api.claim.create.useMutation();
  const modalClose = () => {
    setSelectedBar(null);
    setImageModalOpen(false);
  };
  useEffect(() => {
    document.title = "Telkom Policy";
  }, []);

  useEffect(() => {
    if (policyData.policyScheduleKey) {
      setKey(policyData.policyScheduleKey);
    }
  }, [policyData.policyScheduleKey]);
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
    mainMember: any,
    packageName: string
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
          withFreeBenefit: policyData?.policyData?.withFreeBenefit,
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
      case packageNames.device:
        return {
          packageName: policyData.packageName,
          deviceData: {
            ...policyData.policyData.deviceData,
            devicePrice: Number(policyData.policyData.deviceData.devicePrice),
          },
        };
      case packageNames.creditLifeDevice:
        return {
          packageName: policyData?.packageName,
          deviceCreditLife: {
            ...policyData.policyData.deviceCreditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              policyData.policyData.deviceCreditLife
                .outstandingSettlementBalance
            ),
            ...(loanSettlement && {
              loanSettlementAtInception: Number(loanSettlement),
            }),
          },
        };
      case packageNames.retailDeviceInsurance:
        return {
          packageName: policyData.packageName,
          deviceData: {
            ...policyData.policyData.deviceData,
            devicePrice: Number(policyData.policyData.deviceData.devicePrice),
          },
        };
      case packageNames.retailDeviceCreditLife:
        return {
          packageName: policyData?.packageName,
          deviceCreditLife: {
            ...policyData.policyData.deviceCreditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              policyData.policyData.deviceCreditLife
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

  const onPolicyEditSave = async (e: any) => {
    e.preventDefault();
    setRenewalPolicy(false);
    setLoading(true);
    const mainMember = policyData?.policyData?.members?.mainMember;
    const req: any = {
      isArchived: policyData.isArchived,
      billingDay: Number(policyData?.billingDay),
      ...(data?.packageName === packageNames.funeral && {
        options: policyData?.options,
      }),
      status: policyData.status,
      billingFrequency: policyData?.billingFrequency ?? "MONTHLY",
      policyData: generatePolicyData(policyData, mainMember, data?.packageName),
      startDate: new Date(policyData.startDate),
      renewalDate:
        renewalPolicyValues?.renewalDate !== ""
          ? new Date(renewalPolicyValues?.renewalDate)
          : new Date(policyData.renewalDate),
      endDate:
        renewalPolicyValues?.renewalDate !== ""
          ? new Date(renewalPolicyValues?.endDate)
          : new Date(policyData.endDate),
      schemeType: policyData.schemeType ?? "GROUP",
      autoRenewal: policyData.autoRenewal ?? false,
      policyNumber: policyData?.policyNumber,
      policyholderId: policyData?.policyholderId,
      applicationId: policyData?.applicationId,
    };
    try {
      const updatePolicyRes = await updatePolicy.mutateAsync({
        id: data?.id as string,
        body: req,
      });
      let res;
      if (
        updatePolicyRes &&
        renewalPolicyValues?.renewalDate === "" &&
        renewalPolicyValues?.endDate === ""
      ) {
        res = await addnote.mutateAsync({
          policyId: data?.id as string,
          title: policyNote?.title,
          description: policyNote?.description,
        });
      }
      if (updatePolicyRes) {
        setPolicyEdit(false);
        setPolicyNote({});
        toast.success("Policy updated successfully");
      } else {
        toast.error("Failed to update Policy in else case");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update Policy");
    } finally {
      setLoading(false);
      handleDataRefetch();
      refetch();
    }
  };

  const onPaymentUpdate = async () => {
    setLoading(true);
    const req: any = {
      paymentMethodType: exludePackages.includes(data?.packageName)
        ? "DEBIT_FROM_BANK_ACCOUNT"
        : selectPaymentType,
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
      const archivedPolicy = await archiveedPolicy.mutateAsync({
        id: data?.id ?? "",
      });
      if (archivedPolicy) {
        router.push("/policy/list");
        setLoading(false);
      } else {
        toast.error("Failed to archive policy");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to archive policy");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const cancelPolicy = async () => {
    setShowCancelPolicyModel(!showCancelPolicyModel);
    if (
      details.claims[details.claims.length - 1]?.approvalStatus ===
      claimApprovalStatus[0]
    ) {
      toast.warning("Unable to cancel due to a pending claim");
      return;
    }
    setLoading(true);
    try {
      const cancelledPolicy = await updatePolicyStatus.mutateAsync({
        id: data?.id as string,
        status: "CANCELLED",
      });
      let res;
      if (cancelledPolicy) {
        res = await addnote.mutateAsync({
          policyId: data?.id as string,
          title: policyNote?.title,
          description: policyNote?.description,
        });
      }
      if (cancelledPolicy && res) {
        toast.success("Policy cancelled");
        setPolicyNote({});
        router.push("/policy/list");
      } else {
        toast.error("Failed to cancel policy");
      }
    } catch (err) {
      toast.error("Failed to cancel policy");
      setPolicyNote({});
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const reinitiatePolicy = async () => {
    setShowReinstatePolicy(!showReinstatePolicy);
    setLoading(true);
    try {
      const reinitiate = await updatePolicyStatus.mutateAsync({
        id: data?.id as string,
        status: "ACTIVE",
      });
      if (reinitiate) {
        toast.success("Policy Re-initiated");
        router.push("/policy/list");
      } else {
        toast.error("Failed to Re-initiate policy");
      }
    } catch (err) {
      toast.error("Failed to Re-initiate policy");
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

    if (name === "number") {
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

  const handleConvertToPdf = async () => {
    let element = PolicySchedule(data);
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(ReactDOMServer.renderToString(element), {
      callback: function (doc: any) {
        const pdfOutput = doc.output();
        const buffer = new ArrayBuffer(pdfOutput.length);
        const array = new Uint8Array(buffer);
        for (let i = 0; i < pdfOutput.length; i++) {
          array[i] = pdfOutput.charCodeAt(i);
        }
        const blob = new Blob([array], { type: "application/pdf" });
        const getPdfUrl = URL.createObjectURL(blob);
        setPdfUrl(getPdfUrl);
      },
    });
  };

  const handlePolicySchedule = () => {
    setPolicyScheduleModalOpen(true);
    handleConvertToPdf();
  };

  const handleCancelPolicy = async () => {
    setShowCancelPolicyModel(true);
  };

  const handleReinstatePolicy = async () => {
    setShowReinstatePolicy(true);
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

  let {
    isLoading: noteDataLoading,
    data: noteData,
    error: noteError,
  } = api.policyNote.findByPolicyId.useQuery(router.query.id as string);

  //Activity API
  let {
    data: activityData,
    refetch = () => {},
    error: activityError,
  } = api.policyActivity.findByPolicyId.useQuery(router.query.id as string);

  const handleDataRefetch = () => {
    dataRefetch();
  };

  const [notes, setNotes]: any = useState([]);
  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  const addnote = api.policyNote.create.useMutation();
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
        policyId: router.query.id as string,
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

  const handleDocumentsSubmit = async () => {
    setLoading(true);
    try {
      const uploadingFiles = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            referenceId: policyId,
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            category: "policy",
            createdById: data?.createdById,
          };
          const res = await createFile.mutateAsync(req);
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

  useEffect(() => {
    if (data) {
      setDetails(data);
      setFileStore(data.fileIds);
    }
  }, [data]);
  useEffect(() => {
    if (isLoading) {
      setObjects({});
      setArrays({});
      setRemaining({});
      setBeneficiariesData([]);
    } else {
      Object.entries(details).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          setArrays((prevArrays) => ({ ...prevArrays, [key]: value }));
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
            setObjects((prevObjects) => ({ ...prevObjects, [key]: value }));
          } else {
            setRemaining((prevObjects) => ({ ...prevObjects, [key]: value }));
          }
        } else {
          if (key === "policyNumber" || key === "packageName") {
            setPolicyDataNew((prevObjects) => ({
              ...prevObjects,
              [key]:
                value == "EMPLOYEE_DEVICE_CREDITLIFE"
                  ? "EMPLOYEE_DEVICE_CREDIT_LIFE"
                  : value,
            }));
          } else if (key === "policyholderId" || key === "applicationId") {
            setPolicyHolder((prevObjects) => ({
              ...prevObjects,
              [key]: value,
            }));
          } else {
            setRemaining((prevObjects) => ({ ...prevObjects, [key]: value }));
          }
        }
      });
    }
  }, [isLoading, details]);
  const [updatedData, setUpdateData] = useState<{ [key: string]: any }>({});

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
        setSelectPaymentType(
          paymentMethodData[paymentMethodData.length - 1].paymentMethodType
        );
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
          break;
        case packageNames.creditLifeMotor:
          setPolicyData({
            ...data,
            policyData: {
              ...data?.policyData,
              creditLife: {
                ...data?.policyData?.creditLife,
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.device:
          setPolicyData({
            ...data,
            policyData: {
              ...data?.policyData,
              deviceData: {
                ...data?.policyData?.deviceData,
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.creditLifeDevice:
          setPolicyData({
            ...data,
            policyData: {
              ...data?.policyData,
              deviceCreditLife: {
                ...data?.policyData?.deviceCreditLife,
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
            policyData: {
              ...data?.policyData,
              deviceData: {
                ...data?.policyData?.deviceData,
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
            policyData: {
              ...data?.policyData,
              deviceCreditLife: {
                ...data?.policyData?.deviceCreditLife,
              },
            },
            startDate: dateConversion(data?.startDate),
            nextBillingDate: dateConversion(data?.nextBillingDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
      }

      const paymentsArray = data?.payments
        ? data?.payments?.map((transaction: any) => {
            return {
              ...transaction,
              billingDate: dateConversion(transaction?.billingDate),
              createdAt: dateConversion(transaction?.createdAt),
            };
          })
        : [];
      setPayments(paymentsArray);

      const policyPaymentsArray = data?.policyPayments
        ? data?.policyPayments?.map((history: any) => {
            return {
              ...history,
              billingDate: dateConversion(history?.billingDate),
              createdAt: dateConversion(history?.createdAt),
            };
          })
        : [];
      setPolicyPayments(policyPaymentsArray);

      const beneficiaries = data.beneficiaries.map((beneficiary: any) => {
        return {
          ...beneficiary,
          dateOfBirth:
            beneficiary.dateOfBirth && dateConversion(beneficiary.dateOfBirth),
        };
      });

      setBeneficiaries(beneficiaries);
      const editPolicyInputsData = getEditPolicyData(data?.packageName);
      setEditPolicyInputs(editPolicyInputsData);
    }
  }, [data]);

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

  useEffect(() => {
    if (data?.createdBy || data?.updatedBy) {
      checkProperty();
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const canArchive =
        !data?.isArchived && currentRoleAccessLevels.Policy.canDelete;
      setShowIsArchive(canArchive);
      setLoanSettlement(
        policyData?.policyData?.creditLife?.loanSettlementAtInception
      );
      if (data.packageName === packageNames.device) {
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

  const setAllRequiredFields = (str: any) => {
    if (
      data?.packageName != packageNames.retailDeviceInsurance &&
      data?.packageName != packageNames.retailDeviceCreditLife
    ) {
      setPaymentInput((prevState) =>
        prevState.map((input) => ({
          ...input,
          required: str == "DEBIT_FROM_BANK_ACCOUNT" ? true : false,
        }))
      );
    } else {
      setPaymentInput((prevState) =>
        prevState.map((input) => ({
          ...input,
          required: true,
        }))
      );
    }
  };

  const handlePaymentChange = (event: any) => {
    const { name, value } = event.target;
    setSelectPaymentType(event.target.value);
    setAllRequiredFields(event.target.value.toString());
  };

  const handleCreateCliam = () => {
    setCreateClaim(true);
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

  const handleInception = (e: IEvent) => {
    setLoanSettlement(e.target.value);
  };

  const handleDeviceDataChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setPolicyData({
      ...policyData,
      policyData: {
        ...policyData.policyData,
        deviceData: {
          ...policyData?.policyData?.deviceData,
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
        policyData: {
          ...policyData.policyData,
          deviceData: {
            ...policyData?.policyData?.deviceData,
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
      policyData: {
        ...policyData.policyData,
        deviceCreditLife: {
          ...policyData.policyData.deviceCreditLife,
          [name]: value,
        },
      },
      startDate: dateConversion(data?.startDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });

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
  };

  const handleRenewalePolicy = () => {
    setRenewalPolicy(true);
    setRenewalPolicyValues({
      renewalDate: dateConversion(data?.renewalDate),
      endDate: dateConversion(data?.endDate),
    });
  };

  const handleRenewalPolicyChange = (e: IEvent) => {
    setRenewalPolicyValues({
      ...renewalPolicyValues,
      [e.target.name]: e.target.value,
    });
  };

  const renewPolicy = async () => {
    setLoading(true);
    const req: any = {
      renewalDate: new Date(renewalPolicyValues?.renewalDate),
      endDate: new Date(renewalPolicyValues?.endDate),
    };
    try {
      const response = await renewalPolicyApi.mutateAsync({
        id: data?.id,
        ...req,
      });
      if (response) {
        toast.success("Successfully Renewed");
        setLoading(false);
      } else {
        toast.error("Unable to Renew please try again later");
        setLoading(false);
      }
    } catch (err) {
      toast.error("Please try again later");
      setLoading(false);
    }
  };

  return currentRoleAccessLevels?.Policy?.canView ? (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : !error || !noteError || !activityError ? (
        <div className="flex flex-row">
          <div className="w-full border-r-2 border-solid border-gray-300">
            <div className="relative flex justify-between border-b">
              <TabsBar
                tabs={policyTabs}
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
                  id="policyDetails"
                >
                  <div className="flex gap-x-3">
                    <h3 className="text-[26px] font-bold leading-9 text-dark-grey">
                      Policy Details
                    </h3>
                    <Status
                      status={data?.status}
                      paymentMethod={paymentMethod}
                      page={"Policy"}
                    />
                    {data?.isArchived && <ArchivedComponent />}
                  </div>
                  {currentRoleAccessLevels?.Policy?.canUpdate &&
                    !data?.isArchived && (
                      <ActionButtons
                        isVisible={true}
                        alterPolicy={
                          data?.status == "ACTIVE" &&
                          currentRoleAccessLevels?.Policy?.canUpdate &&
                          !data?.isArchived
                        }
                        onClickAlterPolicy={onClickAlterPolicy}
                        showAddNotes={true}
                        onClick={handleAddNote}
                        showPolicySchedule={true}
                        onClickPolicySchedule={handlePolicySchedule}
                        showCancelPolicy={
                          data?.status === "ACTIVE" &&
                          currentRoleAccessLevels?.Policy?.canDelete
                        }
                        onClickCancelPolicy={handleCancelPolicy}
                        showReinstatePolicy={
                          data?.status === PolicyStatusValues.cancelled &&
                          currentRoleAccessLevels?.Policy?.canUpdate &&
                          !data?.isArchived
                        }
                        onClickReinstatePolicy={handleReinstatePolicy}
                        showIsArchive={showIsArchive}
                        onClickIsArchived={handleIsArchived}
                        showCreateClaim={
                          data?.status === "ACTIVE" &&
                          currentRoleAccessLevels?.Claim?.canCreate
                        }
                        onClickCreateClaim={handleCreateCliam}
                        showRenewalePolicy={
                          data?.status == "ACTIVE" &&
                          data?.packageName === packageNames.funeral &&
                          currentRoleAccessLevels?.Policy?.canUpdate &&
                          !data?.isArchived &&
                          displayRenewal(data?.renewalDate)
                        }
                        onClickRenewalePolicy={handleRenewalePolicy}
                      />
                    )}
                </div>
                <div className="mt-6">
                  {policyDataNew ? (
                    <DescriptionList data={policyDataNew} />
                  ) : (
                    ""
                  )}
                  <div className="mt-2 grid w-full grid-cols-2 justify-between justify-items-center gap-x-[45px]">
                    <div className="grid w-full grid-cols-2">
                      <div className="text-sm font-semibold leading-6 text-gray-900">
                        Policyholder :
                      </div>
                      <div className=" text-sm leading-6  text-primary-blue underline ">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => {
                            router.push(
                              `/policyholder/${policyHolder.policyholderId}/show`
                            );
                          }}
                        >
                          {policyHolderName}
                        </span>
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-2">
                      <div className="text-sm font-semibold leading-6 text-gray-900">
                        Application Id :
                      </div>
                      <div className=" text-sm leading-6 text-primary-blue underline ">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => {
                            router.push(
                              `/application/${data.applicationId}/show`
                            );
                          }}
                        >
                          {policyHolder?.applicationId}
                        </span>
                      </div>
                    </div>

                    {data?.Leads[0]?.leadNumber && (
                      <div className="grid w-full grid-cols-2">
                        <div className="text-sm font-semibold leading-6 text-gray-900">
                          Leads Number :
                        </div>
                        <div className=" text-sm leading-6 text-primary-blue underline ">
                          <span
                            className="hover:cursor-pointer"
                            onClick={() => {
                              router.push(`/lead/${data?.Leads[0]?.id}/show`);
                            }}
                          >
                            {data?.Leads[0]?.leadNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <PolicyDataComponent policyData={data?.policyData} />
                {updatedData ? <DescriptionList data={updatedData} /> : ""}
              </div>

              <ShowDropdown
                id={"paymentMethod"}
                title={"Payment Method"}
                status={data?.status}
                checkStatus={"ACTIVE"}
                canUpdate={
                  currentRoleAccessLevels?.Policy?.canUpdate &&
                  !data?.isArchived
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
              {data?.packageName !== packageNames.device && (
                <ShowDropdown
                  id={"beneficiaries"}
                  title={"Beneficiary Details"}
                  status={data?.status}
                  checkStatus={PolicyStatusValues.active}
                  canUpdate={
                    currentRoleAccessLevels?.Policy?.canUpdate &&
                    !data?.isArchived
                  }
                  handleEdit={() => setBeneficiaryEdit(true)}
                  handleToggle={() =>
                    setShowDetails({
                      ...showDetails,
                      beneficiaries: !showDetails.beneficiaries,
                    })
                  }
                  toggleValue={showDetails.beneficiaries}
                  dropDownArray={policyData?.beneficiaries}
                  mainArray={beneficiariesData}
                />
              )}

              <ShowDropdown
                id={"payments"}
                title={"Transactions"}
                status={data?.status}
                canUpdate={
                  currentRoleAccessLevels?.Policy?.canUpdate &&
                  !data?.isArchived
                }
                handleToggle={() =>
                  setShowDetails({
                    ...showDetails,
                    payments: !showDetails.payments,
                  })
                }
                toggleValue={showDetails.payments}
                dropDownArray={payments}
              />

              <ShowDropdown
                id={"policyPayments"}
                title={"History"}
                status={data?.status}
                canUpdate={
                  currentRoleAccessLevels?.Policy?.canUpdate &&
                  !data?.isArchived
                }
                handleToggle={() =>
                  setShowDetails({
                    ...showDetails,
                    policyPayments: !showDetails.policyPayments,
                  })
                }
                toggleValue={showDetails.policyPayments}
                dropDownArray={policyPayments}
              />

              <ShowDropdown
                id={"documents"}
                title={"Documents"}
                status={data?.status ?? ""}
                checkStatus={PolicyStatusValues.active}
                canUpdate={
                  currentRoleAccessLevels?.Policy?.canUpdate &&
                  !data?.isArchived
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
              title="Update Policy Details"
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
                onSubmit={onPolicyEditSave}
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

                {data?.packageName === packageNames.device && (
                  <>
                    <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                      Update Device
                    </h2>
                    <FormComponent
                      inputs={deviceInputs}
                      formValues={policyData?.policyData?.deviceData}
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

                {data?.packageName === packageNames.creditLifeDevice && (
                  <div id="creditLifeDevice">
                    <>
                      <FormComponent
                        inputs={creditLifeDeviceInputs}
                        formValues={policyData?.policyData?.deviceCreditLife}
                        handleChange={handleDeviceCreditLife}
                        tailwindClass="grid grid-cols-2 gap-x-4"
                      />
                    </>
                  </div>
                )}

                {data?.packageName === packageNames.retailDeviceInsurance && (
                  <>
                    <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                      Update Device
                    </h2>
                    <FormComponent
                      inputs={deviceInputs}
                      formValues={policyData?.policyData?.deviceData}
                      handleChange={handleDeviceDataChange}
                      formErrors={deviceFormErrors}
                      tailwindClass="grid grid-cols-2 gap-x-4"
                    />
                  </>
                )}

                {data?.packageName === packageNames.retailDeviceCreditLife && (
                  <div id="retailDeviceCreditLife">
                    <>
                      <FormComponent
                        inputs={creditLifeDeviceInputs}
                        formValues={policyData?.policyData?.deviceCreditLife}
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
              }}
              border
            >
              <div>
                <form
                  className="max-h-[75vh] overflow-auto scrollbar-none"
                  onSubmit={onPaymentUpdate}
                >
                  {data?.packageName !== "DEVICE_INSURANCE" &&
                    data?.packageName !== "DEVICE_CREDITLIFE" && (
                      <FormComponent
                        inputs={paymetMethodTypes}
                        formValues={{ paymentMethodType: selectPaymentType }}
                        handleChange={handlePaymentChange}
                      />
                    )}
                  <FormComponent
                    index={paymentMethod.length - 1}
                    inputs={paymentInput}
                    formValues={paymentMethod[paymentMethod.length - 1]}
                    handleChange={handlePaymentDetailsChange}
                    tailwindClass="grid grid-cols-2 gap-x-4"
                  />
                  <div className="flex w-full justify-end">
                    <Button text="Save" className="mr-3" type="submit" />
                    <SecondaryButton
                      text="Cancel"
                      onClick={() => {
                        setPaymentEdit(false);
                        handleDataRefetch();
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
      {showCancelPolicyModel && (
        <Modal
          onCloseClick={() => {
            handleDataRefetch();
            setShowCancelPolicyModel(!showCancelPolicyModel);
          }}
          title={"Cancel Policy"}
        >
          <div>
            <p>Enter reason to cancel policy</p>
            <form onSubmit={cancelPolicy}>
              <div>
                <FormComponent
                  inputs={notesInput}
                  formValues={policyNote}
                  handleChange={handleNotes}
                  tailwindClass="grid grid-cols-2 gap-4 "
                />
              </div>
              <div className="flex w-full justify-end">
                <Button
                  text="Submit"
                  type={"submit"}
                  className="mr-3"
                  disabled={alterDisable}
                />
                <Button
                  text="Cancel"
                  onClick={() => {
                    setShowCancelPolicyModel(!showCancelPolicyModel);
                  }}
                />
              </div>
            </form>
          </div>
        </Modal>
      )}
      {showReinstatePolicy && (
        <Modal
          onCloseClick={() => {
            handleDataRefetch();
            setShowReinstatePolicy(!showReinstatePolicy);
          }}
          showButtons={true}
          okButtonTitle="Confirm"
          onSaveClick={reinitiatePolicy}
          title={"Reinitiate Policy"}
        >
          <div>
            <p>Click ok to reinitiate this policy</p>
          </div>
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
          title={"Archive policy"}
        >
          <div>
            <p>Click confirm to archive this policy</p>
          </div>
        </Modal>
      )}
      {renewalPolicy && (
        <Modal
          title="Renewal Policy"
          onCloseClick={() => {
            // setClaimFormValues({} as IClaimantFormValues);
            setRenewalPolicy(false);
            handleDataRefetch();
          }}
          // showButtons = {true}
        >
          <form onSubmit={onPolicyEditSave}>
            <div>
              <FormComponent
                inputs={renewalPolicyInputs}
                formValues={renewalPolicyValues}
                handleChange={handleRenewalPolicyChange}
              />
            </div>
            <div className="mt-3 flex w-full justify-end">
              <Button
                text="Submit"
                type={"submit"}
                className="mr-3"
                disabled={alterDisable}
              />
              <Button
                text="Cancel"
                onClick={() => {
                  setRenewalPolicy(!renewalPolicy);
                }}
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}

export default DefaultLayout(PolicyView);
