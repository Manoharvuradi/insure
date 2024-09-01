import React, { useEffect, useState } from "react";
import AddButton from "~/common/buttons/addButton";
import { IEvent, IInput } from "~/interfaces/common/form";
import {
  ageInput,
  coverageOptions,
  extendedFamilyCoverageOptions,
  getMainMemberQuote,
  startDateBillingFrequency,
} from "~/utils/constants/policy";
import { IMember, IStepComponentProps } from "~/interfaces/policy";
import InputField from "~/common/form/input";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import QuoteReview from "./quoteReview";
import { api } from "~/utils/api";
import { premiumFrequency } from "~/utils/constants";
import Loader from "~/common/loader";
import { ToastContainer, toast } from "react-toastify";
import { extendedFamilyMemberLimit } from "~/interfaces/common";
import {
  invalideMainMemberAge,
  checkRequiredFields,
} from "~/utils/helpers/errors";
import DeleteButton from "~/common/buttons/deleteButton";
import { number } from "zod";
import { useRouter } from "next/router";

const QuoteForm = ({
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  onClickStep,
  index,
  handleFormInputChange,
}: IStepComponentProps) => {
  const quote = api.quotation.create.useMutation();
  const [step, setStep] = useState(1);
  const [load, setLoad] = useState(false);
  const [disabled, setDisabled] = useState(true);

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

  const handleMainMemberAge = (e: IEvent) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      mainMember: { ...formValues.mainMember, [name]: parseInt(value) },
    });
    if (value < 18 && value != "") {
      setFormErrors({
        ...formErrors,
        mainMember: {
          ...formErrors.mainMember,
          [name]: invalideMainMemberAge,
        },
      });
    } else if (value > 64) {
      setFormErrors({
        ...formErrors,
        mainMember: {
          ...formErrors.mainMember,
          [name]: "Please enter a number less than 64",
        },
      });
    } else {
      setFormErrors({
        ...formErrors,
        mainMember: {
          ...formErrors.mainMember,
          [name]: "",
        },
      });
    }
  };

  const handleSpouseAge = (e: IEvent, index: number = 0) => {
    const form = { ...formValues };
    const errors = { ...formErrors };
    const { name, value } = e.target;
    form.spouse[index] = {
      ...formValues.spouse[index],
      [name]: parseInt(value),
    };
    setFormValues({ ...form });
    if (value < 18 && value != "") {
      form.spouse[index] = {
        ...formValues.spouse[index],
      };
      errors.spouse[index] = {
        ...formErrors.spouse[index],
        [name]: "Please enter a number greater than 18",
      };
    } else if (value > 64) {
      form.spouse[index] = {
        ...formValues.spouse[index],
      };
      errors.spouse[index] = {
        ...formErrors.spouse[index],
        [name]: "Please enter a number less than 64 ",
      };
    } else {
      form.spouse[index] = {
        ...formValues.spouse[index],
      };
      errors.spouse[index] = {
        ...formErrors.spouse[index],
        [name]: "",
      };
    }
    setFormErrors({ ...errors });
  };

  const handleChildrenAge = (e: IEvent, index: number = 0) => {
    const form = { ...formValues };
    const errors = { ...formErrors };
    let { name, value } = e.target;
    form.children[index] = {
      ...formValues.children[index],
      [name]: parseInt(value),
    };
    setFormValues({ ...form });
    form.children[index] = {
      ...formValues.children[index],
      ["isStudying"]: false,
    };
    form.children[index] = {
      ...formValues.children[index],
      ["isDisabled"]: false,
    };
    form.children[index] = {
      ...formValues.children[index],
      ["isStillBorn"]: false,
    };
    value = parseInt(value);
    switch (true) {
      case value > 21 && value < 26:
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsStudying"]: true,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsDisabled"]: true,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableStillBorn"]: false,
        };
        errors.children[index] = {
          ...formErrors.children[index],
          [name]: "This age is allowed only for studying or disabled",
        };
        break;
      case value > 25 && value <= 100:
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsStudying"]: false,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsDisabled"]: true,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableStillBorn"]: false,
        };
        errors.children[index] = {
          ...formErrors.children[index],
          [name]: "This age is allowed only for disabled",
        };
        break;
      case value && value == 0:
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsStudying"]: false,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsDisabled"]: false,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableStillBorn"]: true,
        };
        errors.children[index] = {
          ...formErrors.children[index],
          [name]: "This age is allowed only for stillborn",
        };
        break;
      case value < 0:
        errors.children[index] = {
          ...formErrors.children[index],
          [name]: "Please enter a number greater than 0",
        };
        break;
      case value > 100:
        errors.children[index] = {
          ...formErrors.children[index],
          [name]: "Please enter a number less than or equal to 100",
        };
        break;
      default:
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsStudying"]: false,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableIsDisabled"]: false,
        };
        form.children[index] = {
          ...formValues.children[index],
          ["enableStillBorn"]: false,
        };
        errors.children[index] = {
          ...formErrors.children[index],
          [name]: "",
        };
        break;
    }
    setFormErrors({ ...errors });
  };
  const handleExtendedAge = (e: IEvent, index: number = 0) => {
    const form = { ...formValues };
    const errors = { ...formErrors };
    const { name, value } = e.target;
    let val: any = Math.trunc(value);
    form.extendedFamily[index] = {
      ...formValues.extendedFamily[index],
      [name]: parseInt(val),
    };
    setFormValues({ ...form });
    if (value < 0 && value == "") {
      form.extendedFamily[index] = {
        ...formValues.extendedFamily[index],
      };
      errors.extendedFamily[index] = {
        ...formErrors.extendedFamily[index],
        [name]: "Please enter age between 0-74",
      };
    } else if (value > 74) {
      form.extendedFamily[index] = {
        ...formValues.extendedFamily[index],
      };
      errors.extendedFamily[index] = {
        ...formErrors.extendedFamily[index],
        [name]: "Please enter age number less than 74 ",
      };
    } else {
      form.extendedFamily[index] = {
        ...formValues.extendedFamily[index],
      };
      errors.extendedFamily[index] = {
        ...formErrors.extendedFamily[index],
        [name]: "",
      };
    }
    setFormErrors({ ...errors });
  };

  const handleExtendedCoverageOption = (e: IEvent, index: number = 0) => {
    const form = { ...formValues };
    const { name, value } = e.target;
    form.extendedFamily[index] = {
      ...formValues.extendedFamily[index],
      [name]: value,
    };
    setFormValues({ ...form });
  };

  const handleCheckbox = (event: IEvent) => {
    const { name, checked } = event.target;
    switch (name) {
      case "includeSpouse": {
        setFormValues({
          ...formValues,
          [name]: checked,
          spouse: [{ age: "" }],
        });
        setFormErrors({ ...formErrors, [name]: checked, spouse: [] });
        break;
      }
      case "includeChildren": {
        setFormValues({
          ...formValues,
          [name]: checked,
          children: [{ age: "" }],
        });
        setFormErrors({ ...formErrors, [name]: checked, children: [] });
        break;
      }
      case "includeExtendedFamily": {
        setFormValues({
          ...formValues,
          [name]: checked,
          extendedFamily: [{ age: "" }],
        });
        setFormErrors({ ...formErrors, [name]: checked, extendedFamily: [] });
        break;
      }
      default:
        break;
    }
  };

  const handleChildrenCheckbox = (
    event: IEvent,
    index: number,
    age: number
  ) => {
    const { name, checked } = event.target;
    const errors = { ...formErrors };
    const children = [...formValues.children];
    const ageName: any = "age";

    switch (name) {
      case "isStudying":
        children[index] = {
          ...children[index],
          [name]: checked,
          isDisabled: false,
          isStillBorn: false,
        };
        break;

      case "isDisabled":
        children[index] = {
          ...children[index],
          isStudying: false,
          [name]: checked,
          isStillBorn: false,
        };
        break;

      case "isStillBorn":
        children[index] = {
          ...children[index],
          isStudying: false,
          isDisabled: false,
          age: 0,
          [name]: checked,
        };
        break;

      default:
        break;
    }

    setFormValues({
      ...formValues,
      children: children,
    });

    if (checked) {
      errors.children[index] = {
        ...formErrors.children[index],
        [ageName]: "",
      };
    } else if (formValues) {
      if (formValues?.children[index]) {
        const age = formValues?.children[index]?.age as unknown as number;
        if (age > 21 && age < 26) {
          errors.children[index] = {
            ...formErrors.children[index],
            [ageName]: "This age is allowed only for studying or disabled",
          };
        } else if (age > 25) {
          errors.children[index] = {
            ...formErrors.children[index],
            [ageName]: "This age is allowed only for disabled",
          };
        } else if (age == 0) {
          errors.children[index] = {
            ...formErrors.children[index],
            [ageName]: "This age is allowed only for stillborn",
          };
        }
      }
    }
    setFormErrors(errors);
  };

  const [totalExtendedFamilyMemberCount, setTotalExtendedFamilyMemberCount] =
    useState(1);

  const addNewMember = (type: string) => {
    switch (type) {
      case "child":
        setFormValues({
          ...formValues,
          children: [
            ...formValues.children,
            { isStudying: false, isDisabled: false, isStillBorn: false },
          ],
        });
        setFormErrors({
          ...formErrors,
          children: [...formErrors.children, {}],
        });
        break;
      case "spouse":
        setFormValues({
          ...formValues,
          spouse: [...formValues.spouse, {}],
        });
        setFormErrors({
          ...formErrors,
          spouse: [...formErrors.spouse, {}],
        });
        break;
      case "extended":
        if (totalExtendedFamilyMemberCount < extendedFamilyMemberLimit) {
          setTotalExtendedFamilyMemberCount(totalExtendedFamilyMemberCount + 1);
          setFormValues({
            ...formValues,
            extendedFamily: [...formValues.extendedFamily, {}],
          });
          setFormErrors({
            ...formErrors,
            extendedFamily: [...formErrors.extendedFamily, {}],
          });
        } else {
          toast.error(
            "You have  reached the maximum limit of extended family members",
            {
              toastId: "extendedError",
            }
          );
        }
        break;
      default:
        break;
    }
  };

  const deleteMember = (index: number, type: string) => {
    const form = { ...formValues };
    const errors = { ...formErrors };
    switch (type) {
      case "child":
        if (formValues.children?.length === 1) {
          setFormValues({ ...formValues, ["includeChildren"]: false });
        } else {
          form.children.splice(-1, 1);
          setFormValues({ ...form });
          errors.children.splice(-1, 1);
          setFormErrors({ ...errors });
        }
        break;
      case "spouse":
        if (formValues.spouse?.length === 1) {
          setFormValues({ ...formValues, ["includeSpouse"]: false });
        } else {
          form.spouse.splice(-1, 1);
          setFormValues({ ...form });
          errors.spouse.splice(-1, 1);
          setFormErrors({ ...errors });
        }
        break;
      case "extended":
        if (formValues.extendedFamily?.length === 1) {
          setFormValues({ ...formValues, ["includeExtendedFamily"]: false });
        } else {
          setTotalExtendedFamilyMemberCount(totalExtendedFamilyMemberCount - 1);
          form.extendedFamily.splice(-1, 1);
          setFormValues({ ...form });
          errors.extendedFamily.splice(-1, 1);
          setFormErrors({ ...errors });
        }
        break;
      default:
        break;
    }
  };

  const handleSubmitForm = async (event: any) => {
    event.preventDefault();
    setLoad(true);
    const children =
      formValues?.children?.length > 0
        ? formValues.children.map((child: IMember) => ({
            age: child?.age ?? 0,
            isStudying: child.isStudying,
            isDisabled: child.isDisabled,
            isStillBorn: child.isStillBorn,
          }))
        : [];
    const extendedFamily =
      formValues.extendedFamily.length > 0
        ? formValues.extendedFamily.map((extendedFamily: IMember) => ({
            options: extendedFamily?.coverageOption,
            age: extendedFamily?.age,
          }))
        : [];
    const spouse =
      formValues.spouse.length > 0
        ? formValues.spouse.map((spouse: IMember) =>
            spouse?.email && spouse?.email !== ""
              ? {
                  email: spouse.email,
                  age: spouse?.age,
                }
              : { age: spouse?.age }
          )
        : [];

    const req: any = {
      options: formValues.coverageOption,
      billingFrequency: premiumFrequency[0],
      startDate: new Date(formValues?.startDate),
      policyData: {
        packageName: formValues.package,
        withFreeBenefit: formValues.withFreeBenefit,
        members: {
          mainMember: formValues.mainMember,
        },
      },
    };
    if (formValues.includeSpouse) req.policyData.members.spouse = spouse;
    if (formValues.includeChildren) req.policyData.members.children = children;
    if (formValues.includeExtendedFamily)
      req.policyData.members.extendedFamily = extendedFamily;
    try {
      const res: any = await quote.mutateAsync(req);
      if (res) {
        const members = res.policyData.members;
        const sumAssured = members?.mainMember?.accidentalDeathAmount;
        let formCopy = {
          ...formValues,
          quoteId: res.id,
          billingFrequency: res.billingFrequency,
          sumAssured: sumAssured,
          monthlyPremium: res.policyData?.members?.totalPremium,
          mainMember: {
            ...formValues.mainMember,
            coverageOption: res.options,
            naturalDeathAmount: members?.mainMember?.naturalDeathAmount,
            accidentalDeathAmount: members?.mainMember?.accidentalDeathAmount,
            premiumAmount: members?.mainMember?.premiumAmount,
            telkomFreeBenefitAmount:
              members?.mainMember?.telkomFreeBenefitAmount,
          },
        };
        if (formValues.includeSpouse) {
          formCopy.spouse = members.spouse;
        }

        if (formValues.includeChildren) {
          formCopy.children = members.children;
        }
        if (formValues.includeExtendedFamily) {
          formCopy.extendedFamily = members.extendedFamily.map(
            (member: any, i: number) => {
              return {
                ...member,
                coverageOption: formValues.extendedFamily[i]?.coverageOption,
              };
            }
          );
        }
        setFormValues({ ...formCopy });
        setStep(2);
        setLoad(false);
      } else {
        setLoad(false);
        toast.error("Failed to fetch data.", {
          toastId: "fetchError",
          autoClose: 2000,
        });
      }
    } catch (e) {
      setLoad(false);
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  };

  const handleNext = async () => {
    if (onClickStep) {
      onClickStep(index + 1);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const router = useRouter();
  const category = router.pathname.split("/")[1];

  const handleGetQuoteBack = () => {
    router.push("/quickQuote");
  };

  useEffect(() => {
    setDisabled(!checkRequiredFields(formErrors));
  }, [formErrors]);
  return (
    <>
      <div>
        {load && <Loader />}
        {step == 1 && (
          <form
            className={`${
              category !== "policy"
                ? "mx-auto w-[80%]"
                : "mx-auto w-full bg-white"
            }`}
            onSubmit={handleSubmitForm}
          >
            <h1 className="pb-2 text-2xl font-bold leading-7 text-gray-900">
              Quote
            </h1>
            <div className="grid w-full grid-cols-2 gap-4">
              {startDateBillingFrequency.map((input: IInput, index) => {
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
            <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
              Main member
            </h2>
            <div className="grid w-full grid-cols-2 gap-4">
              {getMainMemberQuote(!formValues?.withFreeBenefit).map(
                (input: IInput, index) => {
                  return (
                    <InputField
                      key={index + "mainMemberQuote"}
                      handleChange={
                        input.name == "age"
                          ? handleMainMemberAge
                          : handleFormInputChange
                      }
                      input={input}
                      formValues={
                        input.name == "age" ? formValues.mainMember : formValues
                      }
                      formErrors={
                        input.name == "age" ? formErrors.mainMember : formErrors
                      }
                    />
                  );
                }
              )}
            </div>

            <div className="mt-4 flex ">
              <div className="w-1/2">
                <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900 ">
                  Other members
                </h2>
                <div>
                  <InputField
                    handleChange={handleCheckbox}
                    input={{
                      label: "Include spouse",
                      type: "checkbox",
                      name: "includeSpouse",
                      required: false,
                    }}
                    formValues={formValues}
                    formErrors={formErrors}
                  />
                  <InputField
                    handleChange={handleCheckbox}
                    input={{
                      label: "Include children",
                      type: "checkbox",
                      name: "includeChildren",
                      required: false,
                    }}
                    formValues={formValues}
                    formErrors={formErrors}
                  />
                  <InputField
                    handleChange={handleCheckbox}
                    input={{
                      label: "Include extended family",
                      type: "checkbox",
                      name: "includeExtendedFamily",
                      required: false,
                    }}
                    formValues={formValues}
                    formErrors={formErrors}
                  />
                </div>
              </div>
              <div className="w-1/2 px-2 ">
                {formValues.includeSpouse && (
                  <div className="">
                    <p className="font-semibold">Spouse details</p>
                    {formValues.spouse?.map(
                      (spouse: IMember, index: number) => {
                        return (
                          <div key={index + "spouse"}>
                            <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                              <span>Spouse {index + 1} </span>
                            </h2>
                            <InputField
                              handleChange={handleSpouseAge}
                              input={ageInput}
                              formValues={spouse}
                              formErrors={formErrors.spouse[index] as IMember}
                              index={index}
                            />
                          </div>
                        );
                      }
                    )}
                    <div className="flex gap-3">
                      {formValues.spouse.length < 4 && (
                        <AddButton
                          name={"Add spouse"}
                          handleClick={() => addNewMember("spouse")}
                        />
                      )}
                      <DeleteButton
                        handleDelete={() => {
                          deleteMember(index, "spouse");
                        }}
                      />
                    </div>
                  </div>
                )}

                {formValues.includeChildren && (
                  <div className="mt-6">
                    <p className="font-semibold">Children details</p>
                    {formValues.children?.map(
                      (child: IMember, index: number) => {
                        return (
                          <div key={index + "child"}>
                            <p className="flex justify-between pb-2 text-sm font-semibold leading-7 text-gray-900">
                              <span>Child {index + 1}</span>
                            </p>
                            {!child?.isStillBorn && (
                              <InputField
                                handleChange={handleChildrenAge}
                                input={ageInput}
                                formValues={child}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                                index={index}
                              />
                            )}
                            {!child?.age && (
                              <InputField
                                handleChange={(e) =>
                                  handleChildrenCheckbox(
                                    e,
                                    index,
                                    Number(child?.age)
                                  )
                                }
                                input={{
                                  label: "Stillborn",
                                  type: "checkbox",
                                  name: "isStillBorn",
                                  required: false,
                                }}
                                formValues={child}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                              />
                            )}
                            {child.enableIsStudying && (
                              <InputField
                                handleChange={(e) =>
                                  handleChildrenCheckbox(
                                    e,
                                    index,
                                    Number(child?.age)
                                  )
                                }
                                input={{
                                  label: "Studying",
                                  type: "checkbox",
                                  name: "isStudying",
                                  required: false,
                                }}
                                formValues={child}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                              />
                            )}
                            {child.enableIsDisabled && (
                              <InputField
                                handleChange={(e) =>
                                  handleChildrenCheckbox(
                                    e,
                                    index,
                                    Number(child?.age)
                                  )
                                }
                                input={{
                                  label: "Disabled",
                                  type: "checkbox",
                                  name: "isDisabled",
                                  required: false,
                                }}
                                formValues={child}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                              />
                            )}
                            {child.enableStillBorn && (
                              <InputField
                                handleChange={(e) =>
                                  handleChildrenCheckbox(
                                    e,
                                    index,
                                    Number(child?.age)
                                  )
                                }
                                input={{
                                  label: "Stillborn",
                                  type: "checkbox",
                                  name: "isStillBorn",
                                  required: false,
                                }}
                                formValues={child}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                              />
                            )}
                          </div>
                        );
                      }
                    )}
                    <div className="flex gap-3">
                      <AddButton
                        name={"Add child"}
                        handleClick={() => addNewMember("child")}
                      />
                      <DeleteButton
                        handleDelete={() => {
                          deleteMember(index, "child");
                        }}
                      />
                    </div>
                  </div>
                )}

                {formValues.includeExtendedFamily && (
                  <div className="mt-6">
                    <p className="font-semibold">Extended family details</p>
                    {formValues.extendedFamily.map(
                      (member: IMember, index: number) => {
                        return (
                          <div key={index + "extendedFamilyQuote"}>
                            <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                              <span>Member {index + 1} </span>
                            </h2>
                            <InputField
                              handleChange={handleExtendedCoverageOption}
                              input={extendedFamilyCoverageOptions}
                              formValues={member}
                              formErrors={
                                formErrors.extendedFamily[index] as IMember
                              }
                              index={index}
                            />
                            <InputField
                              handleChange={handleExtendedAge}
                              input={ageInput}
                              formValues={member}
                              formErrors={
                                formErrors.extendedFamily[index] as IMember
                              }
                              index={index}
                            />
                          </div>
                        );
                      }
                    )}
                    <div className="flex gap-3">
                      {formValues.extendedFamily.length < 14 && (
                        <AddButton
                          name={"Add member"}
                          handleClick={() => addNewMember("extended")}
                        />
                      )}
                      <DeleteButton
                        handleDelete={() => {
                          deleteMember(index, "extended");
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="float-right mt-6">
              <Button text="Confirm" type="submit" disabled={disabled} />
            </div>
          </form>
        )}
        {step == 2 && (
          <div
            className={`${
              category !== "policy" ? "mx-auto w-[80%]" : "w-[60vw]"
            }`}
          >
            <QuoteReview
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
    </>
  );
};

export default QuoteForm;
