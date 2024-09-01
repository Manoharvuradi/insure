import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { validate } from "uuid";
import NoAccessComponent from "~/common/noAccess";
import Steps from "~/common/steps";
import { creatClaimsSteps } from "~/utils/constants/steps";
import { getMultipleAccessRoles } from "~/utils/helpers";
import { validateEmail, validatePhoneNum } from "~/utils/helpers/validations";

const CreateClaimComponent = (props: any) => {
  const [claimSteps, setClaimSteps] = useState<any[]>(creatClaimsSteps);
  const [disable, setDisable] = useState(false);
  const [claimantFormValues, setClaimFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    relation: "",
    phone: "",
  });
  const [claimantFormErrors, setClaimantFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    relation: "",
    phone: "",
  });
  const setFormState = (form: any) => {
    setClaimFormValues(form);
  };

  const setFormErrorState = (form: any) => {
    setClaimantFormErrors(form);
  };
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  useEffect(() => {
    onClickStep(0);
  }, []);

  const handleFormInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setClaimFormValues({
      ...claimantFormValues,
      [name]: value,
    });
    if (name == "email") {
      if (validateEmail(value)) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  };

  const handlePhoneNumber = (name: string, value: string) => {
    setDisable(!validatePhoneNum(value));
    setClaimFormValues({
      ...claimantFormValues,
      phone: value,
    });
  };

  const onClickStep = (index: number) => {
    const allSteps = claimSteps.map((step: any, index1: number) => {
      if (index == index1) {
        step.status = "current";
      } else if (index > index1) {
        step.status = "complete";
      } else {
        step.status = "upcoming";
      }
      return step;
    });
    setClaimSteps(allSteps);
  };

  return currentRoleAccessLevels?.Claim?.canCreate ? (
    <div>
      <div className="mx-6 my-4 grid grid-cols-4 gap-4">
        <div className="sticky top-3 col-span-1 pt-2">
          <Steps steps={claimSteps} />
        </div>
        <div className="col-span-3 w-full">
          {claimSteps.map((step: any, index) => {
            if (step.status == "current")
              return (
                <div key={index + "policystep"}>
                  {
                    <step.component
                      claimantFormValues={claimantFormValues}
                      claimantFormErrors={claimantFormErrors}
                      setClaimFormValues={setFormState}
                      setClaimFormErrors={setFormErrorState}
                      onClickStep={onClickStep}
                      index={index}
                      handleFormInputChange={handleFormInputChange}
                      handlePhoneNumberChange={handlePhoneNumber}
                      resource="claim"
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
};

export default CreateClaimComponent;
