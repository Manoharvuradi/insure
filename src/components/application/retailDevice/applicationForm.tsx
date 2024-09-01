import React, { useState, useEffect } from "react";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import FormComponent from "~/common/form";
import Loader from "~/common/loader";
import { IEvent } from "~/interfaces/common/form";
import {
  ICreditLifeBenficiary,
  IRetailDeviceStepComponentProps,
} from "~/interfaces/policy";
import { api } from "~/utils/api";
import { deviceAppInputs } from "~/utils/constants/application";
import RetailDeviceAppReviewForm from "./applicationReviewForm";
import { toast } from "react-toastify";
import { AiOutlineDelete } from "react-icons/ai";
import { IBeneficiary } from "@prisma/client";
import AddButton from "~/common/buttons/addButton";
import { policyBeneficiaryInputs } from "~/utils/constants/policy";
import {
  dateOfBirthValidation,
  dateSAIDvalidation,
  validateEmail,
  validatePhoneNum,
  validateSAIDNum,
} from "~/utils/helpers/validations";
import InputField from "~/common/form/input";

function RetailDeviceAppForm({
  index,
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  onClickStep,
  contactData,
}: IRetailDeviceStepComponentProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const retailApplication = api.lead.create.useMutation();
  const { isLoading, data, error } = api.deviceCatalog.list.useQuery({
    filter: "true",
  });
  const [disabled, setDisabled] = useState(false);

  const deviceType = formValues.applicationData?.deviceData?.deviceType;
  const [inputs, setInputs] = useState(deviceAppInputs);
  const brands =
    formValues.applicationData?.deviceData?.deviceType === "other"
      ? [`${contactData.model}`]
      : data?.data
      ? Object?.keys(data?.data?.[deviceType])
      : [];

  const updateOptions = (
    inputName: string,
    newOptions: { label: string; value: string }[]
  ) => {
    if (formValues.applicationData?.deviceData?.deviceType === "other") {
      setInputs((prevInputs) =>
        prevInputs.map((input) => ({
          ...input,
          type:
            formValues.applicationData?.deviceData?.deviceType === "other"
              ? "text"
              : "select",
          disabled: input.name === "deviceDetails" ? true : false,
        }))
      );
    } else {
      setInputs((prevInputs) =>
        prevInputs.map((input) => {
          if (input.name === inputName) {
            const updatedOptions = newOptions?.map((option) => ({
              label: option?.label,
              value: option?.value,
            }));

            return { ...input, options: updatedOptions };
          }
          return input;
        })
      );
    }
  };
  const [brand, setBrand] = useState({
    list: [brands] as any,
    selected: "",
  });

  const [modelName, setModelName] = useState({
    list: [] as any,
    selected: "",
  });

  const [colors, setColors] = useState({
    list: [] as any,
    selected: "",
  });

  useEffect(() => {
    setBrand({ ...brand, list: [brands] });

    updateOptions("deviceBrand", [
      { label: "Select", value: "" },
      ...(brands?.map((data: any) => ({
        label: data,
        value: data,
      })) || []),
    ]);
  }, []);

  useEffect(() => {
    const modelNameList = data?.data?.[deviceType]?.[brand.selected]?.map(
      (item: any) => item.modelName
    );
    updateOptions("deviceModel", [
      { label: "Select", value: "" },
      ...(modelNameList?.map((data: any) => ({
        label: data,
        value: data,
      })) || []),
    ]);

    const updatedData = modelName;
    updatedData.list = modelNameList;
    delete formValues?.applicationData?.deviceData.deviceModel;
    setModelName({ ...modelName, selected: "" });
    delete formValues?.applicationData?.deviceData.deviceModelColor;
    setColors({ ...colors, selected: "" });
  }, [brand.selected]);

  useEffect(() => {
    const colors = (
      (data?.data[deviceType]?.[brand.selected] as {
        modelName: string;
        colour: string;
      }[]) || []
    )
      .filter((model) => model.modelName === modelName.selected)
      .map((model) => model.colour);

    const t = colors?.flatMap((colorString: any) => colorString?.split(","));

    updateOptions("deviceModelColor", [
      { label: "Select", value: "" },
      ...(t?.map((data: any) => ({
        label: data,
        value: data,
      })) || []),
    ]);

    delete formValues?.applicationData?.deviceData.deviceModelColor;

    setColors({ ...colors, list: [t], selected: "" });
  }, [modelName.selected]);

  const handleSubmitForm = async (event: any) => {
    event.preventDefault();
    const beneficiary = {
      firstName: formValues.policyholder.firstName as string,
      lastName: formValues.policyholder.lastName as string,
      email: formValues.policyholder.email,
      phone: formValues.policyholder.phone?.replace(/[\s-]/g, ""),
      gender: formValues.policyholder.gender,
      relation: "MAIN_MEMBER",
      percentage: parseInt("100"),
      dateOfBirth: new Date(formValues.policyholder.dateOfBirth as Date),
      identification: {
        country: formValues.policyholder.country,
        said: formValues.policyholder.citizenshipId,
      },
    };

    let formCopy: any = {
      ...formValues,
    };
    formCopy.beneficiaries[0] = beneficiary;
    if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
      let totalPercentage: number = 0;
      formValues.creditLifeBeneficiaries.map(
        (beneficiary: ICreditLifeBenficiary, index: number) => {
          totalPercentage += Number(beneficiary.percentage);
        }
      );
      if (totalPercentage === 100) {
        setStep(2);
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
    } else {
      setStep(2);
    }

    setFormValues({ ...formCopy });
  };

  const handleDeviceDetailsChange = (e: IEvent) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      applicationData: {
        ...formValues.applicationData,
        deviceData: {
          ...formValues.applicationData.deviceData,
          [name]: value,
        },
      },
    });
    if (e.target.name == "deviceBrand") {
      setBrand({ ...brand, selected: e.target.value });
    }

    if (e.target.name == "deviceModel") {
      setModelName({ ...modelName, selected: e.target.value });
    }

    if (e.target.name == "deviceModelColor") {
      setColors({ ...colors, selected: e.target.value });
    }
  };

  const handleBack = () => {
    if (step == 1 && onClickStep) {
      onClickStep(index - 1);
    } else {
      setStep(1);
    }

    if (
      formValues &&
      formValues.applicationData &&
      formValues.applicationData.deviceData
    ) {
      const { deviceData } = formValues.applicationData;
      if (deviceData) {
        if (deviceData.deviceUniqueNumber) {
          deviceData.deviceUniqueNumber = contactData?.imei
            ? contactData?.imei
            : "";
          deviceData.deviceDetails = contactData?.model
            ? contactData?.model
            : "";
        }
        if (deviceData.deviceBrand) {
          deviceData.deviceBrand = "";
        }
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    let deviceCreditLife: any;
    const deviceRequest: any = {
      billingFrequency: formValues.billingFrequency,
      billingDay: parseInt(formValues.billingDay),
      status: "DRAFT",
      startDate: new Date(formValues.startDate),
      sumAssured: formValues.applicationData.deviceData.sumAssured,
      basePremium: Number(formValues.applicationData.deviceData.totalPremium),
      policyholderId: formValues.policyholder.id,
      leadType: "APPLICATION",
      applicationData: {
        packageName: formValues.applicationData.deviceData.packageName,
        deviceType: formValues.applicationData.deviceData.deviceType,
        isRecentPurchase:
          formValues.applicationData.deviceData.isRecentPurchase,
        devicePrice: formValues.applicationData.deviceData.devicePrice,
        deviceUniqueNumber:
          formValues.applicationData.deviceData.deviceUniqueNumber,
        deviceBrand: formValues.applicationData.deviceData.deviceBrand,
        deviceModel: formValues.applicationData.deviceData.deviceModel,
        deviceStorage: formValues.applicationData.deviceData.deviceStorage,
        deviceModelColor:
          formValues.applicationData.deviceData.deviceModelColor,
        contactId: contactData.id,
      },
      beneficiaries: formValues.beneficiaries,
      packageName: formValues.applicationData.deviceData.packageName,
      autoRenewal: true,
    };
    if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
      deviceCreditLife = {
        billingFrequency: formValues.billingFrequency,
        billingDay: parseInt(formValues.billingDay),
        status: "DRAFT",
        startDate: new Date(formValues.startDate),
        sumAssured: formValues.applicationData.creditLifeData.sumAssured,
        basePremium: Number(
          formValues.applicationData.creditLifeData.totalPremium
        ),
        policyholderId: formValues.policyholder.id,
        leadType: "APPLICATION",
        applicationData: {
          packageName: formValues.applicationData.creditLifeData.packageName,
          deviceCreditLife: {
            additionalPercentageInsured:
              formValues.applicationData.creditLifeData
                .additionalPercentageInsured,
            deviceFinancedBy:
              formValues.applicationData.creditLifeData.deviceFinancedBy,
            deviceUniqueNumber:
              formValues.applicationData.deviceData.deviceUniqueNumber,
            outstandingSettlementBalance:
              formValues.applicationData.creditLifeData
                .outstandingSettlementBalance,
          },
        },
        beneficiaries: formValues.creditLifeBeneficiaries.map((beneficiary) => {
          return {
            firstName: beneficiary.firstName,
            lastName: beneficiary.lastName,
            email: beneficiary.email,
            phone: beneficiary.phone?.replace(/[\s-]/g, ""),
            gender: beneficiary.gender,
            relation: beneficiary.relation ?? "MAIN_MEMBER",
            percentage: parseInt(beneficiary.percentage),
            ...(beneficiary.dateOfBirth && {
              dateOfBirth: new Date(beneficiary.dateOfBirth),
            }),
            identification: {
              ...(beneficiary.identificationCountry && {
                country: beneficiary.identificationCountry,
              }),
              ...(beneficiary.said && { said: beneficiary.said }),
              ...(beneficiary.passportNumber && {
                passportNumber: beneficiary.passportNumber,
              }),
              ...(beneficiary.trustNumber && {
                trustNumber: beneficiary.trustNumber,
              }),
            },
          };
        }),
        packageName: formValues.applicationData.creditLifeData.packageName,
        autoRenewal: true,
      };
    }
    let formCopy = {
      ...formValues,
    };
    try {
      let creditLifeResponse;
      const deviceResponse = await retailApplication.mutateAsync({
        ...deviceRequest,
      });
      if (deviceResponse) {
        toast.success("Successfully created device prospect");
        formCopy.deviceApplicationId = deviceResponse.id;
        if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
          creditLifeResponse = await retailApplication.mutateAsync({
            ...deviceCreditLife,
          });
        }
      } else {
        toast.error("Failed to create device prospect");
      }
      if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
        if (creditLifeResponse) {
          formCopy.creditLifeApplicationId = creditLifeResponse.id;
          toast.success("Successfully created credit life prospect");
        } else {
          toast.error("Failed to create credit life prospect");
        }
      }
      if (onClickStep) {
        onClickStep(index + 1);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Failed to create application");
    } finally {
      setFormValues({
        ...formCopy,
      });
      setLoading(false);
    }
  };

  const deleteBeneficiary = (index: number) => {
    const form = { ...formValues };
    const errors = { ...formErrors };
    form.creditLifeBeneficiaries.splice(index, 1);
    setFormValues({ ...form });
    delete errors.creditLifeBeneficiaries[index];
    setFormErrors({ ...errors });
  };

  const handleBeneficiaryInputChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = { ...formValues };
    const errors: any = { ...formErrors };
    form.creditLifeBeneficiaries[index][name] = value;

    if (name === "email") {
      let result = validateEmail(value);
      if (!result && value !== "") {
        errors.creditLifeBeneficiaries = {
          ...errors.creditLifeBeneficiaries,
          [index]: {
            ...errors.creditLifeBeneficiaries[index],
            [name]: "Please enter a valid email",
          },
        };
      } else {
        errors.creditLifeBeneficiaries = {
          ...errors.creditLifeBeneficiaries,
          [index]: {
            ...errors.creditLifeBeneficiaries[index],
            [name]: "",
          },
        };
      }
    } else if (name === "dateOfBirth") {
      const result = dateOfBirthValidation(value);
      if (!result) {
        errors.creditLifeBeneficiaries = {
          ...errors.creditLifeBeneficiaries,
          [index]: {
            ...errors.creditLifeBeneficiaries[index],
            [name]: "Please select a valid date",
          },
        };
      } else {
        errors.creditLifeBeneficiaries = {
          ...errors.creditLifeBeneficiaries,
          [index]: {
            ...errors.creditLifeBeneficiaries[index],
            [name]: "",
          },
        };
      }
    }

    let dateOfBirth;
    if (name === "said") {
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        errors[index] = {
          ...errors[index],
          [name]: "",
        };
      } else {
        dateOfBirth = "";
        errors[index] = {
          ...errors[index],
          [name]: "Invalid SA-ID",
        };
      }
      form.creditLifeBeneficiaries[index].dateOfBirth = dateOfBirth;
    }
    if (name === "identificationNumber") {
      const result = validateSAIDNum(value);
      errors.creditLifeBeneficiaries = {
        ...errors.creditLifeBeneficiaries,
        [index]: {
          ...errors.creditLifeBeneficiaries[index],
          identificationNumber: result ? "" : "Please enter a valid SA-ID",
        },
      };
    }

    setFormErrors({ ...errors });
    setFormValues({ ...form });
  };

  const addBeneficiary = () => {
    setFormValues({
      ...formValues,
      creditLifeBeneficiaries: [...formValues.creditLifeBeneficiaries, {}],
    });
  };

  const handleBeneficiaryPhoneChange = (
    name: string,
    value: any,
    index: number = 0
  ) => {
    const form: any = { ...formValues };
    const errors: any = { ...formErrors };
    form.creditLifeBeneficiaries[index][name] = value;

    if (name === "phone") {
      let result = validatePhoneNum(value);
      if (!result && value !== "") {
        errors.creditLifeBeneficiaries = {
          ...errors.creditLifeBeneficiaries,
          [index]: {
            ...errors.creditLifeBeneficiaries[index],
            [name]: "Please enter a valid phone number",
          },
        };
      } else {
        errors.creditLifeBeneficiaries = {
          ...errors.creditLifeBeneficiaries,
          [index]: {
            ...errors.creditLifeBeneficiaries[index],
            [name]: "",
          },
        };
      }
    }

    setFormErrors({ ...errors });
    setFormValues({ ...form });
  };

  const handleCheckbox = (e: IEvent) => {
    const { name, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: checked,
    });
  };

  return (
    <>
      <div className="w-[60vw] bg-white">
        {loading && <Loader />}
        {step == 1 && (
          <form onSubmit={handleSubmitForm}>
            <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
              Application
            </h1>
            <div className="rounded border border-primary-600 p-2">
              <FormComponent
                inputs={inputs}
                formValues={formValues.applicationData?.deviceData}
                formErrors={formErrors}
                handleChange={handleDeviceDetailsChange}
                tailwindClass="grid grid-cols-2 gap-4"
              />
            </div>
            {formValues.creditLifeOpt && (
              <div className="mt-3">
                <InputField
                  handleChange={handleCheckbox}
                  input={{
                    label: "Click to confirm credit life",
                    type: "checkbox",
                    name: "confirmCreditLife",
                    required: false,
                  }}
                  formValues={formValues}
                  formErrors={formErrors}
                />
              </div>
            )}
            {formValues.creditLifeOpt && formValues.confirmCreditLife && (
              <div className="mt-4 w-full">
                <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                  Beneficiaries
                </h2>
                <div className="rounded border border-primary-600 p-2">
                  {formValues.creditLifeBeneficiaries?.map(
                    (beneficiary, index) => {
                      return (
                        <div className="w-full p-2" key={"extend" + index}>
                          <h2 className="flex justify-between text-base font-semibold leading-7 text-gray-900">
                            <span>Beneficiary {index + 1} </span>
                            {!(
                              formValues.creditLifeBeneficiaries.length == 1
                            ) && (
                              <span className="cursor-pointer">
                                <AiOutlineDelete
                                  color="red"
                                  onClick={() => {
                                    deleteBeneficiary(index);
                                  }}
                                />
                              </span>
                            )}
                          </h2>
                          <div className="rounded">
                            <FormComponent
                              inputs={policyBeneficiaryInputs}
                              formValues={beneficiary}
                              handleChange={handleBeneficiaryInputChange}
                              handlePhoneChange={handleBeneficiaryPhoneChange}
                              tailwindClass="grid grid-cols-2 gap-4"
                              index={index}
                              formErrors={
                                formErrors?.creditLifeBeneficiaries[
                                  index
                                ] as ICreditLifeBenficiary
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                  <div className="flex w-full justify-around">
                    <AddButton
                      name={"Add beneficiary"}
                      handleClick={() => addBeneficiary()}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <SecondaryButton text="Back" onClick={handleBack} />
              <Button text="Next" type={"submit"} disabled={disabled} />
            </div>
          </form>
        )}
        {step == 2 && (
          <div className="w-full">
            <RetailDeviceAppReviewForm formValues={formValues} />
            <div className="mt-6 flex justify-between">
              <SecondaryButton text="Back" onClick={handleBack} />
              <Button text="Create Prospect" onClick={handleSubmit} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RetailDeviceAppForm;
