import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import NoAccessComponent from "~/common/noAccess";
import Steps from "~/common/steps";
import DefaultLayout from "~/components/defaultLayout";
import { IEvent } from "~/interfaces/common/form";
import { AccessLevelsDefinition } from "~/utils/constants";
import { creatComplaintSteps } from "~/utils/constants/steps";
import { getMultipleAccessRoles } from "~/utils/helpers";

const CreateComplaintComponent = (props: any) => {
  const [complaintSteps, setComplaintSteps] =
    useState<any[]>(creatComplaintSteps);
  const [complaintFormValues, setComplaintFormValues] = useState({
    complainantFirstName: "",
    complainantLastName: "",
    complainantEmail: "",
    complainantMobileNumber: "",
    reason: "",
  });
  const [complaintFormErrors, setComplaintFormErrors] = useState({
    complainantFirstName: "",
    complainantLastName: "",
    complainantEmail: "",
    complainantMobileNumber: "",
    reason: "",
  });
  const session = useSession();

  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const setFormState = (form: any) => {
    setComplaintFormValues(form);
  };

  const setFormErrorState = (form: any) => {
    setComplaintFormErrors(form);
  };
  useEffect(() => {
    onClickStep(0);
  }, []);

  const handleFormInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setComplaintFormValues({
      ...complaintFormValues,
      [name]: value,
    });
  };

  const onClickStep = (index: number) => {
    const allSteps = complaintSteps.map((step: any, index1: number) => {
      if (index == index1) {
        step.status = "current";
      } else if (index > index1) {
        step.status = "complete";
      } else {
        step.status = "upcoming";
      }
      return step;
    });
    setComplaintSteps(allSteps);
  };

  return currentRoleAccessLevels?.Complaints?.canCreate ? (
    <div>
      <div className="mx-6 my-4 grid grid-cols-4 gap-4">
        <div className="sticky top-3 col-span-1 pt-2">
          <Steps steps={complaintSteps} />
        </div>
        <div className="col-span-3 w-full">
          {complaintSteps.map((step: any, index) => {
            if (step.status == "current")
              return (
                <div key={index + "policystep"}>
                  {
                    <step.component
                      complaintFormValues={complaintFormValues}
                      complaintFormErrors={complaintFormErrors}
                      setComplaintFormValues={setFormState}
                      setComplaintFormErrors={setFormErrorState}
                      onClickStep={onClickStep}
                      index={index}
                      handleFormInputChange={handleFormInputChange}
                      resource={"complaint"}
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

export default CreateComplaintComponent;
