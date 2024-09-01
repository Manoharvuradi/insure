import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import AddButton from "~/common/buttons/addButton";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import FormComponent from "~/common/form";
import InputField from "~/common/form/input";
import Loader from "~/common/loader";
import { IEvent } from "~/interfaces/common/form";
import { IStepComponentProps } from "~/interfaces/policy";
import { api } from "~/utils/api";
import { paymentInputs, paymetMethodTypes } from "~/utils/constants/payments";
import { bankOptions } from "~/utils/constants/bankOptions";
import { roleValues } from "~/utils/constants/user";
import { applicationStatus, packageNames } from "~/utils/constants";
import { ApplicationStatusValues } from "~/utils/constants/application";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

const PaymentForm = ({
  setFormValues,
  formValues,
  formErrors,
  handleFormInputChange,
  index,
  onClickStep,
}: IStepComponentProps) => {
  const applicationUpdate = api.application.update.useMutation();
  const [load, setLoad] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [formError, setFormError] = useState({} as any);
  const [disable, setDisabled] = useState(false);
  const router = useRouter();
  const session = useSession();

  const handlePaymentInputChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    const form = { ...formValues };
    const payment = form.paymentMethod[index] as any;

    payment[name] = value;

    if (name === "accountNumber") {
      if (value.length < 7) {
        setFormError({
          ...formError,
          paymentMethod: {
            ...formError.paymentMethod,
            accountNumber: "Account number should be at least 7 digits",
          },
        });
        setDisabled(true);
      } else {
        setDisabled(false);
        setFormError({
          ...formError,
          paymentMethod: {
            ...formError.paymentMethod,
            accountNumber: "",
          },
        });
      }
    }

    if (name === "bank") {
      const selectedBank = bankOptions.find((bank) => bank.value === value);
      if (selectedBank) {
        payment.branchCode = selectedBank.code;
      } else {
        payment.branchCode = "";
      }
    }
    setFormValues({
      ...form,
    });
  };

  useEffect(() => {
    if (!formValues?.paymentMethod || !formValues.paymentMethod.length) {
      setFormValues({
        ...formValues,
        paymentMethod: [{}],
      });
    }
  }, [formValues?.paymentMethod]);

  const handleBack = () => {
    router.push("/application/list");
    if (onClickStep) {
      onClickStep(0);
    }
  };

  const generateApplicationData = (
    applicationData: any,
    mainMember: any,
    packageName: string
  ) => {
    switch (packageName) {
      case packageNames.funeral:
        const formattedData = {
          packageName: applicationData?.packageName,
          withFreeBenefit: applicationData?.withFreeBenefit,
          members: {
            ...applicationData?.members,
            mainMember: {
              ...applicationData?.members?.mainMember,
              dateOfBirth: new Date(mainMember?.dateOfBirth),
              ...(applicationData?.members?.mainMember.createdAt
                ? {
                    createdAt: new Date(
                      applicationData?.members?.mainMember?.createdAt
                    ),
                  }
                : {}),
              ...(applicationData?.members?.mainMember?.updatedAt
                ? {
                    updatedAt: new Date(
                      applicationData?.members.mainMember?.updatedAt
                    ),
                  }
                : {}),
            },
          },
        };
        if (formValues.includeSpouse) {
          formattedData.members.spouse = applicationData?.members?.spouse.map(
            (spouse: any) => {
              return {
                ...spouse,
                dateOfBirth: new Date(spouse?.dateOfBirth),
                ...(spouse.createdAt
                  ? { createdAt: new Date(spouse.createdAt) }
                  : {}),
                ...(spouse.updatedAt
                  ? { updatedAt: new Date(spouse.updatedAt) }
                  : {}),
              };
            }
          );
        }
        if (formValues.includeChildren) {
          formattedData.members.children =
            applicationData?.members?.children?.map((child: any) => {
              if (child?.isStillBorn) {
                const { dateOfBirth, ...restChild } = child;
                return {
                  firstName: restChild.firstName,
                  lastName: restChild.lastName,
                  age: 0,
                  isDisabled: restChild.isDisabled,
                  isStillBorn: restChild.isStillBorn,
                  isStudying: restChild.isStudying,
                  ...(restChild.createdAt
                    ? { createdAt: new Date(restChild.createdAt) }
                    : {}),
                  ...(restChild.updatedAt
                    ? { updatedAt: new Date(restChild.updatedAt) }
                    : {}),
                };
              } else if (!child?.isStillBorn && child?.dateOfBirth) {
                return {
                  ...child,
                  dateOfBirth: new Date(child?.dateOfBirth),
                  ...(child.createdAt
                    ? { createdAt: new Date(child.createdAt) }
                    : {}),
                  ...(child.updatedAt
                    ? { updatedAt: new Date(child.updatedAt) }
                    : {}),
                };
              } else {
                return child;
              }
            });
        }
        if (formValues.extendedFamily) {
          formattedData.members.extendedFamily =
            applicationData?.members?.extendedFamily?.map((family: any) => {
              return {
                ...family,
                relation: family.relation ?? "parent",
                dateOfBirth: new Date(family?.dateOfBirth),
                ...(family.createdAt
                  ? { createdAt: new Date(family.createdAt) }
                  : {}),
                ...(family.updatedAt
                  ? { updatedAt: new Date(family.updatedAt) }
                  : {}),
              };
            });
        }
        return formattedData;
      case packageNames.device:
        return {
          packageName: applicationData.packageName,
          deviceData: {
            ...applicationData.deviceData,
            devicePrice: Number(applicationData.deviceData.devicePrice),
          },
        };
      default:
        return null;
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoad(true);
    const applicationData = formValues?.application.applicationData;
    const mainMember = formValues?.mainMember;
    const req: any = {
      packageName: formValues?.package,
      billingFrequency: formValues?.billingFrequency,
      options: formValues?.coverageOption,
      billingDay: parseInt(formValues?.billingDay),
      status: session?.data?.user?.roles?.includes(
        roleValues?.agent as UserRole
      )
        ? ApplicationStatusValues?.pending
        : ApplicationStatusValues?.approved,
      startDate: new Date(formValues?.startDate),
      policyholderId: formValues?.policyholder?.id,
      applicationData: generateApplicationData(
        applicationData,
        mainMember,
        formValues.package
      ),
      beneficiaries: formValues?.application?.beneficiaries?.map(
        (beneficiary) => {
          return {
            ...beneficiary,
            percentage: parseInt(beneficiary?.percentage),
            dateOfBirth: new Date(beneficiary.dateOfBirth),
          };
        }
      ),
    };
    if (formValues.paymentMethod) {
      const policyHolderReq = {
        email: formValues?.policyholder?.email,
        citizenShipId: formValues?.policyholder?.citizenshipId,
        paymentMethods: formValues?.policyholder?.paymentMethods ?? [],
      };
      policyHolderReq.paymentMethods.concat(formValues.paymentMethod);
    }
    req.paymentMethod = {
      ...formValues.paymentMethod[0],
      paymentMethodType: paymentType,
    };
    try {
      const applicationRes = await applicationUpdate.mutateAsync({
        id: formValues.application?.id,
        body: req,
      });
      if (applicationRes) {
        if (
          session?.data?.user?.roles?.includes(roleValues.agent as UserRole)
        ) {
          toast.success("Application updated successfully");
          setLoad(false);
          setFormValues({ ...formValues, policy: applicationRes });
          setTimeout(() => {
            router.push("/application/list");
          }, 1000);
        } else {
          toast.success("Policy issued");
          setLoad(false);
          setFormValues({ ...formValues, policy: applicationRes });
          setTimeout(() => {
            router.push("/policy/list");
          }, 1000);
        }
      } else {
        setLoad(false);
        toast.error("Failed to update data.", {
          toastId: "fetchError",
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      setLoad(false);
      toast.error("Failed to update data.");
    } finally {
      setLoad(false);
    }
  };
  const [paymentInput, setPaymentInput] = useState(paymentInputs);
  const setAllRequiredFields = (str: any) => {
    setPaymentInput((prevState) =>
      prevState.map((input) => ({
        ...input,
        required: str == "DEBIT_FROM_BANK_ACCOUNT" ? true : false,
      }))
    );
  };
  const handleOptionChange = (e: any, index: number = 0) => {
    setPaymentType(e.target.value);
    setAllRequiredFields(e.target.value.toString());
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
            <div className="w-80 pt-[5px]">
              <FormComponent
                inputs={paymetMethodTypes}
                formValues={{ paymentMethodType: paymentType }}
                handleChange={handleOptionChange}
              />
            </div>
            <div>
              {formValues?.paymentMethod?.map((payment: any, index: number) => {
                return (
                  <div className="rounded border border-primary-600 p-5">
                    <FormComponent
                      inputs={paymentInput}
                      formValues={payment}
                      formErrors={formError.paymentMethod}
                      handleChange={handlePaymentInputChange}
                      tailwindClass="grid grid-cols-2 gap-4"
                      // formErrors={formErrors.paymentMethod}
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
                text={
                  session.data?.user.roles?.includes(
                    roleValues.agent as UserRole
                  )
                    ? "Update"
                    : "Issue policy"
                }
                type={"submit"}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentForm;
