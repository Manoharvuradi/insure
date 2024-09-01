import React, { useEffect, useMemo, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";
import TabsBar from "~/common/tabs";
import {
  AccessLevelsDefinition,
  PaymentMethodType,
  convertStringToDateFormate,
  employeeFuneralAges,
  packageName,
  packageNames,
  paymentTabs,
  tabs,
  validateEmail,
} from "~/utils/constants";
import Loader from "~/common/loader";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import UploadFile from "~/common/uploadFile";
import Modal from "~/common/Modal";
import ImagePreview from "~/common/imagePreview";
import { IUploadFile } from "~/interfaces/common";
import AddNoteModal from "../addNoteModal";
import ShowNotesAndActivity from "~/common/showNotesAndActivity";
import { Gender, PaymentMethod, Policyholder, UserRole } from "@prisma/client";
import { ToastContainer, toast } from "react-toastify";
import { BsArrowRightSquareFill } from "react-icons/bs";
import ErrorComponent from "~/common/errorPage";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import FormComponent from "~/common/form";
import {
  childrenEdit,
  editApplicationAddress,
  editApplicationContactDetails,
  editApplicationDetails,
  editApplicationIdentification,
  editBeneficiaryDetails,
  extendedFamilyEdit,
  deviceMaxPrice,
  notesInput,
  policyDataEdit,
  policyStillBornInputs,
} from "~/utils/constants/policy";
import { IEvent } from "~/interfaces/common/form";
import { IBeneficiary, IMember } from "~/interfaces/policy";
import Button from "~/common/buttons/filledButton";
import {
  dateConversion,
  getMultipleAccessRoles,
  removeUnderScores,
} from "~/utils/helpers";
import { AiOutlineDelete } from "react-icons/ai";
import AddButton from "~/common/buttons/addButton";
import InputField from "~/common/form/input";
import {
  dateOfBirthValidation,
  dateSAIDvalidation,
  validateAge,
  validatePhoneNum,
  validateSAIDNum,
} from "~/utils/helpers/validations";
import { paymentInputs, paymetMethodTypes } from "~/utils/constants/payments";
import { bankOptions } from "~/utils/constants/bankOptions";
import {
  ApplicationStatusValues,
  creditLifeDeviceInputs,
  creditLifeInputs,
  deviceDetailsInputs,
  exludePackages,
  getEditApplicationData,
} from "~/utils/constants/application";
import { checkRequiredFields } from "~/utils/helpers/errors";
import Image from "next/image";
import MemberCard from "~/common/showDetails/memberCard";
import ShowDropdown from "~/common/showDropDown";
import SecondaryButton from "~/common/buttons/secondaryButton";
import { packageNameValues, roleValues } from "~/utils/constants/user";
import PolicyDataComponent from "~/common/policyData";
import Status from "~/common/status";
import ArchivedComponent from "~/common/archivedText";

export interface IEditPolicyHolder {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | null;
  email: string;
  phone: string;
  phoneOther: string;
  streetAddress1: string;
  streetAddress2: string;
  suburb: string;
  city: string;
  country: string;
  areaCode: number;
  appData: string;
  citizenshipId: number;
  salaryReferenceNo: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  updatedById: number;
  identification: any[];
}

export interface IEditBeneficiary {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  percentage: number | null;
  relation: string | null;
  identification: any;
  gender: Gender | null;
  dateOfBirth: Date | null;
  phone: string | null;
  applicationId: string | null;
  policyId: string | null;
  country: string | null;
  number: number | null;
  type: string | null;
}

const ApplicationView = (props: any) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [editFormData, setEditFormData] = useState({} as IEditPolicyHolder);
  const [errorData, setErrorData] = useState({} as any);
  const [idNum, setIdNum] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any>([]);
  const [fileUpload, setFileUpload] = useState<any>([]);
  const [files, setFiles] = useState([
    { name: "", type: "", fileUrl: "", size: 0 },
  ]); // base64
  const createFile = api.uploadLibrary.create.useMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileStore, setFileStore] = useState<any>([]);
  const [notes, setNotes]: any = useState([]);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<any>();
  const [applicationData, setApplicationData] = useState<any>();
  const [issuePolicyModal, setIssuePolicyModel] = useState(false);
  const [rejectApplicationModal, setRejectApplicationModal] = useState(false);
  const applicationUpdate = api.application.update.useMutation();
  const updateBeneficiary = api.application.updateBeneficiary.useMutation();
  const statusUpdate = api.application.status.useMutation();
  const [showRejectApplication, setShowRejectApplication] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [policyDisable, setPolicyDisable] = useState(false);
  const [editApplication, setEditApplication] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [showApplicationData, setShowApplicationData] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [beneficiaryEdit, setBeneficiaryEdit] = useState(false);
  const session = useSession();

  const [paymentMethod, setPaymentMethod] = useState<any>([]);
  const [paymentEdit, setPaymentEdit] = useState(false);
  const updatePolicyHolder = api.policyholder.update.useMutation();
  const [beneficiaryErrors, setBeneficiaryErrors] = useState<Array<any>>([]);
  const [disable, setDisable] = useState(false);
  const [spouseError, setSpouseError] = useState({} as any);
  const [formErrors, setFormErrors] = useState({
    spouse: [{}],
    children: [{}],
    extendedFamily: [{}],
    beneficiaries: [{}],
    paymentMethod: {},
  });
  const [alterDisable, setAlterDisable] = useState(false);
  const [policyHolder, setPolicyHolder] = useState<{ [key: string]: any }>({});
  const [policyHolderName, setPolicyHolderName] = useState<string>("");
  const [includeChildren, setIncludeChildren] = useState({
    includeChildren: false,
  });
  const [extendedFamily, setExtendedFamily] = useState({
    extendedFamily: false,
  });
  const [includeSpouse, setIncludeSpouse] = useState({
    includeSpouse: false,
  });
  const [beneficiariesData, setBeneficiariesData] = useState<any[]>([]);
  const [objects, setObjects] = useState<{ [key: string]: any }>({});
  const [arrays, setArrays] = useState<{ [key: string]: any[] }>({});
  const [applicationDataNew, setApplicationDataNew] = useState<{
    [key: string]: any;
  }>({});
  const [remaining, setRemaining] = useState<{ [key: string]: any }>({});
  const [create, setCreate] = useState<{ [key: string]: any }>({});
  const [newData, setNewData] = useState({});
  const [updateData, setUpdateData] = useState<{ [key: string]: any }>({});
  const [paymentMethodData, setPaymentMethodData] = useState<{
    [key: string]: any;
  }>({});
  const [paymentToggle, setPaymentToggle] = useState(true);
  const [paymentActiveTabs, setPaymentActiveTabs] = useState("paymentDetails");
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [showDetails, setShowDetails] = useState({
    spouse: false,
    children: false,
    extendedFamily: false,
    beneficiaries: false,
    paymentMethods: false,
    policyHolder: false,
    documents: false,
  });
  const [selectPaymentType, setSelectPaymentType] = useState<string>("");
  const paymentUpdate = api.application.updatePayment.useMutation();
  const [applicationInputs, setApplicationInputs] = useState({} as any);
  const [loanSettlement, setLoanSettlement] = useState(0);
  const [fileDisable, setFileDisable] = useState<Boolean>(false);
  const [hiddenTabs, setHiddenTabs] = useState([] as string[]);
  const [deviceFormErrors, setDeviceFormErrors] = useState({} as any);
  const [applicationNotes, setApplicationNote] = useState({
    title: "",
    description: "",
  });
  const [paymentInput, setPaymentInput] = useState(paymentInputs);

  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const deleteBeneficiary = api.beneficiaries.delete.useMutation();

  const handleIdentificationChange = (e: IEvent, index: number = 0) => {
    const form = { ...editFormData };
    const { name, value } = e.target;
    form.identification[index] = {
      ...editFormData.identification[index],
      [name]: value,
    };
    setEditFormData({ ...form });
  };

  const handleApllicationOnHold = async () => {
    setLoading(true);
    try {
      const ApplicationOnHold = await statusUpdate.mutateAsync({
        id: data?.id ?? "",
        status: "PENDING",
        ...(data?.leadId && { leadId: data?.leadId, applicationOnhold: true }),
      });
      if (ApplicationOnHold) {
        toast.success("Application put on hold and lead is updated");
      } else {
        toast.error("Cannot put the application on hold");
      }
    } catch (error) {
      toast.error("Cannot put the application onHold");
    } finally {
      setLoading(false);
      refetch();
    }
  };
  const handleClaimOnHold = () => {};
  const handleNoteChange = (e: IEvent, index: number = 0) => {
    let form = { ...note };
    const { name, value } = e.target;
    form[name] = value;
    setNote({ ...form });
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

  const addNewMember = () => {
    setBeneficiaries([...beneficiaries, { identification: {} }]);
    setBeneficiaryErrors([...beneficiaryErrors, {}]);
  };

  const deleteMember = async (index: number) => {
    if (beneficiaries[index].id) {
      setLoading(true);
      const deletedBeneficiary = await deleteBeneficiary.mutateAsync({
        id: beneficiaries[index].id,
      });
      if (deletedBeneficiary) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    const beneficiaryDetails = [...beneficiaries];
    beneficiaryDetails.splice(index, 1);
    setBeneficiaries([...beneficiaryDetails]);
    const beneficiariesErrors = [...beneficiaryErrors];
    beneficiariesErrors.splice(index, 1);
    setBeneficiaryErrors([...beneficiariesErrors]);
  };

  const handleFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;

    if (name == "email") {
      const result = validateEmail(value);
      setErrorData({
        ...errorData,
        [name]: result ? "" : "Invalid email",
      });
    }
    if (name == "dateOfBirth") {
      const result = dateOfBirthValidation(value);
      setErrorData({
        ...errorData,
        [name]: result ? "" : "Invalid date of birth",
      });
    }

    setEditFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePhoneChange = (name: string, value: any) => {
    const result = validatePhoneNum(value);
    setErrorData({
      ...errorData,
      [name]: result ? "" : "Invalid phone number",
    });
    setEditFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onEditSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setEditOpen(false);
    try {
      const req: any = {
        country: editFormData.country,
        citizenshipId: editFormData.citizenshipId.toString(),
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        type: editFormData.type,
        dateOfBirth: new Date(editFormData.dateOfBirth),
        gender: editFormData.gender?.toUpperCase() as Gender,
        email: editFormData.email,
        phone: editFormData.phone.replace(/[\s-]/g, ""),
        streetAddress1: editFormData.streetAddress1,
        streetAddress2: editFormData.streetAddress2,
        suburb: editFormData.suburb,
        city: editFormData.city,
        areaCode: editFormData.areaCode.toString(),
        appData: editFormData.appData as any,
        identification: editFormData.identification,
      };
      if (editFormData.phoneOther) {
        req.phoneOther = editFormData.phoneOther.replace(/[\s-]/g, "");
      }

      var res = await updatePolicyHolder.mutateAsync({
        id: editFormData.id,
        body: req,
      });
      if (res) {
        setEditFormData({
          ...editFormData,
          id: res.id,
          citizenshipId: res.citizenshipId,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          phone: res.phone,
          phoneOther: res.phoneOther,
          streetAddress1: res.streetAddress1,
          streetAddress2: res.streetAddress2,
          suburb: res.suburb,
          city: res.city,
          country: res.country,
          areaCode: res.areaCode,
          gender: res.gender,
          dateOfBirth: dateConversion(res.dateOfBirth),
        });
        setApplicationData({
          ...applicationData,
          policyholder: res,
        });
        setLoading(false);
        toast.success("Policyholder updated successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update policyholder");
      }
    } catch (error: any) {
      toast.error("Failed to update policyholder");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
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
          ...(beneficiary?.phone && {
            phone: beneficiary?.phone.replace(/[\s-]/g, ""),
          }),
        };
      }),
    };

    try {
      const applicationResponse = await updateBeneficiary.mutateAsync({
        id: data?.id ?? "",
        body: req,
      });
      if (applicationResponse) {
        setBeneficiaryEdit(false);
        setLoading(false);
        setBeneficiaries(
          applicationResponse.beneficiaries.map((beneficiary: any) => {
            return {
              ...beneficiary,
              ...(beneficiary?.dateOfBirth && {
                dateOfBirth: dateConversion(beneficiary?.dateOfBirth),
              }),
            };
          })
        );
        setApplicationData({
          ...applicationData,
          beneficiaries: applicationResponse.beneficiaries,
        });
        toast.success("Beneficiary updated successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update Beneficiary");
      }
    } catch (error: any) {
      toast.error("Failed to update Beneficiary");
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

  const [count, setCount] = useState(1);
  const [showIsArchive, setShowIsArchive] = useState(false);
  const [isArchivedModal, setIsArchivedModal] = useState(false);
  const archivedApplication = api.application.archived.useMutation();

  const modalClose = () => {
    setSelectedBar(null);
    setImageModalOpen(false);
  };

  const imageOverview = (index: any) => {
    setImageModalOpen(true);
    setSelectedBar(index);
  };
  const [showActivitySection, setShowActivitySection] = useState(true);

  const handleModalOpen = () => {
    setFileUpload([]);
    setIsModalOpen(true);
  };
  const router = useRouter();
  const applicationId = router.query.id as String;

  //show API

  const {
    isLoading,
    data,
    error,
    refetch: dataRefetch = () => {},
  } = currentRoleAccessLevels?.Application?.canView
    ? api.application.show.useQuery(applicationId as string, {
        enabled: showApplicationData,
      })
    : { isLoading: false, data: null as any, error: null };

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
        selected: `${data?.applicationData?.deviceData?.deviceType}`,
      });
      setModelName({
        ...modelName,
        selected: `${data?.applicationData?.deviceData?.deviceModel}`,
      });
      setColor({
        ...color,
        selected: `${data?.applicationData?.deviceData?.deviceModelColor}`,
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
    // const updatedDetails: any = { ...details };

    // if ("leadId" in updatedDetails) {
    //   updatedDetails["prospectNumber"] = updatedDetails["leadNumber"];
    //   delete updatedDetails["leadNumber"];
    // }

    // if ("leadType" in updatedDetails) {
    //   updatedDetails["prospectType"] = updatedDetails["leadType"];
    //   delete updatedDetails["leadType"];
    // }
    // setUpdateData(updatedDetails);
  }, [data, editApplication]);

  useEffect(() => {
    if (!deviceType.selected) return;

    delete applicationData?.applicationData?.deviceData?.deviceBrand;
    delete applicationData?.applicationData?.deviceData?.deviceModel;
    delete applicationData?.applicationData?.deviceData?.deviceModelColor;
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
      brand.selected !=
        applicationData?.applicationData?.deviceData?.deviceBrand ||
      count > 1
    ) {
      delete applicationData?.applicationData?.deviceData?.deviceModel;
      delete applicationData?.applicationData?.deviceData?.deviceModelColor;
    }
    setCount(count + 1);
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
    delete applicationData?.applicationData?.deviceData?.deviceModelColor;
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
    if (data) {
      setNewData(data);
      setLoanSettlement(
        data?.applicationData?.creditLife?.loanSettlementAtInception
      );
      if (
        data.packageName === packageNames.device ||
        data.packageName === packageNames.retailDeviceInsurance
      ) {
        const hiddenTabs = ["beneficiaries"];
        setHiddenTabs(hiddenTabs);
      }
    }
    if (
      data?.packageName == packageNames.retailDeviceInsurance ||
      data?.packageName == packageNames.retailDeviceCreditLife
    ) {
      setAllRequiredFields("true");
    }
  }, [data]);

  useEffect(() => {
    if (data && data?.packageName === packageNames.creditLifeMotor) {
      setApplicationData({
        ...data,
        applicationData: {
          ...data?.applicationData,
          creditLife: {
            ...data?.applicationData?.creditLife,
          },
        },
        startDate: dateConversion(data?.startDate),
        endDate: dateConversion(data?.endDate),
        renewalDate: dateConversion(data?.renewalDate),
      });
    }
  }, [data]);
  useEffect(() => {
    if (isLoading) {
      setObjects({});
      setArrays({});
      setRemaining({});
    } else {
      // Object.entries(newData).forEach(([key, value]) => {
      //   let newKey=key;
      //   if (Array.isArray(value)) {
      //     setArrays((prevArrays) => ({ ...prevArrays, [key]: value }));
      //   } else if (typeof value === "object") {
      //     if (
      //       key !== "updatedBy" &&
      //       key !== "createdBy" &&
      //       key !== "updatedAt" &&
      //       key !== "createdAt" &&
      //       key !== "endDate" &&
      //       key !== "renewalDate" &&
      //       key !== "startDate"
      //     ) {
      //       setObjects((prevObjects) => ({ ...prevObjects, [key]: value }));
      //     } else {
      //       setCreate((prevObjects) => ({ ...prevObjects, [key]: value }));
      //     }
      //   } else {
      //     if (key === "packageName" || key === "billingFrequency") {
      //       setApplicationDataNew((prevObjects) => ({
      //         ...prevObjects,
      //         [key]: value,
      //       }));
      //     } else if (key === "policyholderId" || key === "options") {
      //       setPolicyHolder((prevObjects) => ({
      //         ...prevObjects,
      //         [key]: value,
      //       }));
      //     } else {
      //       setRemaining((prevObjects) => ({ ...prevObjects, [key]: value }));
      //     }
      //   }
      // });
      Object.entries(newData).forEach(([key, value]) => {
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
            setCreate((prevObjects) => ({ ...prevObjects, [newKey]: value }));
          }
        } else {
          if (key === "packageName" || key === "billingFrequency") {
            setApplicationDataNew((prevObjects) => ({
              ...prevObjects,
              [key]: value,
            }));
          } else if (key === "policyholderId" || key === "options") {
            setPolicyHolder((prevObjects) => ({
              ...prevObjects,
              [key]: value,
            }));
          }

          if (key === "leadId") {
            newKey = "prospectId";
          }
          setRemaining((prevObjects) => ({ ...prevObjects, [newKey]: value }));
        }
      });
    }
  }, [isLoading, newData]);
  useEffect(() => {
    delete objects?.policyholder?.updatedAt;
    delete objects?.policyholder?.createdAt;
  }, [newData, create]);

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
    const createdDate = dateConversion(create.createdAt);
    const updatedDate = dateConversion(create.updatedAt);
    const endDate = dateConversion(create?.endDate);
    const renewalDate = dateConversion(create?.renewalDate);
    const startDate = dateConversion(create?.startDate);
    const createdBy = create.createdBy
      ? create.createdBy?.firstName + " " + create?.createdBy?.lastName
      : null;
    const updatedBy = create.updatedBy
      ? create.updatedBy?.firstName + " " + create?.updatedBy?.lastName
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
  }, [create]);
  useEffect(() => {
    setBeneficiariesData([]);
    arrays?.beneficiaries?.map((item: any) => {
      const mergedObject = flattenObject(item);
      delete mergedObject.applicationId;
      setBeneficiariesData((prevData: any[]) => [...prevData, mergedObject]);
    });
  }, [arrays]);

  function flattenObject(obj: { [key: string]: any }): { [key: string]: any } {
    const flattened: { [key: string]: any } = {};

    for (let key in obj) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        if (obj[key] instanceof Date) {
          flattened[key] = obj[key].toString();
        } else {
          const nestedObject = flattenObject(obj[key]);
          for (let nestedKey in nestedObject) {
            flattened[nestedKey] = nestedObject[nestedKey];
          }
        }
      } else {
        flattened[key] = obj[key];
      }
    }
    return flattened;
  }

  useMemo(() => {
    if (data && !error) {
      switch (data?.packageName) {
        case packageNames.funeral:
          setApplicationData({
            ...data,
            applicationData: {
              ...data.applicationData,
              members: {
                ...data.applicationData?.members,
                mainMember: {
                  ...data.applicationData?.members?.mainMember,
                  dateOfBirth: new Date(
                    data.applicationData?.members?.mainMember?.dateOfBirth
                  ),
                },
                ...(data?.applicationData?.members?.spouse && {
                  spouse: data.applicationData?.members?.spouse?.map(
                    (spouse: any) => {
                      return {
                        ...spouse,
                        dateOfBirth: new Date(spouse?.dateOfBirth),
                      };
                    }
                  ),
                }),
                children: data.applicationData?.members?.children?.map(
                  (child: { dateOfBirth: string }) => {
                    return {
                      ...child,
                      dateOfBirth: new Date(child?.dateOfBirth),
                    };
                  }
                ),
                extendedFamily:
                  data.applicationData?.members?.extendedFamily?.map(
                    (family: any) => {
                      return {
                        ...family,
                        dateOfBirth: new Date(family?.dateOfBirth),
                      };
                    }
                  ),
              },
            },
            startDate: dateConversion(data?.startDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.creditLifeMotor:
          setApplicationData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              creditLife: {
                ...data?.applicationData?.creditLife,
              },
            },
            startDate: dateConversion(data?.startDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.device:
          setApplicationData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              deviceData: {
                ...data?.applicationData?.deviceData,
              },
            },
            startDate: dateConversion(data?.startDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.creditLifeDevice:
          setApplicationData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              deviceCreditLife: {
                ...data.applicationData?.deviceCreditLife,
              },
            },
            startDate: dateConversion(data?.startDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
        case packageNames.retailDeviceInsurance:
          setApplicationData({
            ...data,
            applicationData: {
              ...data?.applicationData,
              deviceData: {
                ...data?.applicationData?.deviceData,
              },
            },
            startDate: dateConversion(data?.startDate),
            endDate: dateConversion(data?.endDate),
            renewalDate: dateConversion(data?.renewalDate),
          });
          break;
        case packageNames.retailDeviceCreditLife:
          setApplicationData({
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
      }
    }
    const editApplicationInputData = getEditApplicationData(data?.packageName);
    setApplicationInputs(editApplicationInputData);
    setShowApplicationData(false);
    return null;
  }, [data]);

  useEffect(() => {
    if (data) {
      setEditFormData({
        ...editFormData,
        id: data.policyholder.id,
        citizenshipId: data.policyholder.citizenshipId,
        firstName: data.policyholder.firstName,
        lastName: data.policyholder.lastName,
        email: data.policyholder.email,
        phone: data.policyholder.phone,
        phoneOther: data.policyholder.phoneOther,
        streetAddress1: data.policyholder.streetAddress1,
        streetAddress2: data.policyholder.streetAddress2,
        suburb: data.policyholder.suburb,
        city: data.policyholder.city,
        country: data.policyholder.country,
        areaCode: data.policyholder.areaCode,
        gender: data.policyholder.gender,
        dateOfBirth: dateConversion(data.policyholder.dateOfBirth),
      });
      setBeneficiaries(
        data.beneficiaries.map((beneficiary: any) => {
          return {
            ...beneficiary,
            dateOfBirth:
              beneficiary.dateOfBirth &&
              dateConversion(beneficiary.dateOfBirth),
          };
        })
      );
    }
  }, [data]);

  useEffect(() => {
    setShowApplicationData(true);
  }, []);

  const checkProperty = () => {
    setLoading(true);
    if (applicationData?.createdBy && applicationData?.createdBy !== null) {
      applicationData.createdBy =
        data?.createdBy?.firstName + "" + data?.createdBy?.lastName;
    }
    if (applicationData?.updatedBy && applicationData?.updatedBy !== null) {
      applicationData.updatedBy =
        data?.updatedBy?.firstName + "" + data?.updatedBy?.lastName;
    }
  };
  const handleIssuePolicy = () => {
    setIssuePolicyModel(!issuePolicyModal);
  };

  const handleRejectApplication = () => {
    setRejectApplicationModal(true);
  };

  const handleAlterApplication = () => {
    setEditApplication(true);
  };

  const generateApplicationData = (
    applicationData: any,
    mainMember: any,
    packageName: string
  ) => {
    switch (packageName) {
      case packageNames.creditLifeMotor:
        return {
          packageName: applicationData?.packageName,
          creditLife: {
            ...applicationData.applicationData.creditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              applicationData.applicationData.creditLife
                .outstandingSettlementBalance
            ),
            ...(loanSettlement && {
              loanSettlementAtInception: Number(loanSettlement),
            }),
          },
        };
      case packageNames.funeral:
        const formattedData = {
          packageName: applicationData?.packageName,
          withFreeBenefit: applicationData?.applicationData?.withFreeBenefit,
          members: {
            ...applicationData?.applicationData?.members,
            mainMember: {
              ...applicationData?.applicationData?.members?.mainMember,
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
            applicationData?.applicationData.members.spouse.map(
              (spouse: any) => {
                return {
                  ...spouse,
                  dateOfBirth: new Date(spouse?.dateOfBirth),
                  ...(spouse.createdAt
                    ? { createdAt: new Date(spouse.createdAt) }
                    : {}),
                  ...(spouse.updatedAt
                    ? { updatedAt: new Date(spouse.updatedAt) }
                    : {}),
                };
              }
            );
        }
        if (includeChildren.includeChildren) {
          formattedData.members.children =
            applicationData?.applicationData?.members?.children?.map(
              (child: any) => {
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
              }
            );
        }
        if (extendedFamily.extendedFamily) {
          formattedData.members.extendedFamily =
            applicationData?.applicationData?.members?.extendedFamily?.map(
              (family: any) => {
                return {
                  ...family,
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
          packageName: applicationData.packageName,
          deviceData: {
            ...applicationData.applicationData.deviceData,
            devicePrice: Number(
              applicationData.applicationData.deviceData.devicePrice
            ),
          },
        };
      case packageNames.creditLifeDevice:
        return {
          packageName: applicationData?.packageName,
          deviceCreditLife: {
            ...applicationData.applicationData.deviceCreditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              applicationData.applicationData.deviceCreditLife
                .outstandingSettlementBalance
            ),
            ...(loanSettlement && {
              loanSettlementAtInception: Number(loanSettlement),
            }),
          },
        };
      case packageNames.retailDeviceInsurance:
      case packageNames.retailDeviceInsurance:
        return {
          packageName: applicationData?.packageName,
          deviceData: {
            ...applicationData?.applicationData?.deviceData,
            devicePrice: Number(
              applicationData?.applicationData?.deviceData?.devicePrice
            ),
          },
        };
      case packageNames.retailDeviceCreditLife:
        return {
          packageName: applicationData?.packageName,
          deviceCreditLife: {
            ...applicationData?.applicationData?.deviceCreditLife,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              applicationData?.applicationData?.deviceCreditLife
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

  const applicationEditSave = async () => {
    setEditApplication(!editApplication);
    setLoading(true);
    const mainMember = applicationData?.applicationData?.members?.mainMember;
    const req: any = {
      isArchived: applicationData?.isArchived,
      billingFrequency: applicationData?.billingFrequency ?? "MONTHLY",
      ...(data?.packageName === packageNames.funeral && {
        options: applicationData?.options,
      }),
      billingDay: Number(applicationData?.billingDay),
      status: applicationData?.status,
      startDate: new Date(applicationData?.startDate),
      endDate: new Date(applicationData?.endDate),
      policyholderId: applicationData?.policyholderId,
      applicationData: generateApplicationData(
        applicationData,
        mainMember,
        data?.packageName
      ),
      schemeType: applicationData?.schemeType ?? "GROUP",
      renewalDate: new Date(applicationData?.renewalDate),
      autoRenewal: applicationData?.autoRenewal ?? false,
    };
    try {
      const applicationResponse = await applicationUpdate.mutateAsync({
        id: data?.id ?? "",
        body: req,
      });
      if (applicationResponse) {
        setLoading(false);
        toast.success("Application updated successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update application");
      }
    } catch (error: any) {
      toast.error("Failed to update application");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  useEffect(() => {
    const members = applicationData?.applicationData?.members;

    setIncludeChildren({
      includeChildren: members?.children?.length > 0 || false,
    });

    setIncludeSpouse({
      includeSpouse: members?.spouse?.length > 0 || false,
    });

    setExtendedFamily({
      extendedFamily: members?.extendedFamily?.length > 0 || false,
    });
  }, [applicationData]);

  const handleEditApplicationDataChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    const form: any = { ...applicationData };
    if (name == "autoRenewal") {
      form[name] = checked;
      setApplicationData({ ...form });
    } else {
      form[name] = value;
      setApplicationData({ ...form });
    }
  };

  const handleEditMainMemberChange = (e: IEvent) => {
    const { name, value } = e.target;
    const form: any = { ...applicationData };
    let dateOfBirth;
    if (!form.applicationData.members.mainMember) {
      form.applicationData.members.mainMember = {};
    }
    form.applicationData.members.mainMember[name] = value;
    const mainMember = form.applicationData.members.mainMember;
    if (name === "said") {
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        mainMember.dateOfBirth = dateOfBirth;
      } else {
        dateOfBirth = "";
        mainMember.dateOfBirth = dateOfBirth;
      }
    }
    setApplicationData({ ...form });
  };

  const handleIncludeSpouse = (event: IEvent, index: number = 0) => {
    const { name, checked } = event.target;
    setIncludeSpouse({ includeSpouse: checked as boolean });

    const form: any = { ...applicationData };

    if (!checked) {
      form.applicationData.members.spouse = [];
    } else if (
      !form.applicationData.members.spouse ||
      form.applicationData.members.spouse.length === 0
    ) {
      form.applicationData.members["spouse"] = [
        {
          firstName: "",
          lastName: "",
        },
      ];
    }

    setApplicationData(form);
  };

  const deleteSpouse = (index: number) => {
    const slicedData = { ...applicationData };
    slicedData.applicationData.members.spouse.splice(index, 1);
    formErrors.spouse.splice(index, 1);
    if (slicedData.applicationData.members.spouse.length == 0) {
      setIncludeSpouse({ includeSpouse: false });
    }
    setApplicationData({ ...slicedData });
  };

  const handleEditSpouse = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const error = formErrors?.spouse;
    const updatedApplicationData = { ...applicationData };
    if (!updatedApplicationData.applicationData.members.spouse) {
      updatedApplicationData.applicationData.members.spouse = [{}];
    }
    const spouse = updatedApplicationData.applicationData.members.spouse[index];
    spouse[name] = value;
    let dateOfBirth;
    if (name === "said") {
      let errorMessage = "";
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        const age = validateAge(dateOfBirth);

        if (
          age < employeeFuneralAges.spouse.minAge ||
          age > employeeFuneralAges.spouse.maxAge
        ) {
          errorMessage = `Spouse age should be between ${employeeFuneralAges.spouse.minAge} and ${employeeFuneralAges.spouse.maxAge}`;
        }
      } else if (value !== "") {
        errorMessage = "Invalid SA-ID";
        dateOfBirth = "";
      }

      error[index] = {
        ...error[index],
        [name]: errorMessage,
      };

      spouse.dateOfBirth = dateOfBirth;
    }

    if (name === "email") {
      if (validateEmail(value) || value == "") {
        error[index] = {
          ...error[index],
          [name]: "",
        };
      } else {
        error[index] = {
          ...error[index],
          [name]: "Invalid email",
        };
      }
    }

    setFormErrors({ ...formErrors, spouse: error });
    setApplicationData({ ...updatedApplicationData });
  };

  const addNewSpouse = () => {
    const updatedApplicationData = { ...applicationData };
    setApplicationData({
      ...updatedApplicationData,
      applicationData: {
        ...updatedApplicationData.applicationData,
        members: {
          ...updatedApplicationData.applicationData.members,
          spouse: [
            ...updatedApplicationData.applicationData.members?.spouse,
            {},
          ],
        },
      },
    });
  };

  const handleCheckbox = (event: IEvent, index: number = 0) => {
    const { name, checked } = event.target;
    setIncludeChildren({ includeChildren: checked as boolean });

    const form: any = { ...applicationData };

    if (!checked) {
      form.applicationData.members.children = [];
    } else if (
      !form.applicationData.members.children ||
      form.applicationData.members.children.length === 0
    ) {
      form.applicationData.members["children"] = [
        {
          firstName: "",
          lastName: "",
          isStudying: false,
          isDisabled: false,
          isStillBorn: false,
        },
      ];
    }
    setApplicationData(form);
  };

  const deleteChild = (index: number) => {
    const slicedData = { ...applicationData };
    slicedData.applicationData.members.children.splice(index, 1);
    formErrors.children.splice(index, 1);
    if (slicedData.applicationData.members.children.length == 0) {
      setIncludeChildren({ includeChildren: false });
    }
    setApplicationData({ ...slicedData });
  };

  const handleEditChildrenChange = (e: IEvent, index: number = 0) => {
    const { name, value, checked } = e.target;
    const errors = { ...formErrors };
    const updatedApplicationData = { ...applicationData };
    if (!updatedApplicationData.applicationData.members.children) {
      updatedApplicationData.applicationData.members.children = [{}];
    }
    const child =
      updatedApplicationData.applicationData.members.children[index];
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
    setApplicationData({ ...updatedApplicationData });
  };

  const addNewChild = () => {
    const updatedApplicationData = { ...applicationData };
    setApplicationData({
      ...updatedApplicationData,
      applicationData: {
        ...updatedApplicationData.applicationData,
        members: {
          ...updatedApplicationData.applicationData.members,
          children: [
            ...updatedApplicationData.applicationData.members.children,
            {
              isStudying: false,
              isStillBorn: false,
              isDisabled: false,
            },
          ],
        },
      },
    });
  };

  const handleExtendedFamilyCheckbox = (event: IEvent, index: number = 0) => {
    const { name, checked } = event.target;
    setExtendedFamily({ extendedFamily: checked as boolean });

    const form: any = { ...applicationData };

    if (!checked) {
      form.applicationData.members.extendedFamily = [];
    } else if (
      !form.applicationData.members.extendedFamily ||
      form.applicationData.members.extendedFamily.length === 0
    ) {
      form.applicationData.members["extendedFamily"] = [
        {
          firstName: "",
          lastName: "",
          email: "",
          relation: "",
        },
      ];
    }

    setApplicationData(form);
  };

  const deleteExtendedMember = (index: number) => {
    const slicedData = { ...applicationData };
    slicedData.applicationData.members.extendedFamily.splice(index, 1);
    formErrors.extendedFamily.splice(index, 1);
    if (slicedData.applicationData.members.extendedFamily.length == 0) {
      setExtendedFamily({ extendedFamily: false });
    }
    setApplicationData({ ...slicedData });
  };

  const handleEditExtendedFamily = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const errors = { ...formErrors };
    const updatedApplicationData = { ...applicationData };
    if (!updatedApplicationData.applicationData.members.extendedFamily) {
      updatedApplicationData.applicationData.members.extendedFamily = [{}];
    }
    const extendedFamily =
      updatedApplicationData.applicationData.members.extendedFamily[index];
    extendedFamily[name] = value;
    let dateOfBirth;
    if (name === "said") {
      let errorMessage = "";
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        const age = validateAge(dateOfBirth);

        if (
          age < employeeFuneralAges.extendedFamily.minAge ||
          age > employeeFuneralAges.extendedFamily.maxAge
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
        errors.children[index] = {
          ...errors.children[index],
          [name]: "",
        };
      } else {
        errors.children[index] = {
          ...errors.children[index],
          [name]: "Invalid Email",
        };
      }
    }
    setFormErrors({ ...errors });
    setApplicationData({ ...updatedApplicationData });
  };

  const addNewExtendedMember = () => {
    const updatedApplicationData = { ...applicationData };
    setApplicationData({
      ...updatedApplicationData,
      applicationData: {
        ...updatedApplicationData.applicationData,
        members: {
          ...updatedApplicationData.applicationData.members,
          extendedFamily: [
            ...updatedApplicationData.applicationData.members.extendedFamily,
            {},
          ],
        },
      },
    });
  };

  const handleIsArchived = () => {
    setIsArchivedModal(!isArchivedModal);
  };

  useEffect(() => {
    if (data?.createdBy || data?.updatedBy) {
      checkProperty();
      setLoading(false);
    }
  }, [data]);

  //Note API
  let {
    isLoading: noteLoading,
    data: noteData,
    error: noteError,
  } = currentRoleAccessLevels?.Application?.canView
    ? api.applicationNote.findByApplicationId.useQuery(
        router.query.id as string
      )
    : { isLoading: false, data: null, error: null };

  //Activity API

  let {
    isLoading: activityLoading,
    data: activityData,
    refetch = () => {},
    error: activityError,
  } = currentRoleAccessLevels?.Application?.canView
    ? api.applicationActivity.findByApplicationId.useQuery(
        router.query.id as string
      )
    : { isLoading: false, data: null, error: null };

  const handleRefetch = () => {
    refetch();
  };

  const handleDataRefetch = () => {
    dataRefetch();
  };

  useEffect(() => {
    handleRefetch();
  }, [applicationData, fileStore]);

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);
  const addnote = api.applicationNote.create.useMutation();
  const handleNoteSubmit = async (title: string, description: string) => {
    setLoading(true);
    try {
      const res = await addnote.mutateAsync({
        applicationId: router.query.id as string,
        title: title,
        description: description,
      });
      if (res) {
        let copy = [...notes];
        copy.push(res);
        setNotes(copy);
        setNote({ title: "", description: "" });
        toast.success("Notes added successfully");
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

  const closeModal = () => {
    setFileUpload([]);
    setIsModalOpen(false);
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

  const checkFileSize = () => {
    if (fileUpload.length < 1) {
      setButtonDisable(true);
      return;
    }
    const isFileTooLarge = fileUpload.some(
      (file: any) => file.size > 8 * 1024 * 1024
    );
    setButtonDisable(isFileTooLarge);
  };

  useMemo(() => {
    imageData();
    if (fileUpload.length > 0) {
      setButtonDisable(false);
      if (fileDisable) {
        setButtonDisable(true);
      }
    }
    checkFileSize();
    return null;
  }, [fileUpload, fileDisable]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const uploadingFiles = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            referenceId: applicationId,
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            category: "application",
            createdById: data?.createdById,
          };
          const res = await createFile.mutateAsync(req);
          if (!res) {
            setLoading(false);
            toast.error("Failed to upload document");
          }
          return res;
        })
      );
      setFileStore([...fileStore, ...uploadingFiles]);
      setIsModalOpen(false);
      setLoading(false);
      toast.success("Document uploaded successfully");
    } catch (err: any) {
      toast.error("Failed to upload document");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const issuePolicy = async () => {
    setIssuePolicyModel(!issuePolicyModal);
    setLoading(true);
    const mainMember = applicationData?.applicationData?.members?.mainMember;
    const req: any = {
      isArchived: applicationData?.isArchived,
      billingFrequency: applicationData?.billingFrequency,
      ...(applicationData?.options && { options: applicationData?.options }),
      billingDay: Number(applicationData?.billingDay),
      status: ApplicationStatusValues?.approved,
      startDate: new Date(applicationData?.startDate),
      endDate: new Date(applicationData?.endDate),
      policyholderId: applicationData?.policyholderId,
      applicationData: generateApplicationData(
        applicationData,
        mainMember,
        data?.packageName
      ),
      schemeType: applicationData?.schemeType ?? "GROUP",
      renewalDate: new Date(applicationData?.renewalDate),
      autoRenewal: applicationData?.autoRenewal ?? false,
    };
    if (paymentMethod[paymentMethod.length - 1]) {
      const currentPaymentMethod = paymentMethod[paymentMethod.length - 1];
      req.paymentMethod = {
        ...(currentPaymentMethod?.collectionType && {
          collectionType: currentPaymentMethod?.collectionType,
        }),
        ...(currentPaymentMethod?.accountHolder && {
          accountHolder: currentPaymentMethod?.accountHolder,
        }),
        ...(currentPaymentMethod?.bank && { bank: currentPaymentMethod?.bank }),
        ...(currentPaymentMethod?.branchCode && {
          branchCode: currentPaymentMethod?.branchCode,
        }),
        ...(currentPaymentMethod?.accountNumber && {
          accountNumber: currentPaymentMethod?.accountNumber,
        }),
        ...(currentPaymentMethod?.accountType && {
          accountType: currentPaymentMethod?.accountType,
        }),
        ...(currentPaymentMethod?.extrenalReference && {
          externalReference: currentPaymentMethod?.extrenalReference,
        }),
        ...(currentPaymentMethod?.billingAddress && {
          billingAddress: currentPaymentMethod?.billingAddress,
        }),
        ...(currentPaymentMethod?.paymentMethodType && {
          paymentMethodType: currentPaymentMethod?.paymentMethodType,
        }),
      };
    }
    try {
      const applicationResponse = await applicationUpdate.mutateAsync({
        id: data?.id ?? "",
        body: req,
      });
      if (applicationResponse) {
        toast.success("Policy issued successfully");
        setLoading(false);
      } else {
        toast.error("Failed to issue policy");
        setLoading(false);
      }
    } catch (error: any) {
      toast.error("Failed to issue policy");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const rejectApplication = async () => {
    setRejectApplicationModal(!rejectApplicationModal);
    setLoading(true);

    try {
      const applicationResponse = await statusUpdate.mutateAsync({
        id: data?.id ?? "",
        status: "REJECTED",
        ...(data?.leadId && {
          leadId: data?.leadId,
          applicationRejected: true,
        }),
      });
      let res;
      if (applicationResponse) {
        res = await addnote.mutateAsync({
          applicationId: data?.id as string,
          title: applicationNotes.title,
          description: applicationNotes.description,
        });
      }
      if (
        applicationResponse &&
        res &&
        applicationNotes.title &&
        applicationNotes.description
      ) {
        router.push(`/application/${data?.id}/show`);
        setLoading(false);
        toast.success("Application Rejected");
      } else {
        setLoading(false);
        toast.error("Failed to reject application");
      }
    } catch (error: any) {
      toast.error("Failed to reject application");
    } finally {
      setLoading(false);
      setApplicationNote({
        title: "",
        description: "",
      });
      handleDataRefetch();
    }
  };
  const archiveApplication = async () => {
    setIsArchivedModal(!isArchivedModal);
    setLoading(true);
    try {
      const applicationData = await archivedApplication.mutateAsync({
        id: data?.id ?? "",
      });
      if (applicationData) {
        router.push(`/application/list`);
        setLoading(false);
        toast.success("Application archived successfully");
      } else {
        setLoading(false);
        toast.error("Failed to archive application");
      }
    } catch (error: any) {
      toast.error("Failed to archive application");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const handleSwapButtonClick = () => {
    if (selectedAccountIndex !== paymentMethod.length - 1) {
      const updatedAccounts: any = [...paymentMethod];
      const selectedAccount: any = paymentMethod[selectedAccountIndex];
      updatedAccounts[selectedAccountIndex] =
        paymentMethod[paymentMethod.length - 1];
      updatedAccounts[paymentMethod.length - 1] = selectedAccount;
      setPaymentMethod(updatedAccounts);
      setSelectedAccountIndex(paymentMethod.length - 1);
      setPaymentMethodData(paymentMethod[paymentMethod.length - 1]);
      setPaymentToggle(!paymentToggle);
    }
  };

  const handleAccountClick = (index: any) => {
    setSelectedAccountIndex(index);
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
  useEffect(() => {
    if (!data) return;

    setFileStore([...data?.fileIds]);

    const isPending = data.status === ApplicationStatusValues.pending;
    const isRejected = data.status === ApplicationStatusValues.rejected;
    const canArchive =
      !data?.isArchived &&
      (isPending || isRejected) &&
      currentRoleAccessLevels.Application.canDelete;
    setShowRejectApplication(isPending && !data?.isArchived);
    setShowIsArchive(canArchive);
  }, [data]);

  useEffect(() => {
    const selectedTab: any = document.getElementById(`${activeTab}`);
    selectedTab?.scrollIntoView({
      block: "start",
      behavior: "smooth",
      inline: "center",
    });
  }, [activeTab]);

  useEffect(() => {
    if (error || activityError || noteError) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error, noteError, activityError]);

  useEffect(() => {
    document.title = "Telkom Application";
  }, []);

  const onClickPaymentEdit = () => {
    setPaymentEdit(true);
    if (paymentMethod.length == 0) {
      setPaymentMethod([...paymentMethod, {}]);
    } else if (paymentMethod.length != 0) {
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
  useEffect(() => {
    if (data) {
      let alterData = data as any;
      if (data.paymentMethod && data?.paymentMethod?.length > 0) {
        const paymentMethodData = data.paymentMethod;
        setPaymentMethod(paymentMethodData);
        setSelectPaymentType(
          paymentMethodData[paymentMethodData.length - 1].paymentMethodType
        );

        delete alterData.paymentMethod;
      }
      if (data?.packageName === packageNames.funeral) {
        setApplicationData({
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
              spouse: {
                ...alterData?.policyData?.members?.spouse,
                dateOfBirth: dateConversion(
                  alterData?.policyData?.members?.spouse?.dateOfBirth
                ),
              },
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
          startDate: dateConversion(alterData?.startDate),
          endDate: dateConversion(alterData?.endDate),
          renewalDate: dateConversion(alterData?.renewalDate),
        });
      }

      setBeneficiaries(
        alterData.beneficiaries.map((beneficiary: any) => {
          return {
            ...beneficiary,
            dateOfBirth:
              beneficiary?.dateOfBirth &&
              dateConversion(beneficiary.dateOfBirth),
          };
        })
      );
    }
  }, [data]);

  useEffect(() => {
    setDisable(!checkRequiredFields(beneficiaryErrors));
  }, [beneficiaryErrors]);

  useEffect(() => {
    if (checkRequiredFields(spouseError) && checkRequiredFields(formErrors)) {
      setAlterDisable(false);
    } else {
      setAlterDisable(true);
    }
  }, [spouseError, formErrors]);

  useEffect(() => {
    setPolicyDisable(!checkRequiredFields(errorData));
  }, [errorData]);

  useEffect(() => {
    setPaymentMethodData(paymentMethod[paymentMethod.length - 1]);
    setPaymentToggle(!paymentToggle);
    setSelectedAccountIndex(paymentMethod.length - 1);
  }, [paymentMethod]);
  useEffect(() => {
    delete paymentMethodData?.policyholderId;
    delete paymentMethodData?.applicationId;
    delete paymentMethodData?.updatedAt;
    delete paymentMethodData?.createdAt;
  }, [paymentToggle]);

  const handleTabClick = (tab: any) => {
    setPaymentActiveTabs(tab);
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

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  const category = router.pathname.split("/")[1];

  const handleCreditLifeChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setApplicationData({
      ...applicationData,
      applicationData: {
        ...applicationData.applicationData,
        creditLife: {
          ...applicationData?.applicationData?.creditLife,
          [name]: value,
        },
      },
      startDate: dateConversion(data?.startDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });
  };

  const handleInception = (e: IEvent) => {
    setLoanSettlement(e.target.value);
  };

  const handleDeviceDataChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setApplicationData({
      ...applicationData,
      applicationData: {
        ...applicationData.applicationData,
        deviceData: {
          ...applicationData?.applicationData?.deviceData,
          [name]: name === "isRecentPurchase" ? checked : value,
        },
      },
      startDate: dateConversion(data?.startDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });
    if (name === "devicePrice") {
      setApplicationData({
        ...applicationData,
        applicationData: {
          ...applicationData.applicationData,
          deviceData: {
            ...applicationData?.applicationData?.deviceData,
            [name]: value,
          },
        },
      });
      if (value > deviceMaxPrice) {
        setAlterDisable(true);
        setDeviceFormErrors({
          ...deviceFormErrors,
          [name]: "please enter value less then 50000",
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
    setApplicationData({
      ...applicationData,
      applicationData: {
        ...applicationData.applicationData,
        deviceCreditLife: {
          ...applicationData.applicationData.deviceCreditLife,
          [name]: value,
        },
      },
      startDate: dateConversion(data?.startDate),
      endDate: dateConversion(data?.endDate),
      renewalDate: dateConversion(data?.renewalDate),
    });
  };

  const handleApplicationNotes = (e: IEvent) => {
    const { name, value } = e.target;
    setApplicationNote({
      ...applicationNotes,
      [name]: value,
    });
  };

  return !currentRoleAccessLevels?.Application?.canView ? (
    <NoAccessComponent />
  ) : !error && !noteError && !activityError ? (
    <>
      {loading || isLoading || noteLoading || activityLoading ? (
        <Loader />
      ) : (
        data &&
        noteData &&
        activityData && (
          <div className="flex flex-row">
            <div className="w-full border-r-2 border-solid border-gray-300">
              <div className="relative flex justify-between border-b">
                <TabsBar
                  tabs={tabs}
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
                    id="summary"
                  >
                    <div className="flex gap-x-3">
                      <h3 className="text-[26px] font-bold leading-9 text-dark-grey">
                        Application Summary
                      </h3>
                      <Status
                        status={
                          data?.Leads?.applicationOnHold &&
                          data?.status == "PENDING" &&
                          data?.Leads?.status != "DECLINED"
                            ? "onHold"
                            : data?.status
                        }
                        page={"Application"}
                        paymentMethod={paymentMethod}
                      />
                      {data?.isArchived && <ArchivedComponent />}
                    </div>

                    {currentRoleAccessLevels?.Application?.canUpdate &&
                      !data?.isArchived && (
                        <ActionButtons
                          isVisible={true}
                          showAddNotes={true}
                          showApplicationOnHold={
                            data?.leadId &&
                            data?.Leads.leadType == "APPLICATION" &&
                            !data?.Leads?.applicationOnHold
                              ? true
                              : false
                          }
                          showClaimOnHold={
                            data?.leadId &&
                            data?.Leads.leadType == "CLAIM" &&
                            !data?.Leads?.claimOnHold
                              ? true
                              : false
                          }
                          onClick={handleAddNote}
                          showRejectApplication={showRejectApplication}
                          onClickRejectApplication={handleRejectApplication}
                          showIssuePolicy={
                            data?.paymentMethod?.length !== 0 &&
                            data.status === ApplicationStatusValues.pending &&
                            !data?.isArchived
                          }
                          onClickIssuePolicy={handleIssuePolicy}
                          showIsArchive={showIsArchive}
                          onClickIsArchived={handleIsArchived}
                          onClickAlterApplication={handleAlterApplication}
                          alterApplication={
                            data?.status == ApplicationStatusValues.pending
                          }
                          onClickApplicationOnHold={handleApllicationOnHold}
                          onClickClaimOnHold={handleClaimOnHold}
                        />
                      )}
                  </div>
                  <div className="mt-6">
                    {applicationDataNew ? (
                      <DescriptionList data={applicationDataNew} />
                    ) : (
                      ""
                    )}
                    <div className="mt-4 grid w-full grid-cols-2 items-center justify-between justify-items-center gap-x-[45px] gap-y-4">
                      <div className="grid w-full grid-cols-2">
                        <div className="text-sm font-semibold leading-6 text-gray-900">
                          Policyholder :
                        </div>
                        <div className=" text-sm leading-6 text-blue-500 underline">
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
                      {data?.Leads?.leadNumber && (
                        <>
                          <div className="grid w-full grid-cols-2">
                            <div className="text-sm font-semibold leading-6 text-gray-900">
                              Prospect Number :
                            </div>
                            <div className=" text-sm leading-6 text-primary-blue underline ">
                              <span
                                className="hover:cursor-pointer"
                                onClick={() => {
                                  router.push(`/lead/${data?.leadId}/show`);
                                }}
                              >
                                {data?.Leads?.leadNumber}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                      {data.packageName === packageNames.funeral && (
                        <div className="grid w-full grid-cols-2">
                          <div className="text-sm font-semibold leading-6 text-gray-900">
                            Options :
                          </div>
                          <div className=" text-sm leading-6 text-dark-grey">
                            {policyHolder?.options
                              ? removeUnderScores(policyHolder?.options)
                              : ""}
                          </div>
                        </div>
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
                                  router.push(
                                    `/policy/${data?.policy?.id}/show`
                                  );
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
                  <PolicyDataComponent policyData={data?.applicationData} />

                  {updateData ? <DescriptionList data={updateData} /> : ""}
                </div>

                <ShowDropdown
                  id={"paymentMethod"}
                  title={"Payment Method"}
                  status={data?.status}
                  checkStatus={ApplicationStatusValues.pending}
                  canUpdate={
                    currentRoleAccessLevels?.Application?.canUpdate &&
                    !data?.isArchived
                  }
                  handleEdit={onClickPaymentEdit}
                  handleToggle={() =>
                    setShowDetails({
                      ...showDetails,
                      paymentMethods: !showDetails.paymentMethods,
                    })
                  }
                  toggleValue={showDetails.paymentMethods}
                  dropDownArray={paymentMethod}
                  mainObject={paymentMethod[paymentMethod.length - 1]}
                />
                {applicationData?.policyholder && (
                  <>
                    <ShowDropdown
                      id={"policyholder"}
                      title={"Policyholder"}
                      status={data?.status}
                      checkStatus={ApplicationStatusValues.pending}
                      canUpdate={
                        currentRoleAccessLevels?.Application?.canUpdate &&
                        !data?.isArchived
                      }
                      handleEdit={() => {
                        setEditOpen(true);
                      }}
                      handleToggle={() =>
                        setShowDetails({
                          ...showDetails,
                          policyHolder: !showDetails.policyHolder,
                        })
                      }
                      toggleValue={showDetails.policyHolder}
                      mainObject={applicationData?.policyholder}
                    />
                  </>
                )}
                {data.packageName !== packageNames.device &&
                  data.packageName !== packageNames.retailDeviceInsurance && (
                    <ShowDropdown
                      id={"beneficiaries"}
                      title={"Beneficiary Details"}
                      status={applicationData?.status}
                      checkStatus={ApplicationStatusValues.pending}
                      canUpdate={
                        currentRoleAccessLevels?.Application?.canUpdate &&
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
                      dropDownArray={applicationData?.beneficiaries}
                      mainArray={beneficiariesData}
                    />
                  )}
                <ShowDropdown
                  id={"documents"}
                  title={"Documents"}
                  status={applicationData?.status}
                  checkStatus={ApplicationStatusValues.pending}
                  canUpdate={
                    currentRoleAccessLevels?.Application?.canUpdate &&
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

            {editApplication && (
              <Modal
                title="Update Application Details"
                onCloseClick={() => {
                  handleDataRefetch();
                  setEditApplication(false);
                  setCount(1);
                  setDevice({ ...deviceType, selected: "" });
                  setbrand({ ...brand, selected: "" });
                  setModelName({ ...modelName, selected: "" });
                  setColor({ ...color, selected: "" });
                }}
                border
              >
                <form
                  onSubmit={applicationEditSave}
                  className="max-h-[75vh] overflow-auto scrollbar-none"
                >
                  <div id="appData">
                    <FormComponent
                      inputs={applicationInputs}
                      formValues={applicationData}
                      handleChange={handleEditApplicationDataChange}
                      formErrors={beneficiaryErrors}
                      tailwindClass="grid grid-cols-2 gap-4"
                    />
                  </div>
                  {data?.packageName === packageNames.creditLifeMotor && (
                    <div id="creditLifeMotor">
                      <>
                        <FormComponent
                          // index={}
                          inputs={creditLifeInputs}
                          formValues={
                            applicationData?.applicationData?.creditLife
                          }
                          handleChange={handleCreditLifeChange}
                          tailwindClass="grid grid-cols-2 gap-x-4"
                        />
                      </>
                    </div>
                  )}
                  {data?.packageName === packageNames.device && (
                    <div id="device">
                      <>
                        <FormComponent
                          inputs={deviceInputs}
                          formValues={
                            applicationData?.applicationData?.deviceData
                          }
                          handleChange={handleDeviceDataChange}
                          formErrors={deviceFormErrors}
                          tailwindClass="grid grid-cols-2 gap-x-4"
                        />
                      </>
                    </div>
                  )}
                  {data?.packageName === packageNames.creditLifeDevice && (
                    <div id="creditLifeDevice">
                      <>
                        <FormComponent
                          inputs={creditLifeDeviceInputs}
                          formValues={
                            applicationData?.applicationData?.deviceCreditLife
                          }
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
                        formValues={
                          applicationData?.applicationData?.deviceData
                        }
                        handleChange={handleDeviceDataChange}
                        formErrors={deviceFormErrors}
                        tailwindClass="grid grid-cols-2 gap-x-4"
                      />
                    </>
                  )}

                  {data?.packageName ===
                    packageNames.retailDeviceCreditLife && (
                    <div id="retailDeviceCreditLife">
                      <>
                        <FormComponent
                          inputs={creditLifeDeviceInputs}
                          formValues={
                            applicationData?.applicationData?.deviceCreditLife
                          }
                          handleChange={handleDeviceCreditLife}
                          tailwindClass="grid grid-cols-2 gap-x-4"
                        />
                      </>
                    </div>
                  )}
                  <>
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
                            {applicationData?.applicationData?.members?.spouse?.map(
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
                            )}{" "}
                            {applicationData?.applicationData?.members?.spouse
                              ?.length < 4 && (
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
                            {applicationData?.applicationData?.members?.children?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    className="mb-5 rounded border border-l-8 border-blue-200 p-5"
                                    key={index}
                                  >
                                    {" "}
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
                                        formErrors={formErrors.children[index]}
                                        handleChange={handleEditChildrenChange}
                                        index={index}
                                        tailwindClass="grid grid-cols-2 gap-4"
                                      />
                                    ) : (
                                      <FormComponent
                                        inputs={childrenEdit}
                                        formValues={item}
                                        formErrors={formErrors.children[index]}
                                        handleChange={handleEditChildrenChange}
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
                            {applicationData?.applicationData?.members?.extendedFamily?.map(
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
                                      formErrors={
                                        formErrors.extendedFamily[index]
                                      }
                                      handleChange={handleEditExtendedFamily}
                                      tailwindClass="grid grid-cols-2 gap-4"
                                      index={index}
                                    />
                                  </div>
                                );
                              }
                            )}{" "}
                            {applicationData?.applicationData?.members
                              ?.extendedFamily?.length < 14 && (
                              <AddButton
                                name="Add Family Member"
                                handleClick={() => addNewExtendedMember()}
                              />
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>

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
                        setDeviceFormErrors({
                          ...deviceFormErrors,
                          ["devicePrice"]: "",
                        });
                        handleDataRefetch();
                        setEditApplication(false);
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
                  handleDataRefetch();
                  setPaymentEdit(false);
                }}
                border
              >
                <div>
                  <form
                    className="max-h-[75vh] overflow-auto scrollbar-none"
                    onSubmit={onPaymentUpdate}
                  >
                    {!exludePackages.includes(data?.packageName) && (
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

            {editOpen && (
              <Modal
                title={"Update policyholder"}
                onCloseClick={() => {
                  handleDataRefetch();
                  setEditOpen(false);
                }}
                // onSaveClick={onEditSave}
                // showButtons
                border
                buttonDisabled={policyDisable}
              >
                <form onSubmit={onEditSave}>
                  {editFormData.identification?.length > 0 && (
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {" "}
                        Identification
                      </div>
                      {editFormData.identification?.map((data) => {
                        return (
                          <FormComponent
                            inputs={editApplicationIdentification}
                            formValues={data}
                            handleChange={handleIdentificationChange}
                            formErrors={errorData}
                            tailwindClass="grid grid-cols-2 gap-4"
                          />
                        );
                      })}
                    </div>
                  )}

                  <div className="text-lg font-bold text-gray-900">Details</div>
                  <FormComponent
                    inputs={editApplicationDetails}
                    formValues={editFormData}
                    handleChange={handleFormInputChange}
                    formErrors={errorData}
                    tailwindClass="grid grid-cols-2 gap-4"
                  />
                  <div className="text-lg font-bold text-gray-900">
                    Contact details
                  </div>
                  <FormComponent
                    inputs={editApplicationContactDetails}
                    formValues={editFormData}
                    handleChange={handleFormInputChange}
                    handlePhoneChange={handlePhoneChange}
                    formErrors={errorData}
                    tailwindClass="grid grid-cols-2 gap-4"
                  />
                  <div className="text-lg font-bold text-gray-900">
                    {" "}
                    Address
                  </div>
                  <FormComponent
                    inputs={editApplicationAddress}
                    formValues={editFormData}
                    handleChange={handleFormInputChange}
                    formErrors={errorData}
                    tailwindClass="grid grid-cols-2 gap-4"
                  />
                  <div className="flex w-full justify-end">
                    <Button text="Save" className="mr-3" type="submit" />
                    <SecondaryButton
                      text="Cancel"
                      onClick={() => {
                        setEditOpen(false);
                        handleDataRefetch();
                      }}
                    />
                  </div>
                </form>
              </Modal>
            )}

            {beneficiaryEdit && (
              <Modal
                title="Update Beneficiary Details"
                onCloseClick={() => {
                  handleDataRefetch();
                  setBeneficiaryEdit(false);
                }}
                border
              >
                <form
                  onSubmit={onBeneficiaryEditSave}
                  className="max-h-[75vh] overflow-auto scrollbar-none"
                >
                  {beneficiaries?.map(
                    (item: IEditBeneficiary, index: number) => {
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
                            tailwindClass="grid grid-cols-2 gap-4"
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
                            tailwindClass="grid grid-cols-2 gap-4"
                          />
                        </div>
                      );
                    }
                  )}
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

            <ShowNotesAndActivity
              notes={notes}
              activity={activityData}
              showActivitySection={showActivitySection}
            />

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
                  handleDataRefetch();
                  closeModal();
                }}
                onSaveClick={() => handleSubmit()}
                showButtons
                border
                buttonDisabled={buttonDisable}
              >
                <div>
                  <div className="mt-10 flex justify-center align-middle">
                    <div className="flex">
                      <UploadFile
                        title={"You can upload your photo to import here"}
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
                            onCloseClick={() => {
                              handleDataRefetch();
                              modalClose();
                            }}
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
            {issuePolicyModal && (
              <Modal
                onCloseClick={() => {
                  handleDataRefetch();
                  setIssuePolicyModel(!issuePolicyModal);
                }}
                showButtons={true}
                okButtonTitle="Confirm"
                onSaveClick={issuePolicy}
                title={"Issue policy"}
              >
                <div>
                  <p>Click on confirm to issue policy</p>
                </div>
              </Modal>
            )}
            {rejectApplicationModal && (
              <Modal
                onCloseClick={() => {
                  handleDataRefetch();
                  setRejectApplicationModal(!rejectApplicationModal);
                }}
                title={"Reject Application"}
              >
                <div>
                  <p>Click Confirm to reject this application</p>
                  <form onSubmit={rejectApplication}>
                    <div>
                      <FormComponent
                        inputs={notesInput}
                        formValues={applicationNotes}
                        handleChange={handleApplicationNotes}
                      />
                    </div>
                    <div className="mt-5 flex w-full justify-end">
                      <Button type={"submit"} text="Confirm" className="mr-3" />
                      <Button
                        text="Cancel"
                        onClick={() => {
                          setRejectApplicationModal(!rejectApplicationModal);
                          setApplicationNote({
                            ...applicationNotes,
                            title: "",
                            description: "",
                          });
                        }}
                      />
                    </div>
                  </form>
                </div>
              </Modal>
            )}
            {isArchivedModal && (
              <Modal
                onCloseClick={() => {
                  handleDataRefetch();
                  setIsArchivedModal(!isArchivedModal);
                }}
                showButtons={true}
                okButtonTitle="Confirm"
                onSaveClick={archiveApplication}
                title={"Archive"}
              >
                <div>
                  <p>Click on confirm to Archive</p>
                </div>
              </Modal>
            )}
          </div>
        )
      )}
    </>
  ) : (
    <>
      {loading || isLoading || noteLoading || activityLoading ? (
        <Loader />
      ) : (
        <>
          <ErrorComponent />
        </>
      )}
    </>
  );
};

export default DefaultLayout(ApplicationView);
