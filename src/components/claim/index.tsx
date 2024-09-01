import React, { useEffect, useMemo, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Loader from "~/common/loader";
import ShowNotesAndActivity from "~/common/showNotesAndActivity";
import AddNoteModal from "../addNoteModal";
import TabsBar from "~/common/tabs";
import {
  AccessLevelsDefinition,
  claimTabs,
  packageName,
  packageNames,
} from "~/utils/constants";
import { ToastContainer, toast } from "react-toastify";
import { BsArrowRightSquareFill } from "react-icons/bs";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import {
  claimApprovalStatusValues,
  claimStatusValues,
  deceasedInputs,
  doctorsInput,
  editClaimant,
  getIncidentInputs,
} from "~/utils/constants/claims";
import { IShowDetails, IUploadFile } from "~/interfaces/common";
import { IEvent } from "~/interfaces/common/form";
import { IBeneficiary, IMember } from "~/interfaces/policy";
import Button from "~/common/buttons/filledButton";
import AddButton from "~/common/buttons/addButton";
import { AiOutlineDelete } from "react-icons/ai";
import { IEditBeneficiary } from "../application";
import {
  calculateDaysBetweenDates,
  dateConversion,
  getMultipleAccessRoles,
} from "~/utils/helpers";
import {
  editApplicationIdentification,
  notesInput,
} from "~/utils/constants/policy";
import { editBeneficiaryDetails } from "~/utils/constants/policy";
import UploadFile from "~/common/uploadFile";
import ImagePreview from "~/common/imagePreview";
import InfoTable from "~/common/infoTable";
import { ExclamationTriangleIcon, PowerIcon } from "@heroicons/react/20/solid";
import { useSession } from "next-auth/react";
import {
  ClaimApprovalStatus,
  ClaimCheckList,
  ClaimStatus,
  UserRole,
} from "@prisma/client";
import { roleValues } from "~/utils/constants/user";
import NoAccessComponent from "~/common/noAccess";
import ErrorComponent from "~/common/errorPage";
import Image from "next/image";
import MemberCard from "~/common/showDetails/memberCard";
import UploadButton from "~/common/buttons/uploadButton";
import ShowDropdown from "~/common/showDropDown";
import {
  dateSAIDvalidation,
  validateEmail,
  validateFrom,
  validatePhoneNum,
  validateSAIDNum,
} from "~/utils/helpers/validations";
import { isValidPhoneNumber } from "libphonenumber-js";
import InputField from "~/common/form/input";
import { number } from "zod";
import PolicyDataComponent from "~/common/policyData";
import DeviceClaimBlock from "./deviceClaimBlock";
import FuneralClaimBlock from "./funeralClaimBlock";
import FuneralPolicy from "../policy/funeralPolicy";
import CreditLifeMotorClaimBlock from "./CreditLifeClaimBlock";
import CreditLifeDeviceClaimBlock from "./creditLifeDeviceClaimBlock";
import Status from "~/common/status";
import ArchivedComponent from "~/common/archivedText";
import RetailDeviceClaimBlock from "./retailDeviceCliamBlock";
import RetailCreditLifeDeviceClaimBlock from "./retailDeviceClaimCreditLife";
import SecondaryButton from "~/common/buttons/secondaryButton";

function ClaimView(props: any) {
  const router = useRouter();
  const session = useSession();
  const claimId = router.query.id;
  const [activeTab, setActiveTab] = useState("claimDetails");
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState({} as any);
  const [policyData, setPolicyData] = useState({} as any);
  const [policy, setPolicy] = useState({} as any);
  const [memberDetails, setMemberDetails] = useState<any[]>([]);
  const [deceasedMemberDetails, setDeceasedMemberDetails] = useState({} as any);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<any>();
  const [incidentInputs, setIncidentInputs] = useState<any>({});
  const currentRole = session.data?.user.roles as UserRole[];
  const [disabled, setDisabled] = useState({
    email: false,
    phone: false,
  });

  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const {
    isLoading,
    data,
    error,
    refetch: refetchShow = () => {},
    isFetching,
  } = currentRoleAccessLevels?.Claim?.canView
    ? api.claim.show.useQuery(claimId as string)
    : {
        isLoading: false,
        data: null,
        error: null,
        refetch: null as any,
        isFetching: false,
      };

  const [notes, setNotes]: any = useState([]);
  const [showActivitySection, setShowActivitySection] = useState(true);
  const [isArchivedModalInClaim, setIsArchivedModalInClaim] = useState(false);
  const [isSendToReviewModal, setIsSendToReviewModal] = useState(false);
  const [beneficiaryEdit, setBeneficiaryEdit] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any>([]);
  const [beneficiaryErrors, setBeneficiaryErrors] = useState<Array<any>>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editClaimantData, setEditClaimantData] = useState({} as any);
  const [claimantErrors, setClaimantErrors] = useState({} as any);
  const [showApproveModel, setShowApproveModel] = useState(false);
  const [showRepudiateModel, setShowRepudiateModel] = useState(false);
  const [showPayoutBlockedModel, setShowPayoutBlockedModel] = useState(false);
  const [deceasedValues, setDeceasedValues] = useState({} as any);
  const [incidentValues, setIncidentValues] = useState({} as any);
  const [doctorsValues, setDoctorsValues] = useState({} as any);
  const [doctorsErrors, setDoctorsErrors] = useState({} as any);
  const [isDecModalOpen, setIsDecModalOpen] = useState(false);
  const [isIncModalOpen, setIsIncModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [grantedAmount, setGrantedAmount] = useState({
    grantedAmount: data?.requestedAmount ?? 0,
  });
  const [isClaim, setIsClaim] = useState({} as any);
  const [showCloseClaimModel, setShowCloseClaimModel] = useState(false);
  const [totalClaimDescription, setTotalClaimDescription] = useState({} as any);
  const [isIDExist, setIsIDExist] = useState(Number);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutProcessed, setPayoutProcessed] = useState(false);
  const [fileUpload, setFileUpload] = useState<any>([]);
  const [fileStore, setFileStore] = useState<any>([]);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [saveButtonDisable, setSaveButtonDisable] = useState(false);
  // const [showArchive, setShowArchive] = useState(true);
  const [files, setFiles] = useState([{ name: "", type: "", fileUrl: "" }]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [months, setMonths] = useState(0);
  const [objects, setObjects] = useState<{ [key: string]: any }>({});
  const [arrays, setArrays] = useState<{ [key: string]: any[] }>({});
  const [policyDataNew, setPolicyDataNew] = useState<{ [key: string]: any }>(
    {}
  );
  const [remaining, setRemaining] = useState<{ [key: string]: any }>({});
  const [beneficiariesData, setBeneficiariesData] = useState<any[]>([]);
  const [toggleBenficiaries, setToggleBenficiaries] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<{ [key: string]: any }>({});
  const [policyNumber, setPolicyNumber] = useState<string>("");
  const [checklist, setChecklist] = useState<ClaimCheckList[]>([]);
  const [showDetails, setShowDetails] = useState<IShowDetails>({
    spouse: false,
    children: false,
    extendedFamily: false,
    beneficiaries: false,
    claimant: false,
    deceasedDetails: false,
    incidentDetails: false,
    doctorDetails: false,
    checkList: false,
    documents: false,
    deviceIncidentDetails: false,
    deviceLostDetails: false,
    creditLifeDeviceIncidentDetails: false,
    creditLifeMotorDetails: false,
  });
  const [checkListLoading, setCheckListLoading] = useState(false);
  const [fileDisable, setFileDisable] = useState<Boolean>(false);
  const [rejectClaim, setRejectClaim] = useState(false);
  const [claimNotes, setClaimNotes] = useState({
    title: "",
    description: "",
  });
  const [hiddenTabs, setHiddenTabs] = useState([] as string[]);

  const updatePolicyStatus = api.policy.status.useMutation();
  const updatePolicy = api.policy.update.useMutation();
  const updateBeneficiary = api.policy.updateBeneficiary.useMutation();
  const updateClaim = api.claim.update.useMutation();
  const deleteBeneficiary = api.beneficiaries.delete.useMutation();
  const archivedClaim = api.claim.archived.useMutation();
  const updateClaimStatus = api.claim.status.useMutation();
  const createFile = api.uploadLibrary.create.useMutation();
  const updateCheckList = api.claim.updateChecklist.useMutation();

  useMemo(() => {
    if (data) {
      setClaimData(data);
      setEditClaimantData(data.claimant);
      setBeneficiaries(
        data?.policies?.beneficiaries.map((beneficiary: any) => {
          return {
            ...beneficiary,
            dateOfBirth: dateConversion(beneficiary.dateOfBirth),
          };
        })
      );
      setChecklist(data.claimCheckList);
      switch (data?.packageName) {
        case packageNames.funeral:
          const lastIndex = data?.funeralClaimBlock?.length - 1;
          if (lastIndex >= 0 && data?.packageName === packageNames.funeral) {
            const lastItem = data?.funeralClaimBlock[lastIndex];

            if (lastItem) {
              // Extracting deceased values
              const deceasedData = {
                deceasedMemberId: lastItem?.deceasedMemberId,
                firstName: lastItem?.firstName,
                lastName: lastItem?.lastName,
                deceasedIndividual: lastItem?.deceasedIndividual,
                said: lastItem?.said,
                deceasedIndividualCreatedAt: lastItem?.createdAt,
              };
              setDeceasedValues(deceasedData);

              // Extracting incident values
              const incidentData = {
                claimCreatedDate:
                  lastItem.claimCreatedDate &&
                  dateConversion(lastItem.claimCreatedDate),
                dateOfDeath:
                  lastItem.dateOfDeath && dateConversion(lastItem.dateOfDeath),
                funeralClaimType: lastItem.funeralClaimType,
                cause: lastItem.cause,
                policeCaseNumber: lastItem.policeCaseNumber,
                reportingPoliceStation: lastItem.reportingPoliceStation,
                referenceNumber: lastItem.referenceNumber,
                incidentDescription: lastItem.incidentDescription,
              };
              setIncidentValues(incidentData);

              // Extracting doctor values
              const doctorData = {
                doctorName: lastItem.doctorName,
                doctorContactNumber: lastItem.doctorContactNumber,
                doctoreAddress: lastItem.doctoreAddress,
              };
              setDoctorsValues(doctorData);
            }
          }
          if (
            data &&
            data.funeralClaimBlock &&
            data.funeralClaimBlock.length > 0
          ) {
            const lastIndex = data.funeralClaimBlock.length - 1;
            const lastItem = data.funeralClaimBlock[lastIndex];

            if (lastItem && lastItem.id) {
              setIsIDExist(lastItem?.id);
            }
          }
          break;
        case packageNames.creditLifeMotor:
          const creditLifeIndex = data?.creditLifeClaimBlock.length - 1;

          if (
            creditLifeIndex >= 0 &&
            data?.packageName === packageNames.creditLifeMotor
          ) {
            const lastItem = data?.creditLifeClaimBlock[creditLifeIndex];
            const incidentData = {
              claimCreatedDate:
                lastItem?.claimCreatedDate &&
                dateConversion(lastItem.claimCreatedDate),
              placeOfDeath: lastItem?.placeOfDeath,
              dateOfDeath:
                lastItem?.dateOfDeath && dateConversion(lastItem?.dateOfDeath),
              creditLifeClaimType: lastItem?.creditLifeClaimType,
              cause: lastItem?.cause,
              policeCaseNumber: lastItem?.policeCaseNumber,
              reportingPoliceStation: lastItem?.reportingPoliceStation,
              referenceNumber: lastItem?.referenceNumber,
              incidentDescription: lastItem?.incidentDescription,
            };
            setIncidentValues(incidentData);
          }
          if (
            data &&
            data.creditLifeClaimBlock &&
            data.creditLifeClaimBlock.length > 0
          ) {
            const lastIndex = data?.creditLifeClaimBlock.length - 1;
            const lastItem = data.creditLifeClaimBlock[lastIndex];

            if (lastItem && lastItem.id) {
              setIsIDExist(lastItem?.id);
            }
          }
          break;
      }
      if (
        deceasedValues.deceasedIndividual === "OTHER" &&
        incidentValues.dateOfDeath !== ""
      ) {
        let dateOfDeath = dateConversion(incidentValues?.dateOfDeath);
        let dateOfCreation = dateConversion(
          deceasedValues?.deceasedIndividualCreatedAt
        );
        const diffBetweenDates = calculateDaysBetweenDates(
          dateOfCreation,
          dateOfDeath
        );
        setMonths(diffBetweenDates);
      }
      const { funeralClaimBlock, ...rest } = data;
      setIsClaim(rest);
    }
    return null;
  }, [data]);

  const handleRefetchShow = () => {
    refetchShow();
    refetchActivity();
  };

  const checkProperty = () => {
    setLoading(true);
    if (claimData?.createdBy && claimData?.createdBy !== null) {
      claimData.createdBy =
        data?.createdBy?.firstName + "" + data?.createdBy?.lastName;
    }
    if (claimData?.updatedBy && claimData?.updatedBy !== null) {
      claimData.updatedBy =
        data?.updatedBy?.firstName + "" + data?.updatedBy?.lastName;
    }
  };

  const onEditSave = async () => {
    const errors = validateFrom(editClaimantData, editClaimant);
    const isFormValid = Object.values(errors).some(Boolean);
    if (isFormValid) {
      setClaimantErrors(errors);
      return;
    }
    setLoading(true);
    setEditOpen(false);
    const { phone, ...claimantInfo } = editClaimantData;
    try {
      const req = {
        packageName: claimData.packageName,
        policyId: claimData.policyId,
        claimStatus: claimData.claimStatus,
        requestedAmount: claimData.requestedAmount,
        claimant: claimantInfo,
      };
      if (phone) {
        req.claimant.phone = phone.replace(/[\s-]/g, "") ?? "";
      }
      const updatedClaimant = await updateClaim.mutateAsync({
        id: claimData.id,
        body: req,
      });
      if (updatedClaimant) {
        setEditClaimantData(updatedClaimant.claimant);
        setClaimData({ ...claimData, claimant: updatedClaimant.claimant });
        setLoading(false);
        toast.success("Claimant details updated successfully");
      } else {
        setLoading(false);
        toast.error("Claimant details update is unsuccessful");
      }
    } catch (error: any) {
      toast.error("API failed");
    } finally {
      setLoading(false);
      handleRefetchShow();
    }
  };
  const beneficiaryEditSave = async () => {
    setLoading(true);
    const req: any = {
      beneficiaries: beneficiaries.map((beneficiary: any) => {
        return {
          ...beneficiary,
          ...(beneficiary?.percentage && {
            percentage: parseInt(beneficiary?.percentage),
          }),
          ...(beneficiary?.dateOfBirth && {
            dateOfBirth: new Date(beneficiary?.dateOfBirth),
          }),
          phone: beneficiary?.phone.replace(/[\s-]/g, "") ?? "",
        };
      }),
    };
    try {
      const applicationRes = await updateBeneficiary.mutateAsync({
        id: claimData?.policyId ?? ("" as string),
        body: req,
      });
      if (applicationRes) {
        setBeneficiaryEdit(false);
        setBeneficiaries(
          applicationRes.beneficiaries?.map((beneficiary: any) => {
            return {
              ...beneficiary,
              ...(beneficiary.dateOfBirth && {
                dateOfBirth: dateConversion(beneficiary.dateOfBirth),
              }),
            };
          })
        );
        setClaimData({
          ...claimData,
          beneficiaries: applicationRes.beneficiaries,
        });
        setLoading(false);
        toast.success("Beneficiary updated successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update");
      }
    } catch (error: any) {
      toast.error("Beneficiary updated failed");
    } finally {
      setLoading(false);
      handleRefetchShow();
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
      handleDataRefetch();
      setBeneficiaryEdit(false);
      handleRefetchShow();
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
        toast.error("Unable to delete beneficiary");
      } finally {
        setLoading(false);
        handleRefetchShow();
      }
    }
    const beneficiaryDetails = [...beneficiaries];
    beneficiaryDetails.splice(index, 1);
    setBeneficiaries([...beneficiaryDetails]);
    const beneficiariesErrors = [...beneficiaryErrors];
    beneficiariesErrors.splice(index, 1);
    setBeneficiaryErrors([...beneficiariesErrors]);
  };

  const addNewMember = () => {
    setBeneficiaries([...beneficiaries, { identification: {} }]);
    setBeneficiaryErrors([...beneficiaryErrors, { identification: {} }]);
  };

  const handleApproveClaim = () => {
    setGrantedAmount({ grantedAmount: Number(data?.requestedAmount) });
    setShowApproveModel(!showApproveModel);
  };

  const handleRepudiate = () => {
    setShowRepudiateModel(!showRepudiateModel);
  };

  const handlePayoutBlocked = () => {
    setShowPayoutBlockedModel(!showPayoutBlockedModel);
  };

  const hadleApproveOnChange = (e: IEvent, index: number = 0) => {
    const { value, name } = e.target;
    if (data?.requestedAmount && value > data?.requestedAmount) {
      setClaimantErrors({
        ...claimantErrors,
        [name]: "Enter less than sum assured",
      });
      setSaveButtonDisable(true);
    } else {
      setClaimantErrors({
        ...claimantErrors,
        [name]: "",
      });
      setSaveButtonDisable(false);
    }
    setGrantedAmount({ grantedAmount: value });
  };
  const approveClaim = async (e: any) => {
    e.preventDefault();
    setShowApproveModel(!showApproveModel);
    setLoading(true);
    try {
      const approvedClaim = await updateClaimStatus.mutateAsync({
        id: data?.id as string,
        status: claimStatusValues.finalized as ClaimStatus,
        grantedAmount: Number(grantedAmount?.grantedAmount),
        approvalStatus:
          claimApprovalStatusValues.approved as ClaimApprovalStatus,
      });
      if (approvedClaim) {
        setLoading(false);
        toast.success("Successfully approved the claim");
        // router.push("/claim/list");
      } else {
        setLoading(false);
        toast.error("Please try again later");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to approve the claim, please try again later");
    } finally {
      handleDataRefetch();
      setLoading(false);
    }
  };

  const repudiateClaim = async () => {
    setShowRepudiateModel(!showRepudiateModel);
    setLoading(true);
    try {
      const repudiateClaims = await updateClaimStatus.mutateAsync({
        id: data?.id as string,
        status: claimStatusValues.reject as ClaimStatus,
        approvalStatus:
          claimApprovalStatusValues.repudated as ClaimApprovalStatus,
      });

      if (repudiateClaims) {
        setLoading(false);
        toast.success("Claim repudiated successfully");
        // router.push("/claim/list");
      } else {
        setLoading(false);
        toast.error("Please try again later");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to repudiate claim, please try again later");
    } finally {
      handleDataRefetch();
      setLoading(false);
    }
  };

  const payoutBlockedClaim = async () => {
    setShowPayoutBlockedModel(!showPayoutBlockedModel);
    setLoading(true);
    try {
      const payoutBlockedClaims = await updateClaimStatus.mutateAsync({
        id: data?.id as string,
        status: claimStatusValues.finalized as ClaimStatus,
        approvalStatus:
          claimApprovalStatusValues.payoutBlocked as ClaimApprovalStatus,
      });

      if (payoutBlockedClaims) {
        setLoading(false);
        toast.success("Payout blocked successfully");
        // router.push("/claim/list");
      } else {
        setLoading(false);
        toast.error("Please try again later");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to update please try again later");
    } finally {
      handleDataRefetch();
      setLoading(false);
    }
  };

  const handleEditClaimant = (e: IEvent): void => {
    const { name, value } = e.target;
    if (name === "email") {
      const isValid = validateEmail(value);
      if (!isValid) {
        setDisabled({
          ...disabled,
          email: true,
        });
        setClaimantErrors({
          ...claimantErrors,
          [name]: "",
        });
      } else {
        setDisabled({
          ...disabled,
          email: false,
        });
        setClaimantErrors({
          ...claimantErrors,
          [name]: "",
        });
      }
    }
    setEditClaimantData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
    // setClaimantErrors((prevFormErrors: any) => ({
    //   ...prevFormErrors,
    //   [name]: false,
    // }));
  };
  const handleClosedClaim = () => {
    setShowCloseClaimModel(true);
  };
  const handleShowCloseClaim = () => {
    return (
      currentRoleAccessLevels?.Claim.canUpdate &&
      ((data?.claimStatus === claimStatusValues.finalized &&
        data?.approvalStatus == claimApprovalStatusValues.payoutProcessed) ||
        (data?.claimStatus === claimStatusValues.finalized &&
          data?.approvalStatus == claimApprovalStatusValues.payoutBlocked)) &&
      (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
        currentRole.includes(roleValues?.superAdmin as UserRole) ||
        currentRole.includes(roleValues?.developer as UserRole)) &&
      data?.claimStatus !== claimStatusValues.close
    );
  };

  const handleShowSendToReview = () => {
    return (
      data?.approvalStatus == claimApprovalStatusValues.pending &&
      data?.claimStatus == claimStatusValues.open &&
      currentRoleAccessLevels?.Claim.canUpdate
    );
  };

  const checkShowSendToReview = () => {
    switch (data?.packageName) {
      case packageNames.funeral:
        return (
          deceasedValues?.deceasedMemberId &&
          deceasedValues?.deceasedIndividual &&
          incidentValues?.funeralClaimType &&
          incidentValues?.dateOfDeath &&
          data?.approvalStatus == claimApprovalStatusValues.pending &&
          data?.claimStatus == claimStatusValues.open &&
          currentRoleAccessLevels?.Claim.canUpdate &&
          (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
            currentRole.includes(roleValues?.superAdmin as UserRole) ||
            currentRole.includes(roleValues?.developer as UserRole))
        );
        break;
      case packageNames.creditLifeMotor:
        return (
          incidentValues?.creditLifeClaimType &&
          incidentValues?.dateOfDeath &&
          data?.approvalStatus == claimApprovalStatusValues.pending &&
          data?.claimStatus == claimStatusValues.open &&
          currentRoleAccessLevels?.Claim.canUpdate &&
          (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
            currentRole.includes(roleValues?.superAdmin as UserRole) ||
            currentRole.includes(roleValues?.developer as UserRole))
        );
        break;
      case packageNames.device:
        return (
          data?.deviceClaimBlock[data?.deviceClaimBlock.length - 1]
            ?.claimType &&
          data?.deviceClaimBlock[data?.deviceClaimBlock.length - 1]
            ?.incidentDate &&
          data?.approvalStatus == claimApprovalStatusValues.pending &&
          data?.claimStatus == claimStatusValues.open &&
          currentRoleAccessLevels?.Claim.canUpdate &&
          (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
            currentRole.includes(roleValues?.superAdmin as UserRole) ||
            currentRole.includes(roleValues?.developer as UserRole))
        );
        break;
      case packageNames.creditLifeDevice:
        return (
          incidentValues?.creditLifeClaimType &&
          incidentValues?.dateOfDeath &&
          data?.approvalStatus == claimApprovalStatusValues.pending &&
          data?.claimStatus == claimStatusValues.open &&
          currentRoleAccessLevels?.Claim.canUpdate &&
          (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
            currentRole.includes(roleValues?.superAdmin as UserRole) ||
            currentRole.includes(roleValues?.developer as UserRole))
        );
        break;
      case packageNames.retailDeviceInsurance:
        return (
          data?.retailDeviceClaim[data?.retailDeviceClaim.length - 1]
            ?.claimType &&
          data?.retailDeviceClaim[data?.retailDeviceClaim.length - 1]
            ?.incidentDate &&
          data?.approvalStatus == claimApprovalStatusValues.pending &&
          data?.claimStatus == claimStatusValues.open &&
          currentRoleAccessLevels?.Claim.canUpdate &&
          (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
            currentRole.includes(roleValues?.superAdmin as UserRole) ||
            currentRole.includes(roleValues?.developer as UserRole))
        );
        break;
      case packageNames.retailDeviceCreditLife:
        return (
          incidentValues?.creditLifeClaimType &&
          incidentValues?.dateOfDeath &&
          data?.approvalStatus == claimApprovalStatusValues.pending &&
          data?.claimStatus == claimStatusValues.open &&
          currentRoleAccessLevels?.Claim.canUpdate &&
          (currentRole.includes(roleValues?.claimAssesor as UserRole) ||
            currentRole.includes(roleValues?.superAdmin as UserRole) ||
            currentRole.includes(roleValues?.developer as UserRole))
        );
        break;
      default:
        return false;
    }
  };

  const handleShowApproveClaim = () => {
    return (
      currentRoleAccessLevels?.Claim.canUpdate &&
      data?.approvalStatus == claimApprovalStatusValues.pending &&
      data?.claimStatus == claimStatusValues.acknowledged &&
      (currentRole.includes(roleValues?.claimSupervisor as UserRole) ||
        currentRole.includes(roleValues?.superAdmin as UserRole) ||
        currentRole.includes(roleValues?.developer as UserRole))
    );
  };
  const handleShowPayoutProcessed = () => {
    return (
      currentRoleAccessLevels?.Claim.canUpdate &&
      data?.approvalStatus == claimApprovalStatusValues.approved &&
      data?.claimStatus == claimStatusValues.finalized &&
      (currentRole.includes(roleValues?.claimSupervisor as UserRole) ||
        currentRole.includes(roleValues?.superAdmin as UserRole) ||
        currentRole.includes(roleValues?.developer as UserRole))
    );
  };
  const handlePayoutProcessed = () => {
    setPayoutProcessed(true);
    handleModalOpen();
  };
  const cancelPolicy = async () => {
    setLoading(true);
    try {
      const cancelledPolicy = await updatePolicyStatus.mutateAsync({
        id: data?.policyId as string,
        status: "CANCELLED",
      });
      if (cancelledPolicy) {
        toast.success(
          "Claim closed and Policy cancelled since main member expired"
        );
      } else {
        toast.error("Cannot cancel policy");
      }
    } catch (err) {
      toast.error("Cannot cancel policy");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };
  const removeMemberFromPolicy = (obj: any, memberId: string) => {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].filter((iterator: any) => iterator.id !== memberId);
        if (obj[key].length == 0) {
          delete obj[key];
        }
      } else if (obj[key].id === memberId) {
        delete obj[key];
      }
    }
    return obj;
  };

  const updatePolicyDate = async () => {
    if (policyData.members.mainMember) {
      const mainMember = policyData?.members?.mainMember;
      const req: any = {
        isArchived: policy.isArchived,
        billingDay: Number(policy?.billingDay),
        options: policy?.options,
        status: policy.status,
        billingFrequency: policy?.billingFrequency,
        policyData: {
          ...policyData,
          members: {
            ...policyData.members,
            mainMember: {
              ...mainMember,
              dateOfBirth: new Date(mainMember?.dateOfBirth),
              ...(mainMember?.createdAt
                ? { createdAt: new Date(mainMember?.createdAt) }
                : {}),
              ...(mainMember?.updatedAt
                ? { updatedAt: new Date(mainMember?.updatedAt) }
                : {}),
            },
          },
          packageName: packageNames.funeral,
        },
        startDate: new Date(policy.startDate),
        endDate: new Date(policy.endDate),
        schemeType: policy.schemeType ?? "GROUP",
        autoRenewal: policy.autoRenewal ?? false,
        policyNumber: policy?.policyNumber,
        policyholderId: policy?.policyholderId,
        applicationId: policy?.applicationId,
        beneficiaries: beneficiaries.map((beneficiary: any) => {
          return {
            ...beneficiary,
            percentage: parseInt(beneficiary.percentage),
            dateOfBirth: new Date(beneficiary.dateOfBirth),
          };
        }),
      };
      if (policyData.members.spouse) {
        req.policyData.members.spouse = policyData?.members?.spouse?.map(
          (spouse: any) => {
            return {
              ...spouse,
              dateOfBirth: new Date(spouse?.dateOfBirth),
              ...(spouse.createdAt
                ? { createdAt: new Date(spouse.createdAt as Date) }
                : {}),
              ...(spouse.updatedAt
                ? { updatedAt: new Date(spouse.updatedAt as Date) }
                : {}),
            };
          }
        );
      }
      if (policyData.members.children) {
        req.policyData.members.children = policyData?.members?.children?.map(
          (child: any) => {
            if (child?.isStillBorn) {
              const { dateOfBirth, ...restChild } = child;
              return {
                id: restChild.id,
                firstName: restChild.firstName,
                lastName: restChild.lastName,
                age: 0,
                isDisabled: restChild.isDisabled,
                isStillBorn: restChild.isStillBorn,
                isStudying: restChild.isStudying,
                ...(child.createdAt
                  ? { createdAt: new Date(child.createdAt as Date) }
                  : {}),
                ...(child.updatedAt
                  ? { updatedAt: new Date(child.updatedAt as Date) }
                  : {}),
              };
            } else if (!child?.isStillBorn && child?.dateOfBirth) {
              return {
                ...child,
                dateOfBirth: new Date(child?.dateOfBirth),
                ...(child.createdAt
                  ? { createdAt: new Date(child.createdAt as Date) }
                  : {}),
                ...(child.updatedAt
                  ? { updatedAt: new Date(child.updatedAt as Date) }
                  : {}),
              };
            } else {
              return child;
            }
          }
        );
      }
      if (policyData.members.extendedFamily) {
        req.policyData.members.extendedFamily =
          policyData?.members?.extendedFamily?.map((family: any) => {
            return {
              ...family,
              dateOfBirth: new Date(family?.dateOfBirth),
              ...(family.createdAt
                ? { createdAt: new Date(family.createdAt as Date) }
                : {}),
              ...(family.updatedAt
                ? { updatedAt: new Date(family.updatedAt as Date) }
                : {}),
            };
          });
      }
      try {
        const updatePolicyRes = await updatePolicy.mutateAsync({
          id: data?.policyId as string,
          body: req,
        });
        if (updatePolicyRes) {
          toast.success("Claim closed and policy updated");
        }
      } catch (error) {
        toast.error("Error updating policy");
      } finally {
        refetchShow();
      }
    } else {
      cancelPolicy();
    }
  };

  const closeClaim = async () => {
    setShowCloseClaimModel(!showCloseClaimModel);
    setLoading(true);
    try {
      const closedClaim = await updateClaimStatus.mutateAsync({
        id: data?.id as string,
        status: claimStatusValues.close as ClaimStatus,
      });

      if (closedClaim) {
        if (
          closedClaim.approvalStatus ===
            claimApprovalStatusValues.payoutProcessed &&
          closedClaim.claimStatus === claimStatusValues.close
        ) {
          if (data?.packageName === packageNames.funeral) {
            const updatedPoliciesData = removeMemberFromPolicy(
              policyData.members,
              deceasedValues.deceasedMemberId
            );
            setPolicyData(updatedPoliciesData);
            await updatePolicyDate();
          } else {
            // router.push("/claim/list");
            toast.success("Claim closed successfully");
          }
        }
      } else {
        toast.error("Please try again later");
      }
    } catch (error) {
      toast.error("Unable to close the claim please try again later");
    } finally {
      setLoading(false);
      handleDataRefetch();
    }
  };

  const handleSendToReview = () => {
    if (checkShowSendToReview()) {
      setIsSendToReviewModal(!isSendToReviewModal);
    } else {
      toast.warning("Fill out Claim Description for review");
    }
  };
  const getRequestedAmount = () => {
    let requestedAmount;
    switch (data?.packageName) {
      case packageNames.funeral:
        const isNatural = incidentValues?.funeralClaimType === "NATURAL";
        const deceasedMemberDetails = memberDetails.filter(
          (member) => member.id === deceasedValues.deceasedMemberId
        );
        requestedAmount = isNatural
          ? Number(deceasedMemberDetails[0].naturalDeathAmount)
          : Number(deceasedMemberDetails[0]?.accidentalDeathAmount);

        return requestedAmount;
        break;
      case packageNames.device:
        return (
          data?.policies?.policyData as { deviceData?: { devicePrice?: any } }
        )?.deviceData?.devicePrice;
        break;
      case packageNames.creditLifeMotor:
        return (
          data?.policies?.policyData as { creditLife?: { sumAssured?: any } }
        )?.creditLife?.sumAssured;
        break;
      case packageNames.creditLifeDevice:
        return (
          data?.policies?.policyData as {
            deviceCreditLife?: { sumAssured?: any };
          }
        )?.deviceCreditLife?.sumAssured;
        break;
      case packageNames.retailDeviceInsurance:
        return (
          data?.policies?.policyData as { deviceData?: { devicePrice?: any } }
        )?.deviceData?.devicePrice;
        break;
      case packageNames.retailDeviceCreditLife:
        return (
          data?.policies?.policyData as {
            deviceCreditLife?: { sumAssured?: any };
          }
        )?.deviceCreditLife?.sumAssured;
        break;
    }
  };
  const claimSendToReview = async () => {
    setIsSendToReviewModal(!isSendToReviewModal);
    setLoading(true);
    try {
      const claimApprovalData = await updateClaimStatus.mutateAsync({
        id: data?.id as string,
        status: claimStatusValues.acknowledged as ClaimStatus,
        requestedAmount: getRequestedAmount() ?? 0,
        approvalStatus:
          claimApprovalStatusValues.pending as ClaimApprovalStatus,
      });
      if (claimApprovalData) {
        setLoading(false);
        toast.success("Claim sent to review successfully");
        // router.push("/claim/list");
      } else {
        // router.push("/claim/list");
        toast.error("Unable to update claim status please try again later");
      }
    } catch (error) {
      toast.error("Unable to update");
    } finally {
      setLoading(false);
      handleRefetchShow();
    }
  };

  const handleBeneficiaryPhoneChange = (
    name: string,
    value: any,
    index: number = 0
  ) => {
    const form: any = [...beneficiaries];
    const error: any = [...beneficiaryErrors];
    form[index][name] = value;

    let result = validatePhoneNum(value);
    error[index] = {
      ...error[index],
      [name]: result ? "" : "Invalid phone number",
    };
    setBeneficiaryErrors([...error]);
    setBeneficiaries([...form]);
  };

  const handleBeneficiaryChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = [...beneficiaries];
    form[index][name] = value;
    setBeneficiaries([...form]);
  };

  useEffect(() => {
    if (data?.createdBy || data?.updatedBy) {
      checkProperty();
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setClaimData(data);
      setPolicyData(data?.policies?.policyData);
      setPolicy(data?.policies);
    }
  }, [data]);

  useEffect(() => {
    extractObjects(policyData?.members);
  }, [policyData]);

  useEffect(() => {
    if (isLoading) {
      setObjects({});
      setArrays({});
      setRemaining({});
    } else {
      Object.entries(claimData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          setArrays((prevArrays) => ({ ...prevArrays, [key]: value }));
        } else if (typeof value === "object") {
          if (key == "policies") {
            setPolicyDataNew((prevObjects) => ({
              ...prevObjects,
              [key]: value,
            }));
          } else if (
            key !== "updatedBy" &&
            key !== "createdBy" &&
            key !== "updatedAt" &&
            key !== "createdAt"
          ) {
            setObjects((prevObjects) => ({ ...prevObjects, [key]: value }));
          } else {
            setRemaining((prevObjects) => ({ ...prevObjects, [key]: value }));
          }
        } else if (key != "policyId" && key != "packageName") {
          setRemaining((prevObjects) => ({ ...prevObjects, [key]: value }));
        } else {
          setPolicyId((prevObjects) => ({ ...prevObjects, [key]: value }));
        }
      });
    }
  }, [claimData]);
  useEffect(() => {
    setPolicyNumber(policyDataNew?.policies?.policyNumber);
  }, [objects]);

  useEffect(() => {
    setBeneficiariesData([]);
    policyDataNew?.policies?.beneficiaries?.map((item: any) => {
      const mergedObject = flattenObject(item);
      delete mergedObject.policyId;
      setBeneficiariesData((prevData: any[]) => [...prevData, mergedObject]);
    });
    setToggleBenficiaries(!toggleBenficiaries);
  }, [policyDataNew]);

  function extractObjects(obj: any) {
    let memberObjects = [];
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => {
            memberObjects.push(item);
            extractObjects(item);
          });
        } else {
          memberObjects.push(obj[key]);
        }
      }
    }
    setMemberDetails(memberObjects);
  }

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
      } else if (obj[key] == "policyId") {
        delete obj[key];
      } else {
        flattened[key] = obj[key];
      }
    }
    return flattened;
  }

  let {
    isLoading: noteDataLoading,
    data: noteData,
    error: noteError,
  } = api.claimNote.findByClaimId.useQuery(router.query.id as string);

  //Activity API
  let {
    data: activityData,
    refetch: refetchActivity = () => {},
    error: activityError,
  } = api.claimActivity.findByClaimId.useQuery(router.query.id as string);

  const handleDataRefetch = () => {
    refetchShow();
    refetchActivity();
  };

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  const addnote = api.claimNote.create.useMutation();
  const handleSubmit = async (title: string, description: string) => {
    setLoading(true);
    let res;
    try {
      res = await addnote.mutateAsync({
        claimId: router.query.id as string,
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
        toast.error("Try again later");
      }
    } catch (error) {
      toast.error("Unable to add notes");
    } finally {
      setLoading(false);
    }
  };
  const handleNoteChange = (e: IEvent, index: number = 0) => {
    let form = { ...note };
    const { name, value } = e.target;
    form[name] = value;
    setNote({ ...form });
  };
  const handleAddNote = () => {
    setOpen(true);
  };
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
  }, [error, activityError, noteError]);

  const handleIsArchivedInClaim = () => {
    setIsArchivedModalInClaim(!isArchivedModalInClaim);
  };

  const ClaimIsArchived = async () => {
    setIsArchivedModalInClaim(!isArchivedModalInClaim);
    setLoading(true);
    try {
      const claimData = await archivedClaim.mutateAsync({
        id: data?.id ?? "",
      });
      if (claimData) {
        router.push("/claim/list");
        toast.success("Successfully archived the claim");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to archive claim please try again later");
    } finally {
      setLoading(false);
      handleRefetchShow();
    }
  };
  useEffect(() => {
    if (data) {
      setFileStore([...data?.fileIds]);
      if (data.packageName === packageNames.device) {
        const hiddenTabs = ["beneficiaries"];
        setHiddenTabs(hiddenTabs);
      }
    }
  }, [data]);

  const handleModalOpen = () => {
    setFileUpload([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFileUpload([]);
    setIsModalOpen(false);
  };

  const handleFileSubmit = async () => {
    setLoading(true);
    setIsModalOpen(false);
    try {
      const uploadingFiles = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            referenceId: claimId,
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            category: "claim",
            createdById: data?.createdById,
          };
          const res = await createFile.mutateAsync(req);
          if (res) {
            let claimPayoutProcessedData;
            if (
              session.data?.user?.roles?.includes(
                roleValues.claimSupervisor as UserRole
              )
            ) {
              claimPayoutProcessedData = await updateClaimStatus.mutateAsync({
                id: data?.id as string,
                status: claimStatusValues.finalized as ClaimStatus,
                approvalStatus:
                  claimApprovalStatusValues.payoutProcessed as ClaimApprovalStatus,
              });
            }
          } else {
            toast.error(
              "Error occured while uploading the file please try again later"
            );
          }
          return res;
        })
      );
      if (uploadingFiles) {
        if (payoutProcessed) {
          const approvedClaim = await updateClaimStatus.mutateAsync({
            id: data?.id as string,
            status: claimStatusValues.finalized as ClaimStatus,
            approvalStatus:
              claimApprovalStatusValues.payoutProcessed as ClaimApprovalStatus,
          });
          if (approvedClaim) {
            toast.success("Payout processed successfully");
            setIsModalOpen(false);
          }
        } else {
          setFileStore([...fileStore, ...uploadingFiles]);
          setIsModalOpen(false);
          toast.success("Successfully uploaded the document");
        }
      }
    } catch (err) {
      setIsModalOpen(false);
      toast.error("Please try again later");
    } finally {
      setLoading(false);
      handleRefetchShow();
    }
  };

  const imageOverview = (index: any) => {
    setImageModalOpen(true);
    setSelectedBar(index);
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

  const modalClose = () => {
    setSelectedBar(null);
    setImageModalOpen(false);
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
  function convertStringToTitleCase(input: string): string {
    if (typeof input !== "string" || !input.trim()) {
      return "";
    }
    let words = input?.toLowerCase().split("_");
    const capitalizedWords = words.map((word, index) => {
      if (index == 0) {
        const firstLetter = word.charAt(0).toUpperCase();
        const restOfWord = word.slice(1);
        return firstLetter + restOfWord;
      } else {
        const restOfWord = word.slice(0);
        return restOfWord;
      }
    });
    return capitalizedWords.join(" ");
  }
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
    setButtonDisable(false);
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

  const handlePhoneChange = (name: string, value: any) => {
    const result = validatePhoneNum(value);
    if (!result) {
      setDisabled({
        ...disabled,
        phone: true,
      });
      setClaimantErrors({
        ...claimantErrors,
        [name]: "Invalid phone number",
      });
    } else {
      setDisabled({
        ...disabled,
        phone: false,
      });
      setClaimantErrors({
        ...claimantErrors,
        [name]: "",
      });
    }
    setEditClaimantData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleCheckList = async (id: number, checked: boolean) => {
    setCheckListLoading(true);
    const updatedChecklist = await updateCheckList.mutateAsync({
      id: id,
      checked: checked,
    });
    handleDataRefetch();
    setCheckListLoading(false);
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  const category = router.pathname.split("/")[1];

  const handleRejectClaim = () => {
    setRejectClaim(true);
  };

  const claimReject = async () => {
    setRejectClaim(!rejectClaim);
    setLoading(true);
    try {
      const rejectedClaim = await updateClaimStatus.mutateAsync({
        id: data?.id as string,
        status: claimStatusValues.reject as ClaimStatus,
        approvalStatus:
          claimApprovalStatusValues.repudated as ClaimApprovalStatus,
      });
      let res;
      if (rejectedClaim) {
        res = await addnote.mutateAsync({
          claimId: data?.id as string,
          title: claimNotes?.title,
          description: claimNotes?.description,
        });
      }
      if (rejectedClaim && res) {
        setLoading(false);
        toast.success("Successfully rejected the claim");
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("error occurd while rejecting the claim");
    } finally {
      setLoading(false);
      setClaimNotes({ title: "", description: "" });
      handleRefetchShow();
    }
  };

  const handleClaimNotes = (e: IEvent) => {
    const { name, value } = e.target;
    setClaimNotes({
      ...claimNotes,
      [name]: value,
    });
  };

  return currentRoleAccessLevels?.Claim?.canView ? (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : !error || !noteError || !activityError ? (
        <div className="flex flex-row">
          <div className="w-full border-r-2 border-solid border-gray-300">
            <div className="relative flex justify-between border-b">
              <TabsBar
                tabs={claimTabs}
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
                  id="claimDetails"
                >
                  <div className="flex gap-x-3">
                    <h3 className="text-[26px] font-bold leading-9 text-dark-grey">
                      Claim Details
                    </h3>
                    <div className="flex gap-2.5">
                      <div>
                        <Status
                          status={data?.claimStatus as string}
                          page={"Claim"}
                        />
                      </div>
                      <div>
                        <Status
                          status={data?.approvalStatus as string}
                          page={"Claim"}
                        />
                      </div>
                    </div>
                    {data?.isArchived && <ArchivedComponent />}
                  </div>
                  <div className="flex items-center gap-x-2">
                    {currentRoleAccessLevels?.Claim?.canUpdate &&
                      !data?.isArchived && (
                        <ActionButtons
                          isVisible={true}
                          showAddNotes={true}
                          onClick={handleAddNote}
                          displayClosedClaim={handleShowCloseClaim()}
                          onClickClosedClaim={handleClosedClaim}
                          displaySendToReview={handleShowSendToReview()}
                          onClickSendToReview={handleSendToReview}
                          showIsArchiveInClaim={
                            currentRoleAccessLevels?.Claim?.canDelete
                          }
                          onClickIsArchivedInClaim={handleIsArchivedInClaim}
                          displayApprove={handleShowApproveClaim()}
                          onClickApprove={handleApproveClaim}
                          displayRepudiate={handleShowApproveClaim()}
                          onClickRepudiate={handleRepudiate}
                          displayPayoutProcessed={handleShowPayoutProcessed()}
                          onClickPayoutProcessed={handlePayoutProcessed}
                          displayPayoutBlocked={handleShowPayoutProcessed()}
                          onClickPayoutBlocked={handlePayoutBlocked}
                          showRejectClaim={handleShowSendToReview()}
                          onClickRejectClaim={handleRejectClaim}
                        />
                      )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 grid w-full grid-cols-2 items-center justify-between justify-items-center gap-x-[45px] gap-y-4">
                    <div className="grid w-full grid-cols-2">
                      <div className="text-sm font-semibold leading-6 text-gray-900">
                        Policy Number :
                      </div>
                      <div className=" text-sm leading-6 text-blue-500 underline ">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => {
                            router.push(`/policy/${policyId?.policyId}/show`);
                          }}
                        >
                          {policyNumber}
                        </span>
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-2">
                      <div className="text-sm font-semibold leading-6 text-gray-900">
                        Package Name :
                      </div>
                      <div className=" text-sm leading-6 text-dark-grey">
                        {convertStringToTitleCase(policyId?.packageName)}
                      </div>
                    </div>
                  </div>
                  {policyDataNew ? <DescriptionList data={remaining} /> : ""}
                </div>
                <PolicyDataComponent policyData={data?.policies?.policyData} />
              </div>

              <ShowDropdown
                id={"claimant"}
                title={"Claimant"}
                status={data?.approvalStatus ?? ""}
                checkStatus={claimApprovalStatusValues.pending}
                canUpdate={
                  currentRoleAccessLevels?.Claim?.canUpdate && !data?.isArchived
                }
                handleEdit={() => setEditOpen(true)}
                handleToggle={() =>
                  setShowDetails({
                    ...showDetails,
                    claimant: !showDetails.claimant,
                  })
                }
                toggleValue={showDetails.claimant}
                mainObject={claimData?.claimant}
              />
              {data?.packageName !== packageNames.device && (
                <ShowDropdown
                  id={"beneficiaries"}
                  title={"Beneficiary Details"}
                  status={data?.approvalStatus ?? ""}
                  checkStatus={claimApprovalStatusValues.pending}
                  canUpdate={
                    currentRoleAccessLevels?.Claim?.canUpdate &&
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
                  dropDownArray={claimData?.policies?.beneficiaries}
                  mainArray={beneficiariesData}
                />
              )}

              <div
                className="rounded-[10px] bg-white p-4"
                id="claimDescription"
              >
                <h3 className="text-xl font-bold leading-9 text-dark-grey">
                  Claim Description
                </h3>
                {claimData.packageName === packageNames.funeral && (
                  <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                    <FuneralClaimBlock
                      claimId={data?.id as string}
                      setLoading={(value) => {
                        setLoading(value);
                      }}
                      claimDataPackageName={claimData.packageName}
                      deceasedData={deceasedValues} //memberDetails
                      policyholderData={data?.policies?.policyData as Object}
                      policyId={data?.policyId as string}
                      claimant={data?.claimant as Object}
                      deceasedDetailsid={"deceasedDetails" as string}
                      Deceasedtitle={"Deceased Details" as string}
                      incidentDetailsid={"incidentDetails" as string}
                      incidentDetailsidTitle={"Incident Details" as string}
                      DoctorsDDetailsId={"DoctorsDetails" as string}
                      DoctorsDDetailsTitle={`Doctor's Details` as string}
                      status={data?.claimStatus ?? ""}
                      approvalStatus={data?.approvalStatus as string}
                      checkStatus={claimApprovalStatusValues.pending}
                      canUpdate={
                        currentRoleAccessLevels?.Claim?.canUpdate &&
                        !data?.isArchived
                      }
                      deceasedToggleValue={showDetails.deceasedDetails}
                      showDetails={showDetails}
                      setShowDetails={setShowDetails}
                      dropDownArray={
                        data?.funeralClaimBlock[
                          data?.funeralClaimBlock.length - 1
                        ]
                      }
                      refetch={refetchShow}
                      toggleDeceasedValue={showDetails.deceasedDetails}
                      toggleIncidentValue={showDetails.incidentDetails}
                      toggleDoctorValue={showDetails.doctorDetails}
                      deceasedValuesObject={deceasedValues}
                      requestedAmount={data?.requestedAmount}
                      incidentValues={incidentValues}
                      setIncidentValues={(value) => {
                        setIncidentValues(value);
                      }}
                      incidentInputs={incidentInputs}
                      setIncidentInputs={(value) => {
                        setIncidentInputs(value);
                      }}
                      deceasedValues={deceasedValues}
                      setDeceasedValues={(value) => {
                        setDeceasedValues(value);
                      }}
                      doctorsValues={doctorsValues}
                      setDoctorsValues={(value) => {
                        setDoctorsValues(value);
                      }}
                      months={months}
                      deceasedValue={deceasedValues.deceasedIndividual}
                      memberDetails={memberDetails}
                      setMemberDetails={(value) => {
                        setMemberDetails(value);
                      }}
                      createdDate={data?.createdAt}
                    />
                  </div>
                )}
                {data?.packageName === packageNames.creditLifeDevice && (
                  <CreditLifeDeviceClaimBlock
                    id={"incidentDetails" as string}
                    title={"Incident Details" as string}
                    claimId={data?.id}
                    setLoading={setLoading}
                    policyId={data?.policyId as string}
                    requestedAmount={Number(data?.requestedAmount)}
                    claimDataPackageName={data?.packageName as string}
                    status={data?.approvalStatus as string}
                    checkStatus={claimApprovalStatusValues.pending as string}
                    canUpdate={
                      currentRoleAccessLevels?.Claim?.canUpdate &&
                      !data?.isArchived
                    }
                    claimStatus={data?.claimStatus as string}
                    claimant={data?.claimant as Object}
                    incidentValues={incidentValues}
                    setIncidentValues={setIncidentValues}
                    toggleValue={showDetails.creditLifeDeviceIncidentDetails}
                    showDetails={showDetails}
                    setShowDetails={setShowDetails}
                    dropDownArray={
                      data?.creditLifeDeviceClaimBlock[
                        data?.creditLifeDeviceClaimBlock.length - 1
                      ]
                    }
                    policyStartDate={data?.policies?.startDate}
                    createdDate={data?.createdAt}
                    refetch={refetchShow}
                  />
                )}
                {data?.packageName === packageNames.creditLifeMotor && (
                  <CreditLifeMotorClaimBlock
                    id={"incidentDetails" as string}
                    policyId={data?.policyId as string}
                    requestedAmount={Number(data?.requestedAmount)}
                    claimant={data?.claimant as Object}
                    claimStatus={data?.claimStatus as string}
                    setLoading={setLoading}
                    refetch={refetchShow}
                    claimId={data?.id as string}
                    title={"Incident Details" as string}
                    claimDataPackage={data?.packageName}
                    status={data?.approvalStatus as string}
                    canUpdate={
                      currentRoleAccessLevels?.Claim?.canUpdate &&
                      !data?.isArchived
                    }
                    toggleValue={showDetails.creditLifeDeviceIncidentDetails}
                    checkStatus={claimApprovalStatusValues.pending}
                    dropDownArray={
                      data?.creditLifeClaimBlock[
                        data.creditLifeClaimBlock.length - 1
                      ]
                    }
                    showDetails={showDetails}
                    setShowDetails={setShowDetails}
                    incidentValues={incidentValues}
                    setIncidentValues={setIncidentValues}
                    incidentInputs={incidentInputs}
                    setIncidentInputs={setIncidentInputs}
                    createdDate={data?.createdAt}
                  />
                )}
                {claimData.packageName === packageNames.device && (
                  <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                    <DeviceClaimBlock
                      claimId={data?.id as string}
                      setLoading={setLoading}
                      claimStatus={data?.claimStatus as string}
                      policyId={data?.policyId as string}
                      requestedAmount={Number(data?.requestedAmount)}
                      claimant={data?.claimant as Object}
                      packageName={data?.packageName as string}
                      approvalStatus={data?.approvalStatus as string}
                      claimApprovalStatus={claimApprovalStatusValues.pending}
                      canUpdate={
                        currentRoleAccessLevels?.Claim?.canUpdate &&
                        !data?.isArchived
                      }
                      showDetails={showDetails}
                      toggleIncidentValue={showDetails.deviceIncidentDetails}
                      toggleLostValue={showDetails.deviceLostDetails}
                      setShowDetails={setShowDetails}
                      dropDownArray={
                        data?.deviceClaimBlock[
                          data?.deviceClaimBlock?.length - 1
                        ]
                      }
                      policyStartDate={data?.policies?.startDate}
                      createdDate={data?.createdAt}
                      refetch={refetchShow}
                    />
                  </div>
                )}
                {claimData.packageName ===
                  packageNames.retailDeviceInsurance && (
                  <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                    <RetailDeviceClaimBlock
                      claimId={data?.id as string}
                      setLoading={setLoading}
                      claimStatus={data?.claimStatus as string}
                      policyId={data?.policyId as string}
                      requestedAmount={Number(data?.requestedAmount)}
                      claimant={data?.claimant as Object}
                      packageName={data?.packageName as string}
                      approvalStatus={data?.approvalStatus as string}
                      claimApprovalStatus={claimApprovalStatusValues.pending}
                      canUpdate={
                        currentRoleAccessLevels?.Claim?.canUpdate &&
                        !data?.isArchived
                      }
                      policyStartDate={data?.policies?.startDate}
                      showDetails={showDetails}
                      toggleIncidentValue={showDetails.deviceIncidentDetails}
                      toggleLostValue={showDetails.deviceLostDetails}
                      setShowDetails={setShowDetails}
                      dropDownArray={
                        data?.retailDeviceClaim[
                          data?.retailDeviceClaim?.length - 1
                        ]
                      }
                      createdDate={data?.createdAt}
                      refetch={refetchShow}
                    />
                  </div>
                )}
                {data?.packageName === packageNames.retailDeviceCreditLife && (
                  <RetailCreditLifeDeviceClaimBlock
                    id={"incidentDetails" as string}
                    title={"Incident Details" as string}
                    claimId={data?.id}
                    setLoading={setLoading}
                    policyId={data?.policyId as string}
                    requestedAmount={Number(data?.requestedAmount)}
                    claimDataPackageName={data?.packageName as string}
                    status={data?.approvalStatus as string}
                    checkStatus={claimApprovalStatusValues.pending as string}
                    canUpdate={
                      currentRoleAccessLevels?.Claim?.canUpdate &&
                      !data?.isArchived
                    }
                    claimStatus={data?.claimStatus as string}
                    claimant={data?.claimant as Object}
                    incidentValues={incidentValues}
                    setIncidentValues={setIncidentValues}
                    toggleValue={showDetails.creditLifeDeviceIncidentDetails}
                    showDetails={showDetails}
                    setShowDetails={setShowDetails}
                    createdDate={data?.createdAt}
                    dropDownArray={
                      data?.retailCreditLifeDevice[
                        data?.retailCreditLifeDevice.length - 1
                      ]
                    }
                    refetch={refetchShow}
                  />
                )}
              </div>
              <ShowDropdown
                id={"checkList"}
                title={"Check List"}
                canUpdate={
                  currentRoleAccessLevels?.Claim?.canUpdate && !data?.isArchived
                }
                handleEdit={undefined}
                handleToggle={() =>
                  setShowDetails({
                    ...showDetails,
                    checkList: !showDetails.checkList,
                  })
                }
                handleApiButton={handleCheckList}
                checkList={true}
                checkListData={checklist}
                toggleValue={showDetails.checkList}
                isLoading={checkListLoading}
                isFetching={isFetching}
              />

              <ShowDropdown
                id={"documents"}
                title={"Documents"}
                status={data?.approvalStatus ?? ""}
                checkStatus={claimApprovalStatusValues.pending}
                canUpdate={
                  currentRoleAccessLevels?.Claim?.canUpdate && !data?.isArchived
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
                documentRefetch={refetchShow}
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
              onCloseClick={() => {
                onModalClose();
                handleDataRefetch();
              }}
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
                        formErrors={beneficiaryErrors}
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
                        formErrors={beneficiaryErrors}
                        tailwindClass="grid grid-cols-2 gap-4"
                      />
                    </div>
                  );
                })}
                <div className="flex w-full justify-center">
                  <Button text="Save" type={"submit"} className="mr-3" />
                  <AddButton
                    name="Add Beneficiaries"
                    handleClick={() => addNewMember()}
                  />
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
              handleSubmit={handleSubmit}
            />
          )}

          {showApproveModel && (
            <Modal
              onCloseClick={() => {
                handleDataRefetch();
                setShowApproveModel(!showApproveModel);
                setGrantedAmount({ grantedAmount: data?.requestedAmount ?? 0 });
                setClaimantErrors({
                  ...claimantErrors,
                  grantedAmount: "",
                });
                setSaveButtonDisable(false);
              }}
              // showButtons={true}
              buttonDisabled={saveButtonDisable}
              okButtonTitle="Confirm"
              // onSaveClick={approveClaim}
              title={"Claim Approval"}
            >
              <form onSubmit={approveClaim}>
                <InputField
                  input={{
                    label: "Granted amount",
                    type: "number",
                    name: "grantedAmount",
                    required: true,
                    disabled: true,
                  }}
                  handleChange={hadleApproveOnChange}
                  formValues={grantedAmount}
                  formErrors={claimantErrors}
                />
                <div className="flex w-full justify-end">
                  <Button text="Save" className="mr-3" type="submit" />
                  <SecondaryButton
                    text="Cancel"
                    onClick={() => {
                      handleDataRefetch();
                      setShowApproveModel(!showApproveModel);
                      setGrantedAmount({
                        grantedAmount: data?.requestedAmount ?? 0,
                      });
                      setClaimantErrors({
                        ...claimantErrors,
                        grantedAmount: "",
                      });
                    }}
                  />
                </div>
              </form>
            </Modal>
          )}
          {showRepudiateModel && (
            <Modal
              onCloseClick={() => {
                handleDataRefetch();
                setShowRepudiateModel(!showRepudiateModel);
              }}
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={repudiateClaim}
              title={"Claim Repudiate"}
            >
              <div>
                <p>Click Confirm to Repudiate</p>
              </div>
            </Modal>
          )}

          {showPayoutBlockedModel && (
            <Modal
              onCloseClick={() => {
                handleDataRefetch();
                setShowPayoutBlockedModel(!showPayoutBlockedModel);
              }}
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={payoutBlockedClaim}
              title={"Payout Blocked"}
            >
              <div>
                <p>Click Confirm to Block Payout</p>
              </div>
            </Modal>
          )}

          {editOpen && (
            <Modal
              title={"Update Claimant"}
              onCloseClick={() => {
                handleDataRefetch();
                setEditOpen(false);
                handleRefetchShow();
              }}
              // showButtons
              border
            >
              <form onSubmit={onEditSave}>
                <div className="text-lg font-bold text-gray-900">
                  {" "}
                  Claimant Details
                </div>
                <FormComponent
                  inputs={editClaimant}
                  formValues={editClaimantData}
                  handleChange={handleEditClaimant}
                  handlePhoneChange={handlePhoneChange}
                  formErrors={claimantErrors}
                  tailwindClass="grid grid-cols-2 gap-4"
                />
                <div className="mt-5 flex w-full justify-end">
                  <Button
                    text="Save"
                    type="submit"
                    disabled={disabled.phone || disabled.email}
                    className="mr-2"
                  />
                  <Button
                    text="Close"
                    onClick={() => {
                      handleDataRefetch();
                      setEditOpen(false);
                      handleRefetchShow();
                    }}
                  />
                </div>
              </form>
            </Modal>
          )}

          {showCloseClaimModel && (
            <Modal
              onCloseClick={() => {
                handleRefetchShow();
                setShowCloseClaimModel(!showCloseClaimModel);
              }}
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={closeClaim}
              title={"Close claim"}
            >
              <div>
                <p>Click Confirm to close this claim</p>
              </div>
            </Modal>
          )}

          {isArchivedModalInClaim && (
            <Modal
              onCloseClick={() => {
                setIsArchivedModalInClaim(!isArchivedModalInClaim);
                handleRefetchShow();
              }}
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={ClaimIsArchived}
              title={"Archive"}
            >
              <div>
                <p>Click on confirm to Archive</p>
              </div>
            </Modal>
          )}

          {isSendToReviewModal && (
            <Modal
              onCloseClick={() => {
                handleDataRefetch();
                setIsSendToReviewModal(!isSendToReviewModal);
              }}
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={claimSendToReview}
              title={"Send To Review"}
            >
              <div>
                <p>Requested amount is R{getRequestedAmount()}</p>
              </div>
            </Modal>
          )}
          {rejectClaim && (
            <Modal
              onCloseClick={() => {
                handleDataRefetch();
                setRejectClaim(!rejectClaim);
              }}
              title={"Reject Claim"}
            >
              <>
                <p>Enter reason to Reject claim</p>
                <form onSubmit={claimReject}>
                  <div>
                    <FormComponent
                      inputs={notesInput}
                      formValues={claimNotes}
                      handleChange={handleClaimNotes}
                    />
                  </div>
                  <div className="flex w-full justify-end">
                    <Button text="Confirm" type={"submit"} className="mr-3" />
                    <Button
                      text="Cancel"
                      onClick={() => {
                        setRejectClaim(!rejectClaim);
                      }}
                    />
                  </div>
                </form>
              </>
            </Modal>
          )}

          {isModalOpen && (
            <Modal
              title={"Upload documents"}
              onCloseClick={() => {
                closeModal();
                handleRefetchShow();
              }}
              onSaveClick={() => handleFileSubmit()}
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
                          onCloseClick={() => {
                            modalClose();
                            handleRefetchShow();
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
        </div>
      ) : (
        !data && (
          <>
            <ErrorComponent />
          </>
        )
      )}
    </>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}

export default DefaultLayout(ClaimView);
