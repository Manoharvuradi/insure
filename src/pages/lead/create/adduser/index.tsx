import { AgentRoleType } from "@prisma/client";
import router from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "~/common/buttons/filledButton";
import FormComponent from "~/common/form";
import InputField from "~/common/form/input";
import Loader from "~/common/loader";
import NoAccessComponent from "~/common/noAccess";
import DefaultLayout from "~/components/defaultLayout";
import { IEvent } from "~/interfaces/common/form";
import withAuth from "~/pages/api/auth/withAuth";
import { api } from "~/utils/api";
import { addUserFormInputs, addUserCheckbox } from "~/utils/constants";
import {
  validateEmail,
  validateFrom,
  validatePhoneNum,
} from "~/utils/helpers/validations";
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageName: string[];
  password: string;
  confirmPassword: string;
  agent: boolean;
  lead: boolean;
  manager: boolean;
}
const AddNewAgent = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    packageName: [],
    password: "",
    confirmPassword: "",
    agent: true,
    lead: false,
    manager: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [disable, setDisable] = useState(false);

  const handleChange = (e: IEvent) => {
    const { name, value } = e.target;
    if (name == "email") {
      setDisable(!validateEmail(value));
    }

    setFormValues({ ...formValues, [name]: value });
  };

  const handleCheck = (e: IEvent) => {
    const { name, checked } = e.target;
    switch (name) {
      case "agent":
        setFormValues({
          ...formValues,
          agent: true,
          lead: false,
          manager: false,
        });
        break;
      case "lead":
        setFormValues({
          ...formValues,
          agent: false,
          lead: true,
          manager: false,
        });
        break;
      case "manager":
        setFormValues({
          ...formValues,
          agent: false,
          lead: false,
          manager: true,
        });
        break;
      default:
        setFormValues({
          ...formValues,
          agent: true,
          lead: false,
          manager: false,
        });
    }
  };

  const handlePhoneChange = (name: string, value: string) => {
    setDisable(!validatePhoneNum(value));
    setFormValues({
      ...formValues,
      phone: value,
    });
  };

  const handleOptionChange = (label: any, name: any, index: number = 0) => {
    if (name === "Package Name") {
      const updatedValues = formValues?.packageName?.includes(label)
        ? {
            ...formValues,
            packageName: formValues.packageName.filter(
              (option) => option !== label
            ),
          }
        : {
            ...formValues,
            packageName: [...formValues.packageName, label],
          };
      setFormValues(updatedValues);

      setFormErrors({
        ...formErrors,
        packageName:
          updatedValues.packageName.length < 1 ? "Please select package" : "",
      });
    }
  };

  const registerNewUser: any = api.credentialUser.create.useMutation();
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (formValues.packageName.length === 0) {
      toast.error("Fill package Name");
      return;
    } else {
      const errors = validateFrom(formValues, addUserFormInputs);
      const isFormValid = Object.values(errors).some(Boolean);
      if (isFormValid) {
        setFormErrors(errors);
        return;
      }
      setLoading(true);

      if (formValues.password !== formValues.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (!props?.currentUserDetails?.callCenterId) {
        toast.error("You don't have any CallCenter");
        setLoading(false);
        return;
      }

      setLoading(true);
      const request: any = {
        firstName: formValues?.firstName,
        lastName: formValues?.lastName,
        email: formValues?.email,
        password: formValues?.password,
        roles: ["AGENT"],
        phone: formValues.phone.replace(/[\s-]/g, ""),
        packageName: formValues?.packageName,
        callCenterId: Number(props?.currentUserDetails?.callCenterId),
        agentRoleType: (formValues?.agent
          ? "AGENT"
          : formValues?.lead
          ? "LEAD"
          : formValues?.manager
          ? "MANAGER"
          : "NONE") as AgentRoleType,
      };
      try {
        const newUserData = await registerNewUser.mutateAsync(request);

        if (newUserData) {
          setLoading(false);
          toast.success("New user created successfully");
          setTimeout(() => {
            router.push("/lead/list");
          }, 2000);
        } else {
          setLoading(false);
          toast.error("Please try again later.", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: false,
          });
        }
      } catch (error: any) {
        if (error.data.httpStatus === 409) {
          toast.error("Email Already exists");
        } else {
          toast.error("Invalid credentials.");
        }
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : props?.currentUserDetails?.agentRoletype != "MANAGER" ? (
        <NoAccessComponent />
      ) : (
        <>
          <div className="flex px-4 py-5">
            <h1 className="text-3xl font-bold leading-6 text-gray-900">
              Add User
            </h1>
          </div>
          <form className="w-full px-5 py-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {addUserFormInputs.map((input, index) => (
                <InputField
                  key={"employee" + index}
                  input={input}
                  handlePhoneChange={handlePhoneChange}
                  handleChange={handleChange}
                  formValues={formValues}
                  formErrors={formErrors}
                  handleMultipleSelect={handleOptionChange}
                />
              ))}
              <div className="flex">
                {addUserCheckbox.map((input, index) => (
                  <InputField
                    key={"employee" + index}
                    handleChange={handleCheck}
                    input={input}
                    formValues={formValues}
                  />
                ))}
              </div>
            </div>

            <div className="my-2">
              <Button text={"Submit"} type="submit" disabled={disable} />
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default withAuth(DefaultLayout(AddNewAgent));
