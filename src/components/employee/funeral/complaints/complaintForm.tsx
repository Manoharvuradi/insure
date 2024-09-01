import React, { useState } from "react";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import DescriptionInput from "~/common/form/descriptionInput";
import FileUpload from "~/common/form/fileUpload";
import { complainFormInputs } from "~/utils/constants/complaints";
import Button from "~/common/buttons/filledButton";

interface IPolicyFormProps {
  handleSubmit: () => void;
}
const ComplaintForm = () => {
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [files, setFiles] = useState<any>([]);

  const handleSubmit = () => {};

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleFileChange = (event: IEvent) => {
    const selectedFiles = event.target.files;
    setFiles((prevFiles: any) => [...prevFiles, ...selectedFiles]);
  };

  return (
    <div className="mx-auto w-full bg-white p-5">
      <div className="mt-4 w-full">
        <FormComponent
          inputs={complainFormInputs}
          formValues={formValues}
          handleChange={handleFormInputChange}
          tailwindClass="grid grid-cols-2 gap-4"
          formErrors={formErrors}
        />
      </div>
      <div className="mt-2">
        <FileUpload handleFileChange={handleFileChange} files={files} />
      </div>
      <div className="mt-2">
        <DescriptionInput
          input={{
            label: "App data",
            type: "text",
            name: "appData",
          }}
          handleChange={handleFormInputChange}
          formValues={formValues}
          formErrors={formErrors}
        />
      </div>
      <Button text="Submit" onClick={handleSubmit} />
    </div>
  );
};

export default ComplaintForm;
