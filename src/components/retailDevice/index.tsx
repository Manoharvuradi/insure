import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import NoAccessComponent from "~/common/noAccess";
import Steps from "~/common/steps";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { packageNames } from "~/utils/constants";
import { retailDevicePolicySteps } from "~/utils/constants/steps";
import { getMultipleAccessRoles } from "~/utils/helpers";

function RetailDevicePolicy(props: any) {
  const router = useRouter();
  const { isLoading, data, error } = api.contacts.show.useQuery(
    Number(router.query.contactId),
    {
      enabled: router.query.contactId !== undefined,
    }
  );
  const [constactData, setContactData] = useState({} as any);

  const [policySteps, setPolicySteps] = useState(retailDevicePolicySteps);

  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const [formValues, setFormValues] = useState({
    package: packageNames.retailDeviceInsurance,
    beneficiaries: [{}],
    creditLifeBeneficiaries: [{}],
    paymentMethod: [{}],
    deviceCatalog: {},
    phone: `${
      data?.phone ? "+27" + data.phone.substring(1, data.phone.length) : ""
    }` as any,
  });

  const [formErrors, setFormErrors] = useState({
    package: "",
    mainMember: {},
    beneficiaries: [],
    creditLifeBeneficiaries: [],
    paymentMethod: {},
  });

  useEffect(() => {
    if (data) {
      setContactData(data);
    }
  }, [data]);

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

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

  return currentRoleAccessLevels?.Leads?.canCreate ? (
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
                    contactData={constactData}
                    formValues={formValues}
                    formErrors={formErrors}
                    setFormValues={setFormValues}
                    setFormErrors={setFormErrors}
                    onClickStep={onClickStep}
                    index={index}
                    handleFormInputChange={handleFormInputChange}
                    userType={props.userType}
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

export default RetailDevicePolicy;
