import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import NoAccessComponent from "~/common/noAccess";
import { api } from "~/utils/api";
import {
  AccessLevelsDefinition,
  defaultCallCenter,
  packageName,
} from "~/utils/constants";
import { createUserSteps } from "~/utils/constants/steps";
import { getMultipleAccessRoles } from "~/utils/helpers";
import { validateEmail, validatePhoneNum } from "~/utils/helpers/validations";

function CreateUserComponent(props: any) {
  const [userSteps, setUserSteps] = useState<any[]>(createUserSteps);
  const [disable, setDisable] = useState(false);
  const [formValues, setFormValues] = useState({
    newUser: {
      firstName: "",
      lastName: "",
      email: "",
      roles: [],
      phone: "",
      company: defaultCallCenter,
      packageName: [],
      password: "",
      confirmPassword: "",
    },
  });
  const [formErrors, setFormErrors] = useState({
    newUser: {
      firstName: "",
      lastName: "",
      email: "",
      roles: [],
      phone: "",
      company: defaultCallCenter,
      packageName: "",
      password: "",
      confirmPassword: "",
    },
  });
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);

  const setFormState = (form: any) => {
    setFormValues(form);
  };

  const setFormErrorState = (form: any) => {
    setFormErrors(form);
  };
  useEffect(() => {
    onClickStep(0);
  }, []);

  const handleFormInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name == "email") {
      setDisable(!validateEmail(value));
    }
    setFormValues({
      ...formValues,
      newUser: {
        ...formValues.newUser,
        [name]: value,
      },
    });
  };

  const handlePhoneChange = (name: string, value: string) => {
    setDisable(!validatePhoneNum(value));
    setFormValues({
      ...formValues,
      newUser: {
        ...formValues.newUser,
        phone: value,
      },
    });
  };

  const onClickStep = (index: number) => {
    const allSteps = userSteps.map((step: any, index1: number) => {
      if (index == index1) {
        step.status = "current";
      } else if (index > index1) {
        step.status = "complete";
      } else {
        step.status = "upcoming";
      }
      return step;
    });
    setUserSteps(allSteps);
  };

  return currentRoleAccessLevels?.Admin?.canView ? (
    <div>
      <div className="mx-6 my-4 grid grid-cols-4 gap-4">
        <div className="col-span-3 w-full">
          {userSteps.map((step: any, index) => {
            if (step.status == "current")
              return (
                <div key={index + "userstep"}>
                  {
                    <step.component
                      formValues={formValues}
                      formErrors={formErrors}
                      setFormValues={setFormState}
                      setFormErrors={setFormErrorState}
                      onClickStep={onClickStep}
                      index={index}
                      handlePhoneChange={handlePhoneChange}
                      handleFormInputChange={handleFormInputChange}
                      disable={disable}
                    />
                  }
                </div>
              );
          })}
        </div>
      </div>
    </div>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}

export default CreateUserComponent;
