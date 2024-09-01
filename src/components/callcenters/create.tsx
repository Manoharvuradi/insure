import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "~/common/buttons/filledButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { callCenterInputs } from "~/utils/constants/user";

interface ICallCenter {
  name: string;
  description: string;
}

function CreateCallcenterForm() {
  const router = useRouter();
  const [callCenterValues, setCallCenterValues] = useState({} as ICallCenter);
  const [callCenterFormErrors, setCallCenterFormErrors] = useState(
    {} as ICallCenter
  );
  const [disable, setDisable] = useState(false);
  const callCenterCreate = api.callCenter.create.useMutation();
  const handleCallCenterValues = (e: IEvent) => {
    const { name, value } = e.target;
    if (name == "description") {
      if (value.length > 50) {
        setDisable(true);
        setCallCenterFormErrors({
          ...callCenterFormErrors,
          description: "Please enter less than 50 characters",
        });
      } else {
        setCallCenterFormErrors({ ...callCenterFormErrors, description: "" });
        setDisable(false);
      }
    }
    setCallCenterValues({
      ...callCenterValues,
      [name]: value,
    });
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await callCenterCreate.mutateAsync({
        name: callCenterValues.name,
        description: callCenterValues.description,
      });
      if (response) {
        toast.success("Successfully created call center");
        router.push("/callcenters/list?name=callCenter");
      } else {
        toast.error("failed to create call center");
      }
    } catch (error) {
      toast.error("failed to create call center");
    }
  };

  return (
    <div className="m-8 mx-auto flex w-full justify-center">
      <form className="w-[40vw]" onSubmit={handleSubmit}>
        <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
          Create call center
        </h1>
        <FormComponent
          inputs={callCenterInputs}
          formValues={callCenterValues}
          formErrors={callCenterFormErrors}
          handleChange={handleCallCenterValues}
          tailwindClass=""
        />
        <div className="flex w-full justify-center">
          <div className="flex w-full justify-end">
            <Button
              disabled={disable}
              text="Save"
              className="mr-1"
              type={"submit"}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateCallcenterForm;
