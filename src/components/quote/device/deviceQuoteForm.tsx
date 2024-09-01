import React, { useState } from "react";
import FormComponent from "~/common/form";
import SecondaryButton from "~/common/buttons/secondaryButton";
import Button from "~/common/buttons/filledButton";
import { IDeviceStepComponentProps } from "~/interfaces/policy";
import { IEvent, IInput } from "~/interfaces/common/form";
import {
  deviceInputs,
  deviceMaxPrice,
  startDateBillingFrequency,
} from "~/utils/constants/policy";
import DeviceQuoteReview from "./deviceQuoteReview";
import { api } from "~/utils/api";
import { ToastContainer, toast } from "react-toastify";
import Loader from "~/common/loader";
import InputField from "~/common/form/input";
import { premiumFrequency } from "~/utils/constants";
import { useRouter } from "next/router";

function DeviceQuoteForm({
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  onClickStep,
  index,
  handleFormInputChange,
}: IDeviceStepComponentProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { isLoading, data, error } = api.deviceCatalog.list.useQuery({
    filter: "true",
  });

  const router = useRouter();
  const category = router.pathname.split("/")[1];
  const optns = data?.data ? Object.keys(data?.data) : [];

  const additionalOptions = [
    { label: "Select", value: "" },
    ...(optns?.map((data: any) => ({
      label: data,
      value: data,
    })) || []),
  ];

  deviceInputs[0].options = [...additionalOptions];

  const deviceQuote: any = api.deviceQuotation.create.useMutation();

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const request = {
      startDate: formValues.startDate,
      billingDay: formValues.billingDay,
      policyData: {
        packageName:
          (formValues.package as any) ?? ("EMPLOYEE_DEVICE_INSURANCE" as any),
        deviceType: formValues.deviceType,
        isRecentPurchase: formValues.isRecentPurchase ?? false,
        devicePrice: Number(formValues.devicePrice),
      },
      billingFrequency: premiumFrequency[0],
    };
    try {
      const deviceQuoteResponse = await deviceQuote.mutateAsync(request);
      if (deviceQuoteResponse) {
        const formCopy = {
          package: formValues.package ?? "EMPLOYEE_DEVICE_INSURANCE",
          paymentMethod: formValues.paymentMethod,
          beneficiaries: formValues.beneficiaries,
          billingDay: formValues.billingDay,
          startDate: formValues.startDate,
          applicationData: {
            ...(deviceQuoteResponse.policyData as { deviceData: object })
              .deviceData,
          },
          sumAssured: deviceQuoteResponse?.policyData?.deviceData?.devicePrice,
          monthlyPremium:
            deviceQuoteResponse?.policyData?.deviceData?.premiumAmount,
          billingFrequency: deviceQuoteResponse.billingFrequency,
          devicePrice: formValues.devicePrice,
          deviceType: formValues.deviceType,
          isRecentPurchase: formValues.isRecentPurchase,
        };
        setFormValues({ ...formCopy });
        setLoading(false);
        setStep(2);
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      if (error.data.httpStatus === 500) {
        toast.error("Failed to get Quote");
      } else {
        toast.error("Failed to fetch");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    setStep(1);
  };

  const handleNext = () => {
    if (onClickStep) {
      onClickStep(index + 1);
    }
  };

  const handleStartDate = (e: IEvent) => {
    const { name, value } = e.target;
    let val = new Date(value);
    let current = new Date();
    setFormValues({
      ...formValues,
      [name]: value,
    });
    if (val < current) {
      setFormErrors({
        ...formErrors,
        [name]: "Please select a valid date",
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleDeviceChange = (e: IEvent) => {
    const { name, value, checked } = e.target;

    if (name === "devicePrice") {
      setFormValues({
        ...formValues,
        [name]: value,
      });
      if (value <= deviceMaxPrice && value > 0) {
        setFormErrors({
          ...formErrors,
          [name]: "",
        });
        setDisabled(false);
      } else if (value > deviceMaxPrice) {
        setFormErrors({
          ...formErrors,
          [name]: "Please enter less than 60000",
        });
        setDisabled(true);
      } else if (value <= 0) {
        setFormErrors({
          ...formErrors,
          [name]: "Please enter greater than 0",
        });
        setDisabled(true);
      }
    } else {
      setFormValues({
        ...formValues,
        [name]: name === "isRecentPurchase" ? checked : value,
      });
    }
  };

  const handleGetQuoteBack = () => {
    router.push("/quickQuote");
  };

  return (
    <div>
      <div>
        {(loading || isLoading) && (
          <>
            {" "}
            <Loader /> <ToastContainer />{" "}
          </>
        )}
        {step == 1 && (
          <form
            onSubmit={handleSubmitForm}
            className={`${
              category !== "policy"
                ? "mx-auto w-[80%]"
                : "mx-auto w-full bg-white"
            }`}
          >
            <h1 className="pb-2 text-2xl font-bold leading-7 text-gray-900">
              Quote
            </h1>
            <div className="grid w-full grid-cols-2 gap-4">
              {startDateBillingFrequency.map((input: IInput, index: number) => {
                return (
                  <InputField
                    key={index + "mainMemberQuote"}
                    handleChange={
                      input.name == "startDate"
                        ? handleStartDate
                        : handleFormInputChange
                    }
                    input={input}
                    formValues={formValues}
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                  />
                );
              })}
            </div>

            <div className="">
              <FormComponent
                inputs={deviceInputs}
                formValues={formValues}
                formErrors={formErrors}
                handleChange={handleDeviceChange}
                tailwindClass="grid w-full grid-cols-2 gap-4"
              />
            </div>

            <div className="float-right mt-6">
              <Button text="Confirm" type="submit" disabled={disabled} />
            </div>
          </form>
        )}
      </div>
      {step == 2 && (
        <div
          className={`${
            category !== "policy" ? "mx-auto w-[80%]" : "w-[60vw]"
          }`}
        >
          <DeviceQuoteReview
            formValues={formValues}
            setFormValues={setFormValues}
          />
          <div className="mt-6 flex justify-end">
            <div className="mr-10">
              <SecondaryButton text="Back" onClick={handleBack} />
            </div>
            {category === "policy" ? (
              <Button text="Confirm" onClick={handleNext} />
            ) : (
              <Button text="Confirm" onClick={handleGetQuoteBack} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceQuoteForm;
