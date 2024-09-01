import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import ShowDropdown from "~/common/showDropDown";
import { IShowDetails } from "~/interfaces/common";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { packageNames } from "~/utils/constants";
import { getIncidentInputs } from "~/utils/constants/claims";
import { dateConversion } from "~/utils/helpers";
interface ICreditLifeMotor {
  id: string;
  title: string;
  status: string;
  claimStatus: string;
  toggleValue: boolean;
  checkStatus: string;
  canUpdate: boolean;
  dropDownArray: any;
  claimDataPackage: string;
  showDetails: IShowDetails;
  setLoading: (loader: boolean) => void;
  setShowDetails: (details: IShowDetails) => void;
  refetch: () => {};
  claimId: String;
  policyId: string;
  claimant: Object;
  requestedAmount: number;
  incidentValues: any;
  setIncidentInputs: (val: any) => void;
  incidentInputs: any;
  createdDate: any;
  setIncidentValues: (val: any) => void;
}
function CreditLifeMotorClaimBlock({
  id,
  title,
  status,
  checkStatus,
  claimStatus,
  toggleValue,
  canUpdate,
  dropDownArray,
  claimDataPackage,
  showDetails,
  setShowDetails,
  setLoading,
  refetch,
  claimId,
  policyId,
  claimant,
  requestedAmount,
  incidentValues,
  setIncidentInputs,
  incidentInputs,
  setIncidentValues,
  createdDate,
}: ICreditLifeMotor) {
  const claimDescription: any = api.claim.update.useMutation();
  const [incidentModel, setIncidentModel] = useState(false);
  useEffect(() => {
    const incidentFormInputs = getIncidentInputs(claimDataPackage as string);
    setIncidentInputs(incidentFormInputs);
    if (dropDownArray) {
      const incidentData = {
        claimCreatedDate: dateConversion(createdDate),
        dateOfDeath:
          dropDownArray.dateOfDeath &&
          dateConversion(dropDownArray.dateOfDeath),
        creditLifeClaimType: dropDownArray.creditLifeClaimType,
        cause: dropDownArray.cause,
        policeCaseNumber: dropDownArray.policeCaseNumber,
        reportingPoliceStation: dropDownArray.reportingPoliceStation,
        referenceNumber: dropDownArray.referenceNumber,
        incidentDescription: dropDownArray.incidentDescription,
      };
      setIncidentValues(incidentData);
    }
  }, [dropDownArray]);

  const handleIncidentFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;

    setIncidentValues((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const claimDescriptionDetails = async () => {
    setLoading(true);
    setIncidentModel(false);
    var updatedClaimDetails;
    const request = {
      claimStatus: claimStatus,
      policyId: policyId,
      requestedAmount: requestedAmount,
      claimant: claimant,
      packageName: claimDataPackage,
    };
    const updatedClaimDescription: any = {
      ...(incidentValues?.placeOfDeath && {
        placeOfDeath: incidentValues.placeOfDeath,
      }),
      ...(incidentValues?.cause && { cause: incidentValues.cause }),
      ...(incidentValues?.policeCaseNumber && {
        policeCaseNumber: incidentValues.policeCaseNumber,
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
      ...(incidentValues?.creditLifeClaimType &&
        claimDataPackage === packageNames.creditLifeMotor && {
          creditLifeClaimType: incidentValues.creditLifeClaimType,
        }),
    };
    try {
      if (dropDownArray?.id > 0) {
        updatedClaimDetails = await claimDescription.mutateAsync({
          id: claimId ?? "",
          body: {
            ...request,
            claimBlocks: {
              id: dropDownArray.id ?? "",
              packageName: claimDataPackage,
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
              packageName: claimDataPackage,
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
          id={id}
          title={title}
          canUpdate={canUpdate}
          toggleValue={toggleValue}
          status={status}
          checkStatus={checkStatus}
          handleEdit={() => setIncidentModel(true)}
          handleToggle={() =>
            setShowDetails({
              ...showDetails,
              creditLifeDeviceIncidentDetails:
                !showDetails.creditLifeDeviceIncidentDetails,
            })
          }
          dropDownArray={[incidentValues]}
          mainObject={incidentValues}
        />
      </div>
      {incidentModel && (
        <Modal
          title={"Claim Description"}
          onCloseClick={() => {
            setIncidentModel(!incidentModel);
            refetch();
          }}
          onSaveClick={claimDescriptionDetails}
          showButtons={true}
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
                formErrors={{}}
                tailwindClass="grid grid-col-2 gap-x-4"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
export default CreditLifeMotorClaimBlock;
