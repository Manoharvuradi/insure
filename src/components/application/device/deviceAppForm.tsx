import React, { useEffect, useState } from "react";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import FormComponent from "~/common/form";
import Loader from "~/common/loader";
import { IEvent } from "~/interfaces/common/form";
import { IDeviceStepComponentProps } from "~/interfaces/policy";
import { api } from "~/utils/api";
import { applicationStatus } from "~/utils/constants";
import {
  deviceAppInputs,
  deviceInsuraceInputs,
} from "~/utils/constants/application";
import DeviceAppReviewForm from "./deviceAppReviewForm";
import { toast } from "react-toastify";

const DeviceAppForm = ({
  index,
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  onClickStep,
}: IDeviceStepComponentProps) => {
  const [step, setStep] = useState(1);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const applicationCreate = api.application.create.useMutation();

  const { isLoading, data, error } = api.deviceCatalog.list.useQuery({
    filter: "true",
  });
  const optns = data?.data?.formValues?.deviceType
    ? Object.keys(data?.data?.formValues?.deviceType)
    : [];
  const deviceType = formValues.deviceType;
  const brands = data?.data ? Object?.keys(data?.data?.[deviceType]) : [];

  const [inputs, setInputs] = useState(deviceInsuraceInputs);

  const updateOptions = (
    inputName: string,
    newOptions: { label: string; value: string }[]
  ) => {
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

    updateOptions("deviceModelColor", [{ label: "Select", value: "" }]);
    const updatedData = modelName;
    updatedData.list = modelNameList;
    delete formValues?.applicationData?.deviceModel;
    setModelName({ ...modelName, selected: "" });
    delete formValues?.applicationData?.deviceModelColor;
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

    delete formValues?.applicationData?.deviceModelColor;

    setColors({ ...colors, list: [t], selected: "" });
  }, [modelName.selected]);

  const handleDeviceDetailsChange = (e: IEvent) => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      applicationData: {
        ...formValues.applicationData,
        [name]: value,
      },
    });

    if (e.target.name == "deviceBrand") {
      setBrand({ ...brand, selected: e.target.value });
      // setModelName({ ...modelName, selected: "" });
    }

    if (e.target.name == "deviceModel") {
      setModelName({ ...modelName, selected: e.target.value });
      // setColors({ ...colors, selected: "" })
    }

    if (e.target.name == "deviceModelColor") {
      setColors({ ...colors, selected: e.target.value });
    }
  };

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

    setFormValues({ ...formCopy });
    setStep(2);
  };

  const handleBack = () => {
    if (step == 1 && onClickStep) {
      onClickStep(index - 1);
    } else {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const request: any = {
      billingFrequency: formValues.billingFrequency,
      billingDay: parseInt(formValues.billingDay),

      status: applicationStatus[0],
      startDate: new Date(formValues.startDate),
      sumAssured: formValues.sumAssured,
      basePremium: formValues.monthlyPremium,
      policyholderId: formValues.policyholder.id,
      applicationData: {
        ...formValues.applicationData,
      },
      beneficiaries: formValues.beneficiaries,
      packageName: formValues.package,
      autoRenewal: true,
    };
    try {
      const applicationResponse = await applicationCreate.mutateAsync({
        ...request,
      });
      if (applicationResponse) {
        setLoading(false);
        if (onClickStep) {
          onClickStep(index + 1);
        }
        const { applicationData, ...rest } = formValues;
        setFormValues({ ...rest, application: applicationResponse });
      } else {
        toast.error("Failed to fetch data");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Failed to fetch data, please try again later");
      setLoading(false);
    } finally {
      setLoading(false);
    }
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
                formValues={formValues.applicationData}
                formErrors={formErrors}
                handleChange={handleDeviceDetailsChange}
                tailwindClass="grid grid-cols-2 gap-4"
              />
            </div>
            <div className="mt-6 flex justify-between">
              <SecondaryButton text="Back" onClick={handleBack} />
              <Button text="Next" type={"submit"} disabled={disabled} />
            </div>
          </form>
        )}
        {step == 2 && (
          <div className="w-full">
            <DeviceAppReviewForm formValues={formValues} />
            <div className="mt-6 flex justify-between">
              <SecondaryButton text="Back" onClick={handleBack} />
              <Button text="Create Application" onClick={handleSubmit} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeviceAppForm;
