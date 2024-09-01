import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import FormComponent from "~/common/form";
import Loader from "~/common/loader";
import { IEvent } from "~/interfaces/common/form";
import { IRetailDeviceStepComponentProps } from "~/interfaces/policy";
import { api } from "~/utils/api";
import { bankOptions } from "~/utils/constants/bankOptions";
import { paymentFormInputs, paymentInputs } from "~/utils/constants/payments";
import { roleValues } from "~/utils/constants/user";

function RetailPaymentsForm({
  index,
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  onClickStep,
  userType,
}: IRetailDeviceStepComponentProps) {
  const [load, setLoad] = useState(false);
  const retailApplication = api.lead.update.useMutation();
  const session = useSession();
  const router = useRouter();

  const [disable, setDisable] = useState(false);

  paymentInputs.forEach((input) => {
    input.required = true;
  });
  const handleBack = () => {
    router.push("/lead/list");
    if (onClickStep) {
      onClickStep(0);
    }
  };

  const handlePaymentInputChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    const form = { ...formValues };
    const payment = form.paymentMethod[index] as any;

    payment[name] = value;

    if (name === "bank") {
      const selectedBank = bankOptions.find((bank) => bank.value === value);
      if (selectedBank) {
        payment.branchCode = selectedBank.code;
      } else {
        payment.branchCode = "";
      }
    }
    if (name === "accountNumber") {
      if (value.length < 7) {
        setDisable(true);
        setFormErrors({
          ...formErrors,
          paymentMethod: {
            ...formErrors.paymentMethod,
            accountNumber: "Account number should be at least 7 digits",
          },
        });
      } else {
        setDisable(false);
        setFormErrors({
          ...formErrors,
          paymentMethod: {
            ...formErrors.paymentMethod,
            accountNumber: "",
          },
        });
      }
    }
    setFormValues({
      ...form,
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoad(true);
    let creditLifeRequest: any;
    if (formValues.paymentMethod) {
      const policyHolderReq = {
        email: formValues?.policyholder?.email,
        citizenShipId: formValues?.policyholder?.citizenshipId,
        paymentMethods: formValues?.policyholder?.paymentMethods ?? [],
      };
      policyHolderReq.paymentMethods.concat(formValues.paymentMethod);
    }
    const deviceReq: any = {
      billingFrequency: formValues.billingFrequency,
      billingDay: Number(formValues.billingDay),
      startDate: new Date(formValues?.startDate),
      status: userType !== "AGENT" ? "INREVIEW" : "DRAFT",
      policyholderId: formValues.policyholder.id,
      packageName: formValues.applicationData.deviceData.packageName,
      applicationData: {
        packageName: formValues.applicationData.deviceData.packageName,
        deviceData: {
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
        },
      },
      beneficiaries: formValues?.beneficiaries?.map((beneficiary) => {
        return {
          ...beneficiary,
          percentage: parseInt(beneficiary?.percentage),
          dateOfBirth: new Date(beneficiary.dateOfBirth),
        };
      }),
      autoRenewal: true,
      paymentMethod: {
        ...formValues.paymentMethod[0],
        paymentMethodType: "DEBIT_FROM_BANK_ACCOUNT",
      },
    };
    if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
      creditLifeRequest = {
        billingFrequency: formValues.billingFrequency,
        billingDay: Number(formValues.billingDay),
        startDate: new Date(formValues?.startDate),
        status: userType !== "AGENT" ? "INREVIEW" : "DRAFT",
        policyholderId: formValues.policyholder.id,
        packageName: formValues.applicationData.creditLifeData.packageName,
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
        beneficiaries: formValues?.creditLifeBeneficiaries?.map(
          (beneficiary) => {
            return {
              ...beneficiary,
              percentage: parseInt(beneficiary?.percentage),
              dateOfBirth: new Date(beneficiary.dateOfBirth),
            };
          }
        ),
        autoRenewal: true,
        paymentMethod: {
          ...formValues.paymentMethod[0],
          paymentMethodType: "DEBIT_FROM_BANK_ACCOUNT",
        },
      };
    }

    try {
      let creditLifeResponse;
      const deviceResponse: any = await retailApplication.mutateAsync({
        id: formValues.deviceApplicationId,
        body: { ...deviceReq },
      });
      if (deviceResponse) {
        toast.success("successfully updated lead");
        if (!formValues.creditLifeOpt && !formValues.confirmCreditLife) {
          router.push("/lead/list");
        }
        if (formValues.creditLifeOpt) {
          if (!formValues.confirmCreditLife) {
            router.push("/lead/list");
          }
        }
        if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
          creditLifeResponse = await retailApplication.mutateAsync({
            id: formValues.creditLifeApplicationId,
            body: { ...creditLifeRequest },
          });
        }
      } else {
        toast.error("Failed to update lead");
      }
      if (formValues.creditLifeOpt && formValues.confirmCreditLife) {
        if (creditLifeResponse) {
          toast.success("successfully updated credit life");
          router.push("/lead/list");
        } else {
          toast.error("Failed to update credit life");
        }
      }
    } catch (error) {
      setLoad(false);
      toast.error("Failed to update lead");
    } finally {
      setLoad(false);
    }
  };

  return (
    <>
      {load && <Loader />}
      <div className="">
        <p className="text-xl font-semibold leading-7 text-gray-900">
          Payment Details
        </p>
        <div>
          <form className="mx-auto w-full bg-white p-5" onSubmit={handleSubmit}>
            <div>
              {formValues?.paymentMethod?.map((payment: any, index: number) => {
                return (
                  <div className="rounded border border-primary-600 p-5">
                    <FormComponent
                      inputs={paymentFormInputs(formValues.category as string)}
                      formValues={payment}
                      handleChange={handlePaymentInputChange}
                      tailwindClass="grid grid-cols-2 gap-4"
                      formErrors={formErrors.paymentMethod}
                      index={index}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-between">
              <SecondaryButton text="Back" onClick={handleBack} />
              <Button
                disabled={disable}
                text={userType !== "AGENT" ? "Accept Lead" : "Update"}
                type={"submit"}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RetailPaymentsForm;
