import React from "react";
import { IEvent, IInput } from "~/interfaces/common/form";
import InputField from "./input";

export interface IFormProps {
  inputs: Array<IInput>;
  handleChange: (e: IEvent, index?: number) => void;
  handlePhoneChange?: (name: string, value: string, index?: number) => void;
  button?: boolean;
  formValues: { [key: string]: any };
  handleSubmit?: () => void;
  tailwindClass?: string;
  index?: number;
  formErrors?: { [key: string]: any };
  handleOptionChange?: any;
}

const FormComponent = ({
  inputs,
  handleChange,
  handlePhoneChange,
  handleOptionChange,
  button,
  formValues,
  tailwindClass,
  index,
  formErrors,
}: IFormProps) => {
  return (
    <div className={`grid w-full ${tailwindClass ?? ""}`}>
      {inputs.map((input: IInput, key: number) => {
        return (
          <InputField
            input={input}
            handleChange={handleChange}
            handleMultipleSelect={handleOptionChange}
            handlePhoneChange={handlePhoneChange as any}
            formValues={formValues}
            index={index}
            formErrors={formErrors}
            key={key + JSON.stringify(input)}
            disabled={input.disabled}
          />
        );
      })}
    </div>
  );
};

export default FormComponent;
