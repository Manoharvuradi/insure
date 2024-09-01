import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "~/common/Modal";
import Button from "~/common/buttons/filledButton";
import FormComponent from "~/common/form";
import InputField from "~/common/form/input";
import ShowDropdown from "~/common/showDropDown";
import { IShowDetails } from "~/interfaces/common";
import { IEvent, IInput } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import {
  claimDeviceIncidentInputs,
  claimDeviceInputs,
} from "~/utils/constants/claims";
import { dateConversion } from "~/utils/helpers";
interface DeviceBlock {
  claimId: string;
  setLoading: (loader: boolean) => void;
  claimStatus: string;
  policyId: string;
  requestedAmount: number;
  claimant: Object;
  packageName: string;
  approvalStatus: string;
  claimApprovalStatus: string;
  canUpdate: boolean;
  toggleIncidentValue: boolean;
  showDetails: IShowDetails;
  setShowDetails: (details: IShowDetails) => void;
  toggleLostValue: boolean;
  dropDownArray: any;
  policyStartDate: any;
  createdDate: any;
  refetch: () => {};
}
function DeviceClaimBlock({
  claimId,
  setLoading,
  claimStatus,
  policyId,
  requestedAmount,
  claimant,
  packageName,
  approvalStatus,
  claimApprovalStatus,
  canUpdate,
  toggleIncidentValue,
  showDetails,
  setShowDetails,
  toggleLostValue,
  dropDownArray,
  policyStartDate,
  refetch,
  createdDate,
}: DeviceBlock) {
  const [deviceModel, setDeviceModel] = useState(false);
  const [deviceClaimDetails, setDeviceClaimDetails] = useState({} as any);
  const [formErrors, setFormErrors] = useState({} as any);
  const claimDescription = api.claim.update.useMutation();
  const [disabled, setDisabled] = useState(false);
  const incidentType = "LOST";

  useEffect(() => {
    // if (dropDownArray) {
    setDeviceClaimDetails({
      ...dropDownArray,
      claimCreatedDate: createdDate && dateConversion(createdDate),
      incidentDate:
        dropDownArray?.incidentDate &&
        dateConversion(dropDownArray?.incidentDate),
    });
    // }
  }, [dropDownArray, createdDate]);

  const handleSubmitClaim = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    let updatedClaimDetails;
    const request: any = {
      claimStatus: claimStatus,
      policyId: policyId,
      requestedAmount: requestedAmount,
      claimant: claimant,
      packageName: packageName,
    };
    const claimDescriptionRequest = {
      packageName: dropDownArray?.packageName ?? "EMPLOYEE_DEVICE_INSURANCE",
      ...(deviceClaimDetails?.claimCreatedDate && {
        claimCreatedDate: new Date(deviceClaimDetails?.claimCreatedDate),
      }),
      ...(deviceClaimDetails?.incidentDate && {
        incidentDate: new Date(deviceClaimDetails.incidentDate),
      }),
      ...(deviceClaimDetails.claimType && {
        claimType: deviceClaimDetails.claimType,
      }),
      ...(deviceClaimDetails.incidentDescription && {
        incidentDescription: deviceClaimDetails.incidentDescription,
      }),
      ...(deviceClaimDetails.cause &&
      deviceClaimDetails.claimType === incidentType
        ? { cause: deviceClaimDetails.cause }
        : { cause: "" }),
      ...(deviceClaimDetails.policeCaseNumber &&
      deviceClaimDetails.claimType === incidentType
        ? {
            policeCaseNumber: deviceClaimDetails.policeCaseNumber,
          }
        : { policeCaseNumber: "" }),
      ...(deviceClaimDetails.reportingPoliceStation &&
      deviceClaimDetails.claimType === incidentType
        ? {
            reportingPoliceStation: deviceClaimDetails.reportingPoliceStation,
          }
        : { reportingPoliceStation: "" }),
      ...(deviceClaimDetails.referenceNumber &&
      deviceClaimDetails.claimType === incidentType
        ? {
            referenceNumber: deviceClaimDetails.referenceNumber,
          }
        : { referenceNumber: "" }),
      ...(deviceClaimDetails.address &&
      deviceClaimDetails.claimType === incidentType
        ? {
            address: deviceClaimDetails.address,
          }
        : { address: "" }),
      ...(deviceClaimDetails.suburb &&
      deviceClaimDetails.claimType === incidentType
        ? { suburb: deviceClaimDetails.suburb }
        : { suburb: "" }),
      ...(deviceClaimDetails.province &&
      deviceClaimDetails.claimType === incidentType
        ? {
            province: deviceClaimDetails.province,
          }
        : { province: "" }),
      ...(deviceClaimDetails?.postalCode &&
      deviceClaimDetails.claimType === incidentType
        ? {
            postalCode: deviceClaimDetails.postalCode,
          }
        : { postalCode: "" }),
    };

    try {
      if (dropDownArray?.id > 0) {
        updatedClaimDetails = await claimDescription.mutateAsync({
          id: claimId ?? "",
          body: {
            ...request,
            claimBlocks: {
              id: dropDownArray?.id,
              packageName:
                dropDownArray?.packageName ?? "EMPLOYEE_DEVICE_INSURANCE",
              ...claimDescriptionRequest,
            },
          },
        });
      } else {
        updatedClaimDetails = await claimDescription.mutateAsync({
          id: claimId ?? "",
          body: {
            ...request,
            claimBlocks: {
              packageName:
                dropDownArray?.packageName ?? "EMPLOYEE_DEVICE_INSURANCE",
              ...claimDescriptionRequest,
            },
          },
        });
      }
      if (updatedClaimDetails) {
        setLoading(false);
        toast.success("successfully updated");
      } else {
        setLoading(false);
        toast.error("Please try again later");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const handleDeviceClaimDetails = (e: IEvent) => {
    const { name, value } = e.target;

    if (name == "incidentDate") {
      const date = dateConversion(createdDate);
      const isValidDate = value < date;
      const isAfterPolicy = date > createdDate;
      if (!isValidDate || !isAfterPolicy) {
        setFormErrors({
          ...formErrors,
          incidentDate: "Please Select a valid date",
        });
        setDisabled(true);
      } else {
        setFormErrors({ ...formErrors, incidentDate: "" });
        setDisabled(false);
      }
    }

    setDeviceClaimDetails({
      ...deviceClaimDetails,
      [name]: value,
    });
  };

  return (
    <>
      <div className="mt-5 rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
        <ShowDropdown
          id={"DeviceIncidentDetails"}
          title={"Device Incident Details"}
          status={approvalStatus ?? ""}
          checkStatus={claimApprovalStatus}
          canUpdate={canUpdate}
          handleEdit={() => setDeviceModel(true)}
          handleToggle={() =>
            setShowDetails({
              ...showDetails,
              deviceIncidentDetails: !showDetails.deviceIncidentDetails,
            })
          }
          toggleValue={toggleIncidentValue}
          dropDownArray={[deviceClaimDetails]}
          mainObject={deviceClaimDetails}
        />
      </div>

      {deviceModel && (
        <Modal
          title={"Claim Description"}
          onCloseClick={() => {
            setDeviceModel(!deviceModel);
            refetch();
          }}
          border
        >
          <form
            onSubmit={handleSubmitClaim}
            className="max-h-[70vh] overflow-auto scrollbar-none"
          >
            <div className="align-center my-4 px-5" id="DetailsDeviceLost">
              <div>
                <FormComponent
                  inputs={claimDeviceIncidentInputs}
                  formValues={deviceClaimDetails}
                  formErrors={formErrors}
                  handleChange={handleDeviceClaimDetails}
                  tailwindClass="grid grid-col-2 gap-4"
                />
                {deviceClaimDetails.claimType === incidentType &&
                  claimDeviceInputs.map((input: IInput, index: number) => (
                    <InputField
                      key={"claim" + index}
                      input={input}
                      formValues={deviceClaimDetails}
                      handleChange={handleDeviceClaimDetails}
                    />
                  ))}
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
                  setDeviceModel(!deviceModel);
                  refetch();
                }}
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default DeviceClaimBlock;
