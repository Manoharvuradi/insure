import React, { useEffect, useState } from "react";
import FormComponent from "~/common/form";
import {
  addressInputs,
  employeeIds,
  phoneOtherInputs,
  policyholderMemberInputs,
} from "~/utils/constants/policyholder";
import { IFormValues } from "~/interfaces/policy";
import InputField from "~/common/form/input";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import Loader from "~/common/loader";
import { dateConversion } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import {
  dateSAIDvalidation,
  validateEmail,
  validatePhoneNum,
} from "~/utils/helpers/validations";
import { checkRequiredFields } from "~/utils/helpers/errors";
import { dateOfBirthValidation } from "~/utils/helpers/validations";
interface IPolicyholderProps {
  formValues: IFormValues;
  formErrors: IFormValues;
  setFormValues: (value: any) => void;
  stepChange: any;
  handleBack: () => void;
  index: number;
}
const PolicyholderDetails = ({
  formValues,
  formErrors,
  setFormValues,
  handleBack,
  stepChange,
  index,
}: IPolicyholderProps) => {
  const policyholderCreate = api.policyholder.create.useMutation();
  const policyHolderUpdate = api.policyholder.update.useMutation();
  const { data, isLoading, error } = api.policyholder.citizenshipId.useQuery(
    formValues?.policyholder?.citizenshipId as string
  );

  const [load, setLoad] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errors, setErrors] = useState<any>({ formErrors });
  const handlePhoneNumber = (name: string, value: string) => {
    setDisabled(!validatePhoneNum(value));
    setFormValues({
      ...formValues,
      policyholder: { ...formValues.policyholder, [name]: value },
    });
  };

  const handlePolicyholderChange = (e: IEvent) => {
    const { name, value } = e.target;

    if (name === "email") {
      let result = validateEmail(value);
      setFormValues({
        ...formValues,
        policyholder: { ...formValues.policyholder, [name]: value },
      });
      if (!result && value != "") {
        setErrors({
          ...errors,
          policyholder: {
            ...errors.policyholder,
            [name]: "Please enter a valid mail-id",
          },
        });
      } else {
        setErrors({
          ...errors,
          policyholder: { ...errors.policyholder, [name]: "" },
        });
      }
    } else if (name === "dateOfBirth") {
      const result = dateOfBirthValidation(value);
      if (!result) {
        setErrors({
          ...errors,
          policyholder: {
            ...errors.policyholder,
            [name]: "Please enter valid DOB",
          },
        });
      } else {
        setErrors({
          ...errors,
          policyholder: { ...errors.policyholder, [name]: "" },
        });
      }
    }
    setFormValues({
      ...formValues,
      policyholder: { ...formValues.policyholder, [name]: value },
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoad(true);
    const req: any = {
      firstName: formValues.policyholder?.firstName,
      intial: formValues.policyholder?.middleName ?? "",
      lastName: formValues.policyholder?.lastName,
      email: formValues.policyholder?.email,
      phone: formValues.policyholder?.phone.replace(/[\s-]/g, ""),
      streetAddress1: formValues.policyholder?.streetAddress1 ?? "",
      streetAddress2: formValues.policyholder?.streetAddress2 ?? "",
      suburb: formValues.policyholder?.suburb ?? "",
      city: formValues.policyholder?.city,
      areaCode: formValues.policyholder?.areaCode,
      country: formValues.policyholder?.country,
      ...(formValues.policyholder?.salaryRefNumber && {
        salaryReferenceNo: formValues.policyholder?.salaryRefNumber,
      }),
      citizenshipId: formValues.policyholder?.citizenshipId,
      gender: formValues.policyholder?.gender,
      dateOfBirth: new Date(formValues.policyholder?.dateOfBirth as Date),
    };
    if (formValues.policyholder?.phoneOther) {
      req.phoneOther = formValues.policyholder?.phoneOther?.replace(
        /[\s-]/g,
        ""
      );
    }
    try {
      if (formValues.policyholderExist && data !== null) {
        const res = await policyHolderUpdate.mutateAsync({
          id: formValues.policyholder.id,
          body: req,
        });
        if (res) {
          setLoad(false);
          stepChange(index + 1);
        } else {
          setLoad(false);
          toast.error("Failed to fetch data.", {
            toastId: "fetchError",
            autoClose: 2000,
          });
        }
      } else {
        const res = await policyholderCreate.mutateAsync(req);
        if (res) {
          setFormValues({
            ...formValues,
            policyholder: { ...formValues.policyholder, id: res.id },
          });
          setLoad(false);
          stepChange(index + 1);
        } else {
          setLoad(false);
          toast.error("Failed to fetch data.", {
            toastId: "createError",
            autoClose: 2000,
          });
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (data) {
      setFormValues({
        ...formValues,
        policyholderExist: true,
        policyholder: {
          ...formValues.policyholder,
          id: data.id,
          citizenshipId: data.citizenshipId,
          firstName: data.firstName,
          middleName: data.initial,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          phoneOther: data.phoneOther,
          streetAddress1: data.streetAddress1,
          streetAddress2: data.streetAddress2,
          suburb: data.suburb,
          city: data.city,
          country: data.country,
          areaCode: data.areaCode,
          salaryRefNumber: data.salaryReferenceNo,
          dateOfBirth: dateConversion(data?.dateOfBirth) ?? "-",
          gender: data.gender,
        },
      });
    } else {
      const currentNumber = formValues?.policyholder?.citizenshipId;
      if (currentNumber) {
        const dob = dateSAIDvalidation(currentNumber);
        setFormValues({
          ...formValues,
          policyholder: { ...formValues.policyholder, dateOfBirth: dob },
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error]);

  useEffect(() => {
    setDisabled(!checkRequiredFields(errors));
  }, [errors]);

  return (
    <div>
      {(isLoading || load) && <Loader />}
      <form className="w-full bg-white pr-20" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {employeeIds.map((input, index) => {
            if (input.name == "citizenshipId") {
              return (
                <InputField
                  key={"employee" + index}
                  input={input}
                  handleChange={handlePolicyholderChange}
                  formValues={formValues.policyholder}
                  formErrors={formErrors.policyholder}
                  disabled={true}
                />
              );
            } else if (formValues?.category !== "lead")
              return (
                <InputField
                  key={"employee" + index}
                  input={input}
                  handleChange={handlePolicyholderChange}
                  formValues={formValues.policyholder}
                  formErrors={formErrors.policyholder}
                />
              );
          })}
        </div>
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Member details
          </h2>
          <FormComponent
            inputs={policyholderMemberInputs}
            formValues={formValues.policyholder}
            handleChange={handlePolicyholderChange}
            handlePhoneChange={handlePhoneNumber}
            tailwindClass="grid grid-cols-2 gap-4"
            formErrors={errors.policyholder}
          />
        </div>
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Address details
          </h2>
          <div className="rounded border border-primary-600 p-5">
            <FormComponent
              inputs={addressInputs}
              formValues={formValues.policyholder}
              handleChange={handlePolicyholderChange}
              tailwindClass="grid grid-cols-2 gap-4"
              formErrors={formErrors.policyholder}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <SecondaryButton text="Back" onClick={handleBack} />
          <Button text="Next" type={"submit"} disabled={disabled} />
        </div>
      </form>
    </div>
  );
};

export default PolicyholderDetails;
