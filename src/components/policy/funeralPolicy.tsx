import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import NoAccessComponent from "~/common/noAccess";
import Steps from "~/common/steps";
import { IEvent } from "~/interfaces/common/form";
import { AccessLevelsDefinition } from "~/utils/constants";
import { createPolicySteps } from "~/utils/constants/steps";
import { getMultipleAccessRoles } from "~/utils/helpers";

export default function FuneralPolicy(props: any) {
  const [policySteps, setPolicySteps] = useState(createPolicySteps);
  const [formValues, setFormValues] = useState({
    package: "EMPLOYEE_FUNERAL_INSURANCE",
    children: [{ isDisabled: false, isStudying: false, isStillBorn: false }],
    extendedFamily: [{}],
    beneficiaries: [{}],
    spouse: [{}],
    paymentMethod: null,
    next: false,
    withFreeBenefit: true,
  });
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);

  const [formErrors, setFormErrors] = useState({
    package: "",
    mainMember: {},
    spouse: [{}],
    children: [{}],
    extendedFamily: [{}],
    beneficiaries: [{}],
    paymentMethod: {},
  });

  const setFormState = (form: any) => {
    setFormValues(form);
  };

  const setFormErrorState = (form: any) => {
    setFormErrors(form);
  };

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const clearSteps = () => {
    const allSteps = policySteps.map((step: any, index1: number) => {
      if (index1 === 0) {
        step.status = "current";
      } else {
        step.status = "upcoming";
      }
      return step;
    });
    setPolicySteps(allSteps);
  };

  useEffect(() => {
    clearSteps();
  }, []);

  const onClickStep = (index: number) => {
    const allSteps = policySteps.map((step: any, index1: number) => {
      if (index == index1) {
        step.status = "current";
      } else if (index > index1) {
        step.status = "complete";
      } else {
        step.status = "upcoming";
      }
      return step;
    });
    setPolicySteps(allSteps);
  };

  return currentRoleAccessLevels?.Policy?.canCreate ||
    currentRoleAccessLevels?.Application?.canCreate ? (
    <div className="mx-6 my-4 grid grid-cols-4 gap-4">
      <div className="sticky top-3 col-span-1 pt-2">
        <Steps steps={policySteps} />
      </div>
      <div className="col-span-3 w-full">
        {policySteps.map((step: any, index) => {
          if (step.status == "current")
            return (
              <div key={index + "policystep"}>
                {
                  <step.component
                    formValues={formValues}
                    formErrors={formErrors}
                    setFormValues={setFormState}
                    setFormErrors={setFormErrorState}
                    onClickStep={onClickStep}
                    index={index}
                    handleFormInputChange={handleFormInputChange}
                  />
                }
              </div>
            );
        })}
      </div>
    </div>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}
