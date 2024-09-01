import React, { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "~/common/Modal";
import Button from "~/common/buttons/filledButton";
import FormComponent from "~/common/form";
import ShowDropdown from "~/common/showDropDown";
import { IShowDetails } from "~/interfaces/common";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { getIncidentInputs } from "~/utils/constants/claims";
import { dateConversion } from "~/utils/helpers";
interface ICreditLifeClaimBlock {
  id: string;
  title: string;
  claimId: string;
  policyId: string;
  requestedAmount: number;
  claimDataPackageName: string;
  claimant: Object;
  status: string;
  checkStatus: string;
  canUpdate: boolean;
  toggleValue: boolean;
  dropDownArray: any;
  claimStatus: string;
  incidentValues: any;
  createdDate: any;
  policyStartDate: any;
  setLoading: (loader: boolean) => void;
  setIncidentValues: (val: any) => void;
  showDetails: IShowDetails;
  setShowDetails: (details: IShowDetails) => void;
  refetch: () => {};
}
function CreditLifeDeviceClaimBlock({
  id,
  title,
  claimId,
  policyId,
  requestedAmount,
  claimDataPackageName,
  status,
  checkStatus,
  canUpdate,
  toggleValue,
  dropDownArray,
  incidentValues,
  claimant,
  claimStatus,
  setLoading,
  setIncidentValues,
  showDetails,
  setShowDetails,
  refetch,
  policyStartDate,
  createdDate,
}: ICreditLifeClaimBlock) {
  const [incidentModel, setIncidentModel] = useState(false);
  const [incidentInputs, setIncidentInputs] = useState<any>({});
  const [formErrors, setFormErrors] = useState({} as any);
  const [disabled, setDisabled] = useState(false);
  const claimDescription: any = api.claim.update.useMutation();
  useEffect(() => {
    // if (dropDownArray) {
    const incidentData = {
      claimCreatedDate: dateConversion(createdDate),
      dateOfDeath:
        dropDownArray?.dateOfDeath &&
        dateConversion(dropDownArray?.dateOfDeath),
      creditLifeClaimType: dropDownArray?.creditLifeClaimType,
      cause: dropDownArray?.cause,
      policeCaseNumber: dropDownArray?.policeCaseNumber,
      reportingPoliceStation: dropDownArray?.reportingPoliceStation,
      referenceNumber: dropDownArray?.referenceNumber,
      incidentDescription: dropDownArray?.incidentDescription,
      placeOfDeath: dropDownArray?.placeOfDeath,
    };
    setIncidentValues(incidentData);
    // }
    const incidentFormInputs = getIncidentInputs(
      claimDataPackageName as string
    );
    setIncidentInputs(incidentFormInputs);
  }, [dropDownArray]);

  const handleIncidentFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;

    if (name == "dateOfDeath") {
      const date = dateConversion(createdDate);
      const isValidDate = value < date;
      const isAfterPolicy = date > createdDate;
      if (!isValidDate || !isAfterPolicy) {
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
    setIncidentValues((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const claimDescriptionDetails = async () => {
    setIncidentModel(false);
    setLoading(true);
    var updatedClaimDetails;
    const request = {
      claimStatus: claimStatus,
      policyId: policyId,
      requestedAmount: requestedAmount,
      claimant: claimant,
      packageName: claimDataPackageName,
    };

    const updatedClaimDescription = {
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
      ...(incidentValues?.creditLifeClaimType && {
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
      <div>
        <ShowDropdown
          id={id}
          title={title}
          status={status}
          checkStatus={checkStatus}
          canUpdate={canUpdate}
          toggleValue={toggleValue}
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
          border
        >
          <form onSubmit={claimDescriptionDetails}>
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
            <div className="flex w-full justify-end">
              <Button
                text="Save"
                type={"submit"}
                className="mr-3"
                disabled={disabled}
              />
              <Button
                text="Close"
                onClick={() => {
                  refetch();
                  setIncidentModel(!incidentModel);
                  setFormErrors({});
                }}
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default CreditLifeDeviceClaimBlock;
