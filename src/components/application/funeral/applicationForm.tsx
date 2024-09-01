import React, { useEffect, useState } from "react";
import FormComponent from "~/common/form";
import {
  policyBeneficiaryInputs,
  policyExtendMemberInputs,
  policyMemberInputs,
  policyStillBornInputs,
} from "~/utils/constants/policy";
import {
  IBeneficiary,
  IMember,
  IStepComponentProps,
} from "~/interfaces/policy";
import { IEvent } from "~/interfaces/common/form";
import SecondaryButton from "~/common/buttons/secondaryButton";
import Button from "~/common/buttons/filledButton";
import ApplicationReview from "./applicationReview";
import { api } from "~/utils/api";
import Loader from "~/common/loader";
import AddButton from "~/common/buttons/addButton";
import { AiOutlineDelete } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import {
  dateOfBirthValidation,
  dateSAIDvalidation,
  validateEmail,
  validatePhoneNum,
  validateSAIDNum,
} from "~/utils/helpers/validations";
import { checkRequiredFields } from "~/utils/helpers/errors";
import { applicationStatus, packageName, schemeType } from "~/utils/constants";
import { useRouter } from "next/router";
import { calculateAge } from "~/utils/helpers";

const ApplicationForm = ({
  setFormValues,
  formValues,
  formErrors,
  index,
  onClickStep,
  setFormErrors,
}: IStepComponentProps) => {
  const [step, setStep] = useState(1);
  const [load, setLoad] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [idNum, setIdNum] = useState(false);
  const [currentPackageName, setCurrentPackageName] = useState("");
  const [oldErrors, setOldErrors] = useState() as any;
  const application = api.application.create.useMutation();
  const applicationUpdate = api.application.update.useMutation();
  const router = useRouter();
  useEffect(() => {
    handleCurrentPackageName();
  }, [router]);

  const handleCurrentPackageName = () => {
    if (router.pathname.split("/")[3] === "funeral") {
      setCurrentPackageName(packageName[1]);
    }
  };

  useEffect(() => {
    setOldErrors(formErrors);
  }, []);

  const handleSpouseInputChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = { ...formValues };
    const errors = { ...formErrors };
    form.spouse[index][name] = value;
    let dateOfBirth;
    let ageValidate;

    if (name === "said") {
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        form.spouse[index].dateOfBirth = dateOfBirth;
        ageValidate =
          form.spouse[index].dateOfBirth === ""
            ? ""
            : calculateAge(form.spouse[index].dateOfBirth);
        if (ageValidate !== form.spouse[index].age) {
          errors.spouse[index] = {
            ...errors.spouse[index],
            [name]: "Age did not match with quote / invalid said",
          };
          setDisabled(true);
        } else {
          errors.spouse[index] = {
            ...errors.spouse[index],
            [name]: "",
          };
          setDisabled(false);
        }
      } else {
        dateOfBirth = "";
        form.spouse[index].dateOfBirth = dateOfBirth;
      }
    } else if (name === "email") {
      let result = validateEmail(value);
      form.spouse[index][name] = value;
      if (!result && value !== "") {
        errors.spouse[index] = {
          ...errors.spouse[index],
          [name]: "Please enter a valid email",
        };
      } else {
        errors.spouse[index] = {
          ...errors.spouse[index],
          [name]: "",
        };
      }
      setFormErrors({ ...errors });
    }
    setFormValues({ ...form });
  };

  function handleSaidErros(name: string, value: string) {
    if (value.length !== 13) {
      setFormErrors({
        ...formErrors,
        spouse: { ...formErrors.spouse, [name]: "Please enter a valid SA Id" },
      });
    } else {
      setFormErrors({
        ...formErrors,
        spouse: { ...formErrors.spouse, [name]: "" },
      });
    }
  }
  const handleChildrenInputChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = { ...formValues };
    const errors = { ...formErrors };
    form.children[index][name] = value;
    let dateOfBirth;
    let ageValidate;

    if (name === "said") {
      if (value === "") {
        errors.children[index] = {
          ...errors.children[index],
          [name]: "",
        };
      } else {
        if (validateSAIDNum(value)) {
          dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
          form.children[index].dateOfBirth = dateOfBirth;
          ageValidate =
            form.children[index].dateOfBirth === ""
              ? ""
              : calculateAge(form.children[index].dateOfBirth);
          if (ageValidate !== form.children[index].age) {
            errors.children[index] = {
              ...errors.children[index],
              [name]: "Age did not match with quote / invalid said",
            };
          } else {
            errors.children[index] = {
              ...errors.children[index],
              [name]: "",
            };
          }
        } else {
          dateOfBirth = "";
          form.children[index].dateOfBirth = dateOfBirth;
        }
      }
      handleChildErrors(name, value);
    } else if (name === "email") {
      let result = validateEmail(value);
      form.children[index][name] = value;
      if (!result && value !== "") {
        errors.children[index] = {
          ...errors.children[index],
          [name]: "Please enter a valid email",
        };
      } else {
        errors.children[index] = {
          ...errors.children[index],
          [name]: "",
        };
      }
      setFormErrors({ ...errors });
    }
    setFormValues({ ...form });
  };

  const handleChildErrors = (name: string, value: string) => {
    const errors = { ...formErrors };
    if (value.length !== 13) {
      errors.children = {
        ...errors.children,
        [name]: "Please enter a valid SA ID",
      };
    } else {
      errors.children = {
        ...errors.children,
        [name]: "",
      };
    }
    setFormErrors(errors);
  };

  const handleExtendInputChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = { ...formValues };
    const errors = { ...formErrors };
    form.extendedFamily[index][name] = value;
    let dateOfBirth;
    let ageValidate;

    if (name === "said") {
      if (validateSAIDNum(value)) {
        dateOfBirth = dateSAIDvalidation(value.substring(0, 6));
        form.extendedFamily[index].dateOfBirth = dateOfBirth;
        ageValidate =
          form.extendedFamily[index].dateOfBirth === ""
            ? ""
            : calculateAge(form.extendedFamily[index].dateOfBirth);
        if (ageValidate !== form.extendedFamily[index].age) {
          errors.extendedFamily[index] = {
            ...errors.extendedFamily[index],
            [name]: "Age did not match with quote / invalid said",
          };
        } else {
          errors.extendedFamily[index] = {
            ...errors.extendedFamily[index],
            [name]: "",
          };
        }
      } else {
        dateOfBirth = "";
        form.extendedFamily[index].dateOfBirth = dateOfBirth;
      }
    } else if (name === "email") {
      let result = validateEmail(value);
      form.extendedFamily[index][name] = value;
      if (!result && value !== "") {
        errors.extendedFamily[index] = {
          ...errors.extendedFamily[index],
          [name]: "Please enter a valid email",
        };
      } else {
        errors.extendedFamily[index] = {
          ...errors.extendedFamily[index],
          [name]: "",
        };
      }
      setFormErrors({ ...errors });
    }

    setFormValues({ ...form });
  };

  const handleExtendedFamilyErrors = (
    name: string,
    value: string,
    index: number
  ) => {
    const errors = { ...formErrors };
    if (value.length !== 13) {
      errors.extendedFamily = {
        ...errors.extendedFamily,
        [index]: {
          ...errors.extendedFamily[index],
          [name]: "Please enter a valid SA ID",
        },
      };
    } else {
      errors.extendedFamily = {
        ...errors.extendedFamily,
        [index]: {
          ...errors.extendedFamily[index],
          [name]: "",
        },
      };
    }
    setFormErrors(errors);
  };

  const handleBeneficiaryInputChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = { ...formValues };
    const errors: any = { ...formErrors };
    form.beneficiaries[index][name] = value;

    if (name === "email") {
      let result = validateEmail(value);
      if (!result && value !== "") {
        errors.beneficiaries = {
          ...errors.beneficiaries,
          [index]: {
            ...errors.beneficiaries[index],
            [name]: "Please enter a valid email",
          },
        };
      } else {
        errors.beneficiaries = {
          ...errors.beneficiaries,
          [index]: {
            ...errors.beneficiaries[index],
            [name]: "",
          },
        };
      }
    } else if (name === "dateOfBirth") {
      const result = dateOfBirthValidation(value);
      if (!result) {
        errors.beneficiaries = {
          ...errors.beneficiaries,
          [index]: {
            ...errors.beneficiaries[index],
            [name]: "Please select a valid date",
          },
        };
      } else {
        errors.beneficiaries = {
          ...errors.beneficiaries,
          [index]: {
            ...errors.beneficiaries[index],
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
      form.beneficiaries[index].dateOfBirth = dateOfBirth;
    }
    if (idNum && name === "identificationNumber") {
      const result = validateSAIDNum(value);
      errors.beneficiaries = {
        ...errors.beneficiaries,
        [index]: {
          ...errors.beneficiaries[index],
          identificationNumber: result ? "" : "Please enter a valid SA-ID",
        },
      };
    }

    setFormErrors({ ...errors });
    setFormValues({ ...form });
  };

  const handleBeneficiaryPhoneChange = (
    name: string,
    value: any,
    index: number = 0
  ) => {
    const form: any = { ...formValues };
    const errors: any = { ...formErrors };
    form.beneficiaries[index][name] = value;

    if (name === "phone") {
      let result = validatePhoneNum(value);
      if (!result && value !== "") {
        errors.beneficiaries = {
          ...errors.beneficiaries,
          [index]: {
            ...errors.beneficiaries[index],
            [name]: "Please enter a valid phone number",
          },
        };
      } else {
        errors.beneficiaries = {
          ...errors.beneficiaries,
          [index]: {
            ...errors.beneficiaries[index],
            [name]: "",
          },
        };
      }
    }

    setFormErrors({ ...errors });
    setFormValues({ ...form });
  };

  const handleBack = () => {
    if (
      step == 1 ||
      (!formValues.includeSpouse &&
        !formValues.includeChildren &&
        !formValues.includeExtendedFamily)
    ) {
      if (onClickStep) {
        onClickStep(index - 1);
      }
      const fields = {
        firstName: "",
        lastName: "",
        said: "",
        dateOfBirth: "",
        email: "",
      };
      const form: any = { ...formValues };
      if (form.includeSpouse) {
        form.spouse = form.spouse.map((spouse: any) => {
          return { ...spouse, ...fields, said: "" };
        });
      }
      if (form.includeChildren) {
        form.children = form.children.map((child: any) => {
          return child.dateOfBirth ? { ...child, ...fields, said: "" } : child;
        });
      }
      if (form.includeExtendedFamily) {
        form.extendedFamily = form.extendedFamily.map((ex: any) => {
          return {
            ...ex,
            ...fields,
            said: "",
          };
        });
      }
      setFormValues({ ...form, beneficiaries: [{}] });
      setFormErrors({
        ...formErrors,
        spouse: [{}],
        extendedFamily: [{}],
        children: [{}],
        beneficiaries: [{}],
      });
    } else {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    setLoad(true);
    const req: any = {
      billingFrequency: formValues.billingFrequency,
      options: formValues.coverageOption,
      billingDay: parseInt(formValues.billingDay),
      status: applicationStatus[0],
      startDate: new Date(formValues.startDate),
      sumAssured: formValues.sumAssured,
      basePremium: formValues.monthlyPremium,
      policyholderId: formValues.policyholder?.id,
      applicationData: {
        packageName: formValues.package,
        withFreeBenefit: formValues.withFreeBenefit,
        members: {
          mainMember: {
            firstName: formValues.policyholder.firstName,
            lastName: formValues.policyholder.lastName,
            age: formValues.mainMember.age,
            email: formValues.policyholder.email,
            said: formValues.policyholder.citizenshipId,
            dateOfBirth: new Date(formValues.policyholder.dateOfBirth as Date),
          },
        },
      },
      beneficiaries: formValues.beneficiaries.map((beneficiary) => {
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
      packageName: currentPackageName,
      autoRenewal: true,
      schemeType: schemeType[0],
    };
    if (formValues.includeSpouse) {
      req.applicationData.members.spouse = formValues.spouse.map((spouse) => {
        return { ...spouse, dateOfBirth: new Date(spouse.dateOfBirth as Date) };
      });
    }
    if (formValues.includeChildren) {
      req.applicationData.members.children = formValues.children.map(
        (child) => {
          return child.dateOfBirth
            ? { ...child, dateOfBirth: new Date(child.dateOfBirth as Date) }
            : child;
        }
      );
    }
    if (formValues.includeExtendedFamily) {
      req.applicationData.members.extendedFamily =
        formValues.extendedFamily.map((ex) => {
          return {
            ...ex,
            relation: ex.relation ?? "parent",
            dateOfBirth: new Date(ex.dateOfBirth as Date),
          };
        });
    }
    let res: any = "";
    if (formValues.application?.id) {
      res = await applicationUpdate.mutateAsync({
        id: formValues.application?.id,
        body: req,
      });
    } else {
      try {
        res = await application.mutateAsync(req);
      } catch (err) {
        setLoad(false);
        toast.error("Failed to fetch data.", {
          toastId: "createError",
          autoClose: 2000,
        });
      }
    }
    if (res && onClickStep) {
      setLoad(false);
      onClickStep(index + 1);
      setFormValues({ ...formValues, application: res });
    } else {
      setLoad(false);
      toast.error("Failed to fetch data.", {
        toastId: "createError",
        autoClose: 2000,
      });
    }
  };

  const handleSubmitForm = (event: any) => {
    event.preventDefault();
    let totalPercentage: number = 0;
    formValues.beneficiaries.map((beneficiary: IBeneficiary, index: number) => {
      totalPercentage += Number(beneficiary.percentage);
    });
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
  };

  const addBeneficiary = () => {
    setFormValues({
      ...formValues,
      beneficiaries: [...formValues.beneficiaries, {}],
    });
  };

  const deleteBeneficiary = (index: number) => {
    const form = { ...formValues };
    const errors = { ...formErrors };
    form.beneficiaries.splice(index, 1);
    setFormValues({ ...form });
    delete errors.beneficiaries[index];
    setFormErrors({ ...errors });
  };

  useEffect(() => {
    setDisabled(!checkRequiredFields(formErrors));
  }, [formErrors]);

  return (
    <>
      <div className="w-[60vw] bg-white">
        {load && <Loader />}
        {step == 1 && (
          <form onSubmit={handleSubmitForm}>
            <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
              Application
            </h1>
            {formValues.includeSpouse && (
              <div className="flex justify-between gap-4">
                <div className="w-full">
                  <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                    Spouse
                  </h2>
                  <div className="rounded border border-primary-600 p-2">
                    {formValues.spouse.map((spouse, index) => {
                      return (
                        <div className="w-full p-2" key={"spouse" + index}>
                          <h2 className="flex justify-between text-base font-semibold leading-7 text-gray-900">
                            spouse {index + 1}
                          </h2>
                          <div className="rounded p-2">
                            <FormComponent
                              inputs={policyMemberInputs}
                              formValues={spouse}
                              handleChange={handleSpouseInputChange}
                              tailwindClass="grid grid-cols-2 gap-4"
                              index={index}
                              formErrors={formErrors.spouse[index] as IMember}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {formValues.includeChildren && (
              <div className="flex justify-between gap-4">
                <div className="w-full">
                  <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                    Children
                  </h2>
                  <div className="rounded border border-primary-600 p-2">
                    {formValues.children.map((child, index) => {
                      const status = child?.isDisabled
                        ? "Disabled"
                        : child?.isStudying
                        ? "Studying"
                        : child?.isStillBorn
                        ? "Stillborn"
                        : "";
                      return (
                        <div className="w-full p-2" key={"child" + index}>
                          <h2 className="flex justify-between text-base font-semibold leading-7 text-gray-900">
                            Child {index + 1}
                            {status && (
                              <span className="place-self-center rounded-md border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
                                {status}
                              </span>
                            )}
                          </h2>
                          <div className="rounded p-2">
                            {child?.isStillBorn ? (
                              <FormComponent
                                inputs={policyStillBornInputs}
                                formValues={child}
                                handleChange={handleChildrenInputChange}
                                tailwindClass="grid grid-cols-2 gap-4"
                                index={index}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                              />
                            ) : (
                              <FormComponent
                                inputs={policyMemberInputs}
                                formValues={child}
                                handleChange={handleChildrenInputChange}
                                tailwindClass="grid grid-cols-2 gap-4"
                                index={index}
                                formErrors={
                                  formErrors.children[index] as IMember
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {formValues.includeExtendedFamily && (
              <div className="mt-4 w-full">
                <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                  Extended Family
                </h2>
                <div className="rounded border border-primary-600 p-5">
                  {formValues.extendedFamily.map((member, index) => {
                    return (
                      <div className="w-full p-2" key={"extend" + index}>
                        <h2 className="flex justify-between text-base font-semibold leading-7 text-gray-900">
                          Member {index + 1}
                        </h2>
                        <div className="rounded p-2">
                          <FormComponent
                            inputs={policyExtendMemberInputs}
                            formValues={member}
                            handleChange={handleExtendInputChange}
                            tailwindClass="grid grid-cols-2 gap-4"
                            index={index}
                            formErrors={
                              formErrors.extendedFamily[index] as IMember
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-4 w-full">
              <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
                Beneficiaries
              </h2>
              <div className="rounded border border-primary-600 p-2">
                {formValues.beneficiaries?.map((beneficiary, index) => {
                  return (
                    <div className="w-full p-2" key={"extend" + index}>
                      <h2 className="flex justify-between text-base font-semibold leading-7 text-gray-900">
                        <span>Beneficiary {index + 1} </span>
                        {!(formValues.beneficiaries.length == 1) && (
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
                            formErrors?.beneficiaries[index] as IBeneficiary
                          }
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex w-full justify-around">
                  <AddButton
                    name={"Add beneficiary"}
                    handleClick={() => addBeneficiary()}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <SecondaryButton text="Back" onClick={handleBack} />
              <Button text="Next" type={"submit"} disabled={disabled} />
            </div>
          </form>
        )}
        {step == 2 && (
          <div className="w-full">
            <ApplicationReview
              formValues={formValues}
              setFormValues={setFormValues}
            />
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

export default ApplicationForm;
