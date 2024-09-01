import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import FormComponent from "~/common/form";
import Loader from "~/common/loader";
import { IEvent, IInput } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { premiumFrequency } from "~/utils/constants";
import {
  creditLifeOptCheckbox,
  creditLifeOptInputs,
  deviceInputs,
  deviceMaxPrice,
  retailDeviceInputs,
  startDateBillingFrequency,
} from "~/utils/constants/policy";
import RetailDeviceQuoteReview from "./quoteReview";
import InputField from "~/common/form/input";
import { IRetailDeviceStepComponentProps } from "~/interfaces/policy";
import { validatePhoneNum } from "~/utils/helpers/validations";
import { checkIsRecentPurchase, nonPortableDevices } from "~/utils/helpers";

interface IRetailCreditLifeDevice {
  creditLifeOpt: boolean;
  deviceUniqueNumber: string;
  outstandingSettlementBalance: string;
  deviceFinancedBy: string;
}

function RetailDeviceQuote({
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  onClickStep,
  index,
  handleFormInputChange,
  contactData,
}: IRetailDeviceStepComponentProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState({
    device: false,
    phone: false,
    outstandingBalance: false,
    startDate: false,
  });
  const [retailInputs, setRetailInputs] = useState(retailDeviceInputs);
  const { isLoading, data, error } = api.deviceCatalog.list.useQuery({
    filter: "true",
  });

  const [creditLifeValues, setCreditLifeValues] = useState({
    creditLifeOpt: false,
    deviceUniqueNumber: "",
    outstandingSettlementBalance: "",
    deviceFinancedBy: "",
  } as IRetailCreditLifeDevice);

  const [creditLifeErrors, setCreditLifeErrors] = useState({
    creditLifeOpt: false,
    deviceUniqueNumber: "",
    outstandingSettlementBalance: "",
    deviceFinancedBy: "",
  } as IRetailCreditLifeDevice);

  const optns = data?.data ? Object.keys(data?.data) : [];

  const additionalOptions = [
    { label: "Select", value: "" },
    ...(optns?.map((data: any) => ({
      label: data,
      value: data,
    })) || []),
  ];

  retailDeviceInputs[0].options = [
    ...additionalOptions,
    { label: "Other", value: "other" },
  ];

  const retailDeviceQuote: any = api.retailDeviceQuote.create.useMutation();

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();

    if (!formValues.isRecentPurchase) {
      toast.error("Insurance is provided for recent purchase device only");
      return;
    }
    if (
      contactData?.dateOfPurchase &&
      checkIsRecentPurchase(contactData?.dateOfPurchase, formValues.deviceType)
    ) {
      toast.error(
        "According to your date of purchase, insurance is not provided"
      );
      return;
    }
    setLoading(true);
    const request = {
      startDate: formValues.startDate,
      billingDay: formValues.billingDay,
      policyData: {
        packageName: (formValues.package as any) ?? ("DEVICE_INSURANCE" as any),
        deviceType: formValues.deviceType,
        isRecentPurchase: formValues.isRecentPurchase ?? false,
        devicePrice: Number(formValues.devicePrice),
        phone: formValues?.phone.replace(/[\s-]/g, "") ?? "",
        ...(creditLifeValues.creditLifeOpt && {
          creditLife: {
            packageName: "DEVICE_CREDITLIFE",
            deviceUniqueNumber: creditLifeValues.deviceUniqueNumber,
            deviceFinancedBy: creditLifeValues.deviceFinancedBy,
            additionalPercentageInsured: "100",
            outstandingSettlementBalance: Number(
              creditLifeValues.outstandingSettlementBalance
            ),
          },
        }),
      },
      billingFrequency: premiumFrequency[0],
      category: "lead",
    };

    try {
      const deviceQuoteResponse = await retailDeviceQuote.mutateAsync(request);
      if (deviceQuoteResponse) {
        const formCopy = {
          package: formValues.package ?? "DEVICE_INSURANCE",
          paymentMethod: formValues.paymentMethod,
          beneficiaries: formValues.beneficiaries,
          creditLifeBeneficiaries: formValues.creditLifeBeneficiaries ?? [{}],
          billingDay: formValues.billingDay,
          startDate: formValues.startDate,
          billingFrequency: premiumFrequency[0],
          creditLifeOpt: creditLifeValues.creditLifeOpt,
          category: "lead",
          applicationData: {
            deviceData: {
              ...(deviceQuoteResponse.policyData as { deviceData: object })
                .deviceData,
              ...(contactData?.imei && {
                deviceUniqueNumber: contactData?.imei,
                deviceDetails: contactData?.model,
              }),
            },
            totalPremium: deviceQuoteResponse.policyData.totalPremium,
            ...(creditLifeValues.creditLifeOpt && {
              creditLifeData: {
                ...(
                  deviceQuoteResponse.policyData as { creditLifeData: object }
                ).creditLifeData,
                deviceUniqueNumber:
                  deviceQuoteResponse.policyData.deviceUniqueNumber,
              },
            }),
          },
          phone: formValues.phone,
          deviceType: formValues.deviceType,
          devicePrice: formValues.devicePrice,
          isRecentPurchase: formValues.isRecentPurchase,
          ...(creditLifeValues.creditLifeOpt
            ? {
                sumAssured:
                  Number(
                    deviceQuoteResponse?.policyData?.deviceData?.devicePrice
                  ) +
                  Number(
                    deviceQuoteResponse?.policyData?.creditLifeData?.sumAssured
                  ),
              }
            : {
                sumAssured: Number(
                  deviceQuoteResponse?.policyData?.deviceData?.devicePrice
                ),
              }),
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
      setDisabled({ ...disabled, startDate: true });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
      setDisabled({ ...disabled, startDate: false });
    }
  };

  const handleInputBasedOnDeviceType = (str: any) => {
    setRetailInputs((prevState: any) =>
      prevState.map((input: any) => {
        if (input.name === "isRecentPurchase") {
          return {
            ...input,
            label: nonPortableDevices.includes(str)
              ? "Have the device been bought less than 365 days ago?"
              : "Have the device been bought less than 21 days ago?",
          };
        } else {
          return {
            ...input,
            label: input.label,
          };
        }
      })
    );
  };

  const handleDeviceChange = (e: IEvent) => {
    const { name, value, checked } = e.target;

    if (name === "devicePrice" && value.length > 0) {
      const isOnlyDigits = /^\d+$/.test(value);
      if (!isOnlyDigits) {
        setFormErrors({
          ...formErrors,
          devicePrice: "Invalid Input for Price",
        });
        setDisabled({ ...disabled, device: true });
      } else {
        setFormErrors({ ...formErrors, devicePrice: "" });
        setDisabled({
          ...disabled,
          device: false,
        });
      }
      setFormValues({
        ...formValues,
        [name]: value,
      });
      if (value <= deviceMaxPrice && value > 0) {
        setFormErrors({
          ...formErrors,
          [name]: "",
        });
        setDisabled({
          ...disabled,
          device: false,
        });
      } else if (value > deviceMaxPrice) {
        setFormErrors({
          ...formErrors,
          [name]: "Please enter less than 60000",
        });
        setDisabled({
          ...disabled,
          device: true,
        });
      } else if (value <= 0) {
        setFormErrors({
          ...formErrors,
          [name]: "Please enter greater than 0",
        });
        setDisabled({
          ...disabled,
          device: true,
        });
      }
    } else if (name === "deviceType") {
      handleInputBasedOnDeviceType(value);
      setFormValues({
        ...formValues,
        [name]: value,
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: name === "isRecentPurchase" ? checked : value,
      });
    }
  };
  const handlePhoneChange = (name: string, value: string) => {
    setDisabled({
      ...disabled,
      phone: !validatePhoneNum(value),
    });
    setFormValues({
      ...formValues,
      phone: value ? value : contactData?.phone,
    });
  };

  const handleCreditLifeChange = (e: IEvent) => {
    const { name, value, checked } = e.target;
    setCreditLifeValues({
      ...creditLifeValues,
      [name]: name === "creditLifeOpt" ? checked : value,
    });
    if (name == "outstandingSettlementBalance" && value.length > 0) {
      const isOnlyDigits = /^\d+$/.test(value);
      if (!isOnlyDigits) {
        setCreditLifeErrors({
          ...creditLifeErrors,
          outstandingSettlementBalance: "Invalid Input for Outstanding Balance",
        });
        setDisabled({ ...disabled, outstandingBalance: true });
        return;
      } else {
        setCreditLifeErrors({
          ...creditLifeErrors,
          outstandingSettlementBalance: "",
        });
        setDisabled({
          ...disabled,
          outstandingBalance: false,
        });
      }
      if (+value > +formValues?.devicePrice) {
        setCreditLifeErrors({
          ...creditLifeErrors,
          outstandingSettlementBalance:
            "Outstanding balance can't be more than device price",
        });
        setDisabled({ ...disabled, outstandingBalance: true });
      } else {
        setCreditLifeErrors({
          ...creditLifeErrors,
          outstandingSettlementBalance: "",
        });
        setDisabled({ ...disabled, outstandingBalance: false });
      }
    }
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
          <form onSubmit={handleSubmitForm} className="mx-auto w-full bg-white">
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
                inputs={retailInputs}
                formValues={formValues}
                formErrors={formErrors}
                handlePhoneChange={handlePhoneChange}
                handleChange={handleDeviceChange}
                tailwindClass="grid w-full grid-cols-2 gap-4"
              />
            </div>

            <div>
              <InputField
                input={creditLifeOptCheckbox}
                handleChange={handleCreditLifeChange}
                formValues={creditLifeValues}
                formErrors={creditLifeErrors}
              />
            </div>
            {creditLifeValues.creditLifeOpt && (
              <div>
                <FormComponent
                  inputs={creditLifeOptInputs}
                  formValues={creditLifeValues}
                  formErrors={creditLifeErrors}
                  handleChange={handleCreditLifeChange}
                  tailwindClass="grid w-full grid-cols-2 gap-4"
                />
              </div>
            )}

            <div className="float-right mt-6">
              <Button
                text="Confirm"
                type="submit"
                disabled={
                  disabled.device ||
                  disabled.phone ||
                  disabled.outstandingBalance ||
                  disabled.startDate
                }
              />
            </div>
          </form>
        )}
      </div>
      {step == 2 && (
        <div className="mx-auto w-full bg-white">
          <RetailDeviceQuoteReview formValues={formValues} />
          <div className="mt-6 flex justify-end">
            <div className="mr-10">
              <SecondaryButton text="Back" onClick={handleBack} />
            </div>
            <Button text="Confirm" onClick={handleNext} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RetailDeviceQuote;
