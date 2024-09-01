import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import ShowDropdown from "~/common/showDropDown";
import { IShowDetails } from "~/interfaces/common";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { packageNames } from "~/utils/constants";
import {
  deceasedInputs,
  doctorsInput,
  getIncidentInputs,
} from "~/utils/constants/claims";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { validatePhoneNum } from "~/utils/helpers/validations";
interface IFuneralBlock {
  claimId: string;
  claimDataPackageName: string;
  setLoading: (loader: boolean) => void;
  policyId: string;
  claimant: Object;
  deceasedDetailsid: string;
  Deceasedtitle: string;
  incidentDetailsid: string;
  incidentDetailsidTitle: string;
  DoctorsDDetailsId: string;
  DoctorsDDetailsTitle: string;
  status: string;
  checkStatus: string;
  canUpdate: boolean;
  showDetails: IShowDetails;
  setShowDetails: (details: IShowDetails) => void;
  dropDownArray: any;
  policyholderData: Object;
  deceasedData: Object;
  deceasedToggleValue: Object;
  toggleDeceasedValue: boolean;
  toggleIncidentValue: boolean;
  toggleDoctorValue: boolean;
  approvalStatus: string;
  deceasedValuesObject: Object;
  requestedAmount: any;
  refetch: () => {};
  incidentValues: any;
  setIncidentValues: (val: any) => void;
  incidentInputs: any;
  setIncidentInputs: (val: any) => void;
  deceasedValues: any;
  setDeceasedValues: (val: any) => void;
  doctorsValues: any;
  setDoctorsValues: (val: any) => void;
  months: number;
  deceasedValue: string;
  memberDetails: any;
  createdDate: any;
  setMemberDetails: (val: any) => void;
}
const FuneralClaimBlock = ({
  claimId,
  setLoading,
  policyId,
  claimDataPackageName,
  claimant,
  deceasedDetailsid,
  Deceasedtitle,
  status,
  checkStatus,
  canUpdate,
  showDetails,
  setShowDetails,
  policyholderData,
  dropDownArray,
  refetch,
  deceasedData,
  deceasedToggleValue,
  incidentDetailsid,
  incidentDetailsidTitle,
  DoctorsDDetailsId,
  DoctorsDDetailsTitle,
  toggleDeceasedValue,
  toggleIncidentValue,
  toggleDoctorValue,
  deceasedValuesObject,
  requestedAmount,
  approvalStatus,
  incidentValues,
  setIncidentValues,
  incidentInputs,
  setIncidentInputs,
  deceasedValues,
  setDeceasedValues,
  doctorsValues,
  setDoctorsValues,
  months,
  deceasedValue,
  memberDetails,
  setMemberDetails,
  createdDate,
}: IFuneralBlock) => {
  const [isDecModalOpen, setIsDecModalOpen] = useState(false);
  const [isIncModalOpen, setIsIncModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [formErrors, setFormErrors] = useState({} as any);
  const [doctorsErrors, setDoctorsErrors] = useState({} as any);
  const [deceasedMemberDetails, setDeceasedMemberDetails] = useState({} as any);
  const claimDescription: any = api.claim.update.useMutation();
  useEffect(() => {
    const deceasedData = {
      deceasedMemberId: dropDownArray?.deceasedMemberId,
      firstName: dropDownArray?.firstName,
      lastName: dropDownArray?.lastName,
      deceasedIndividual: dropDownArray?.deceasedIndividual,
      said: dropDownArray?.said,
      deceasedIndividualCreatedAt: dropDownArray?.createdAt,
    };
    setDeceasedValues(deceasedData);
    const incidentFormInputs = getIncidentInputs(
      claimDataPackageName as string
    );
    setIncidentInputs(incidentFormInputs);
    const incidentData = {
      claimCreatedDate: dateConversion(createdDate),
      dateOfDeath:
        dropDownArray?.dateOfDeath &&
        dateConversion(dropDownArray?.dateOfDeath),
      funeralClaimType: dropDownArray?.funeralClaimType,
      cause: dropDownArray?.cause,
      policeCaseNumber: dropDownArray?.policeCaseNumber,
      reportingPoliceStation: dropDownArray?.reportingPoliceStation,
      referenceNumber: dropDownArray?.referenceNumber,
      incidentDescription: dropDownArray?.incidentDescription,
    };
    setIncidentValues(incidentData);
    const doctorData = {
      doctorName: dropDownArray?.doctorName,
      doctorContactNumber: dropDownArray?.doctorContactNumber,
      doctoreAddress: dropDownArray?.doctoreAddress,
    };
    setDoctorsValues(doctorData);
  }, [dropDownArray]);

  const handleDeceasedFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;
    if (name === "deceasedMemberId") {
      const selectedMember: any = memberDetails?.filter(
        (member: any) => member?.id === value
      );
      setDeceasedMemberDetails(selectedMember[0]);
      setDeceasedValues((prevState: any) => ({
        ...prevState,
        [name]: value,
        firstName: selectedMember[0]?.firstName,
        lastName: selectedMember[0]?.lastName,
        said: selectedMember[0]?.said,
        deceasedIndividualCreatedAt: new Date(selectedMember[0]?.createdAt),
      }));
    } else {
      setDeceasedValues((prevState: any) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  const handleIncidentFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;

    if (name == "dateOfDeath") {
      const date = dateConversion(createdDate);
      const isValidDate = value < date;
      if (!isValidDate) {
        setFormErrors({
          ...formErrors,
          dateOfDeath: "Please Select a valid date",
        });
        setDisabled(true);
      } else {
        setFormErrors({ ...formErrors, dateOfDeath: "" });
        setDisabled(false);
      }
    }
    if (name == "funeralClaimType") {
      if (value.length > 0) {
        setFormErrors({ ...formErrors, funeralClaimType: "" });
        setDisabled(false);
      }
    }

    setIncidentValues((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleDocDetailsFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;

    setDoctorsValues((prevState: any) => ({
      ...prevState,

      [name]: value,
    }));
  };
  const handleDoctorPhoneChange = (name: string, value: any) => {
    const result = validatePhoneNum(value);
    setDoctorsErrors({
      ...doctorsErrors,
      [name]: result ? "" : "Invalid phone number",
    });
    setDoctorsValues((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const claimDescriptionDetails = async () => {
    if (incidentValues.funeralClaimType == null && isIncModalOpen) {
      setFormErrors({ ...formErrors, funeralClaimType: "Required" });
      setDisabled(true);
      return;
    }

    if (incidentValues.dateOfDeath == null && isIncModalOpen) {
      setFormErrors({ ...formErrors, dateOfDeath: "Required" });
      setDisabled(true);
      return;
    }

    setLoading(true);
    setIsDecModalOpen(false);
    setIsIncModalOpen(false);
    setIsDocModalOpen(false);
    var updatedClaimDetails;
    const request = {
      claimStatus: status,
      policyId: policyId,
      requestedAmount: requestedAmount,
      claimant: claimant,
      packageName: claimDataPackageName,
    };
    const updatedClaimDescription: any = {
      ...(deceasedValues.deceasedMemberId && {
        deceasedMemberId: deceasedValues.deceasedMemberId,
      }),
      ...(deceasedValues?.firstName && { firstName: deceasedValues.firstName }),
      ...(deceasedValues?.lastName && { lastName: deceasedValues.lastName }),
      ...(deceasedValues?.said && { said: deceasedValues.said }),
      ...(deceasedValues?.deceasedIndividualCreatedAt && {
        deceasedIndividualCreatedAt: new Date(
          deceasedValues.deceasedIndividualCreatedAt
        ),
      }),
      ...(deceasedValues?.deceasedIndividual && {
        deceasedIndividual: deceasedValues.deceasedIndividual,
      }),
      ...(incidentValues?.placeOfDeath && {
        placeOfDeath: incidentValues.placeOfDeath,
      }),
      ...(incidentValues?.cause && { cause: incidentValues.cause }),
      ...(incidentValues?.policeCaseNumber && {
        policeCaseNumber: incidentValues.policeCaseNumber,
      }),
      ...(incidentValues?.reportingPoliceStation && {
        reportingPoliceStation: incidentValues.reportingPoliceStation,
      }),
      ...(incidentValues?.referenceNumber && {
        referenceNumber: incidentValues.referenceNumber,
      }),
      ...(incidentValues?.incidentDescription && {
        incidentDescription: incidentValues.incidentDescription,
      }),
      ...(incidentValues?.claimCreatedDate && {
        claimCreatedDate: new Date(incidentValues.claimCreatedDate),
      }),
      ...(incidentValues?.dateOfDeath && {
        dateOfDeath: new Date(incidentValues.dateOfDeath),
      }),
      ...(incidentValues?.funeralClaimType &&
        claimDataPackageName === packageNames.funeral && {
          funeralClaimType: incidentValues.funeralClaimType,
        }),
      ...(doctorsValues?.doctorName && {
        doctorName: doctorsValues.doctorName,
      }),
      ...(doctorsValues?.doctorContactNumber && {
        doctorContactNumber: doctorsValues.doctorContactNumber.replace(
          /[\s-]/g,
          ""
        ),
      }),
      ...(doctorsValues?.doctoreAddress && {
        doctoreAddress: doctorsValues.doctoreAddress,
      }),
    };
    try {
      if (dropDownArray?.id > 0) {
        updatedClaimDetails = await claimDescription.mutateAsync({
          id: claimId ?? "",
          body: {
            ...request,
            claimBlocks: {
              id: dropDownArray?.id ?? "",
              packageName: claimDataPackageName,
              ...updatedClaimDescription,
            },
          },
        });
      } else {
        updatedClaimDetails = await claimDescription.mutateAsync({
          id: claimId ?? "",
          body: {
            ...request,
            claimBlocks: {
              packageName: claimDataPackageName,
              ...updatedClaimDescription,
            },
          },
        });
      }
      if (updatedClaimDetails) {
        toast.success("Claim description details updated successfully");
      } else {
        toast.error(
          "Error occurred while editing the claim description details"
        );
      }
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred.Please try again later.");
    } finally {
      setLoading(false);
      refetch();
    }
  };
  return (
    <>
      <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
        <ShowDropdown
          id={deceasedDetailsid}
          title={Deceasedtitle}
          status={approvalStatus ?? ""}
          checkStatus={checkStatus}
          canUpdate={canUpdate}
          handleToggle={() =>
            setShowDetails({
              ...showDetails,
              deceasedDetails: !showDetails.deceasedDetails,
            })
          }
          handleEdit={() => setIsDecModalOpen(true)}
          toggleValue={toggleDeceasedValue}
          dropDownArray={[deceasedData]}
          mainObject={deceasedData}
        />
      </div>
      <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
        <ShowDropdown
          id={incidentDetailsid}
          title={incidentDetailsidTitle}
          status={approvalStatus ?? ""}
          checkStatus={checkStatus}
          canUpdate={canUpdate}
          handleToggle={() => {
            setShowDetails({
              ...showDetails,
              incidentDetails: !showDetails.incidentDetails,
            });
            setIncidentValues({
              ...incidentValues,
              claimCreatedDate: dateConversion(createdDate),
            });
          }}
          handleEdit={() => {
            setIsIncModalOpen(true);
            setIncidentValues({
              ...incidentValues,
              claimCreatedDate: dateConversion(createdDate),
            });
          }}
          toggleValue={toggleIncidentValue}
          dropDownArray={[incidentValues]}
          months={months}
          deceasedValue={deceasedValue}
          mainObject={incidentValues}
        />
      </div>
      <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
        <ShowDropdown
          id={DoctorsDDetailsId}
          title={DoctorsDDetailsTitle}
          status={approvalStatus ?? ""}
          checkStatus={checkStatus}
          canUpdate={canUpdate}
          toggleValue={toggleDoctorValue}
          handleToggle={() =>
            setShowDetails({
              ...showDetails,
              doctorDetails: !showDetails.doctorDetails,
            })
          }
          handleEdit={() => setIsDocModalOpen(true)}
          dropDownArray={[doctorsValues]}
          // deceasedValue={deceasedValue}
          mainObject={doctorsValues}
        />
      </div>
      {claimDataPackageName === packageNames.funeral && isDecModalOpen && (
        <Modal
          title={"Claim Description"}
          onCloseClick={() => {
            setIsDecModalOpen(!isDecModalOpen);
            refetch();
          }}
          onSaveClick={claimDescriptionDetails}
          showButtons={true}
          border
        >
          <div className="align-center my-4 px-5" id="DetailsOfTheDeceased">
            <h2 className="my-2 text-base font-semibold leading-6 text-gray-900">
              Details of the deceased
            </h2>
            <div>
              <FormComponent
                inputs={deceasedInputs(policyholderData)}
                formValues={deceasedValues}
                handleChange={handleDeceasedFormInputChange}
                formErrors={{}}
                tailwindClass="grid grid-col-2 gap-4"
              />
            </div>
          </div>
        </Modal>
      )}

      {claimDataPackageName == packageNames.funeral && isIncModalOpen && (
        <Modal
          title={"Claim Description"}
          onCloseClick={() => {
            setIsIncModalOpen(!isIncModalOpen);
            refetch();
          }}
          onSaveClick={claimDescriptionDetails}
          showButtons={true}
          buttonDisabled={disabled}
          border
        >
          <div className="align-center my-4 px-5" id="DetailsOfTheIncident">
            <h2 className="my-2 text-base font-semibold leading-6 text-gray-900">
              Details of the Incident
            </h2>
            <div>
              <FormComponent
                inputs={incidentInputs}
                formValues={incidentValues}
                handleChange={handleIncidentFormInputChange}
                formErrors={formErrors}
                tailwindClass="grid grid-col-2 gap-x-4"
              />
            </div>
          </div>
        </Modal>
      )}

      {claimDataPackageName === packageNames.funeral && isDocModalOpen && (
        <Modal
          title={"Claim Description"}
          onCloseClick={() => {
            setIsDocModalOpen(!isDocModalOpen);
            refetch();
          }}
          onSaveClick={claimDescriptionDetails}
          showButtons={true}
          border
        >
          <div className="align-center my-4 px-5" id="DetailsOfTheDeceased">
            <h2 className="my-2 text-base font-semibold leading-6 text-gray-900">
              Doctor's Details
            </h2>
            <div>
              <FormComponent
                inputs={doctorsInput}
                formValues={doctorsValues}
                handleChange={handleDocDetailsFormInputChange}
                handlePhoneChange={handleDoctorPhoneChange}
                formErrors={{}}
                tailwindClass="grid grid-col-2 gap-4"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
export default FuneralClaimBlock;
