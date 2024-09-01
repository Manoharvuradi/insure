import React, { useEffect, useState } from "react";
import { IStepComponentProps } from "~/interfaces/policy";
import InputField from "~/common/form/input";
import { IEvent } from "~/interfaces/common/form";
import { citizenshipIdInput } from "~/utils/constants/policyholder";
import PolicyholderDetails from "./policyholderForm";
import SecondaryButton from "~/common/buttons/secondaryButton";
import Button from "~/common/buttons/filledButton";
import {
  dateSAIDvalidation,
  validateSAIDNum,
  validateSAIDNumber,
} from "~/utils/helpers/validations";
import { checkRequiredFields } from "~/utils/helpers/errors";
import { calculateAge } from "~/utils/helpers";
import { packageNames } from "~/utils/constants";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { packageNameValues } from "~/utils/constants/user";
import { PolicyStatusValues } from "~/utils/constants/policy";
import { ApplicationStatusValues } from "~/utils/constants/application";

const PolicyholderForm = ({
  formValues,
  formErrors,
  index,
  onClickStep,
  setFormValues,
  setFormErrors,
  contactData,
}: IStepComponentProps) => {
  const [step, setStep] = useState(1);

  const [disabled, setDisabled] = useState(false);
  const [flag, setFlag] = useState(false);
  const {
    data,
    isLoading,
    error,
    refetch = () => {},
  } = api.policyholder.citizenshipId.useQuery(
    formValues?.policyholder?.citizenshipId as string,
    {
      enabled: flag,
    }
  );

  const handlePolicyholderChange = (e: IEvent) => {
    const { name, value } = e.target;
    const form: any = { ...formValues };

    let ageValiate;
    let dateOfBirth;
    if (name === "citizenshipId") {
      const result = validateSAIDNum(value);
      if (!result) {
        setFormErrors({
          ...formErrors,
          policyholder: {
            ...formErrors.policyholder,
            [name]: "Invalid SA-ID",
          },
        });
      } else {
        setFormErrors({
          ...formErrors,
          policyholder: {
            ...formErrors.policyholder,
            [name]: "",
          },
        });
      }
      if (form.package === packageNames.funeral && result) {
        setFormValues({
          ...formValues,
          withFreeBenefit: true,
        });
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        form.mainMember.dateOfBirth = dateOfBirth;
        ageValiate =
          form.mainMember.dateOfBirth === ""
            ? ""
            : calculateAge(form.mainMember.dateOfBirth);
        if (ageValiate !== form.mainMember.age) {
          setFormErrors({
            ...formErrors,
            policyholder: {
              ...formErrors.policyholder,
              [name]: "Age did not match with quote / invalid said",
            },
          });
        } else {
          setFormErrors({
            ...formErrors,
            policyholder: { ...formErrors.policyholder, [name]: "" },
          });
        }
      }
    }
    setFormValues({
      ...formValues,
      policyholder: { ...formValues.policyholder, [name]: value },
    });
  };
  const handleBack = () => {
    if (step == 1 && onClickStep) {
      onClickStep(index - 1);
    }
    setFormErrors({ ...formErrors, policyholder: {} });

    if (formValues?.withFreeBenefit) {
      setFormValues({
        ...formValues,
        policyholder: {},
      });
    }
  };

  const handlePolicyHolderBack = () => {
    if (step === 2) {
      setStep(step - 1);
      setFormValues({
        ...formValues,
        policyholder: { citizenshipId: formValues.policyholder.citizenshipId },
      });
    }
  };

  const getPolicyholderNext = async (e: any) => {
    e.preventDefault();
    setFlag(true);
    const apiData: any = await refetch();
    if (apiData.data && formValues.package === packageNames.funeral) {
      const { policies = [], applications = [] } = apiData.data; // Destructuring with default empty arrays

      // Check for existing funeral policy or application directly without intermediate variables if not used elsewhere
      const hasExistingFuneralPolicyOrApplication =
        policies.some(
          (item: { packageName: string; status: string }) =>
            item.packageName === packageNames.funeral &&
            (item.status === PolicyStatusValues.active ||
              item.status === PolicyStatusValues.cancelled)
        ) ||
        applications.some(
          (item: { packageName: string; status: string }) =>
            item.packageName === packageNames.funeral &&
            (item.status === ApplicationStatusValues.pending ||
              item.status === ApplicationStatusValues.approved)
        );

      if (hasExistingFuneralPolicyOrApplication && formValues.withFreeBenefit) {
        toast.info(
          "You already have an active policy. Please go back and hit the quote again"
        );

        if (index && onClickStep) {
          onClickStep(index - 1);
          setFormValues({
            ...formValues,
            withFreeBenefit: false,
            coverageOption:
              formValues.coverageOption === "TELKOM_FREE_BENEFIT"
                ? "A"
                : formValues.coverageOption,
          });
        }
      }
    } else {
      // This else block ensures withFreeBenefit is set to true only when the main condition doesn't meet
      // Moved setFlag(false) outside as it's common to both the if and else blocks
      setFormValues({
        ...formValues,
        ...(contactData?.firstName &&
          contactData?.lastName && {
            policyholder: {
              ...formValues.policyholder,
              firstName: contactData?.firstName,
              lastName: contactData?.lastName,
              phone: contactData?.phone
                ? `+27${
                    contactData?.phone
                      ? contactData?.phone.substring(
                          1,
                          contactData?.phone.length
                        )
                      : ""
                  }`
                : "",
            },
          }),
        withFreeBenefit: true,
      });
    }
    // Common actions outside the conditions to avoid duplication
    setStep(2);
  };

  useEffect(() => {
    setDisabled(!checkRequiredFields(formErrors));
  }, [formErrors]);
  return (
    <div>
      <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
        Policyholder
      </h1>
      {step == 1 && (
        <form className="w-[40vw] bg-white" onSubmit={getPolicyholderNext}>
          <div>
            <InputField
              input={citizenshipIdInput}
              handleChange={handlePolicyholderChange}
              formValues={formValues.policyholder}
              formErrors={formErrors.policyholder}
              disabled={
                formValues?.package === packageNames.funeral &&
                !formValues?.withFreeBenefit
                  ? true
                  : false
              }
              tailwindClass="mb-[-2px]"
            />
            <p className="tetx-sm text-yellow-600">
              Look up for a policyholder
            </p>
          </div>
          <div className="mt-5 flex justify-between">
            <SecondaryButton onClick={handleBack} text="Back" />
            <Button type="submit" text="Next" disabled={disabled} />
          </div>
        </form>
      )}
      {step == 2 && (
        <div>
          <PolicyholderDetails
            setFormValues={setFormValues}
            formValues={formValues}
            formErrors={formErrors}
            handleBack={handlePolicyHolderBack}
            stepChange={onClickStep}
            index={index}
          />
        </div>
      )}
    </div>
  );
};

export default PolicyholderForm;
