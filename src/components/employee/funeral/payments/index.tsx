import React, { useState } from "react";
import InputField from "~/common/form/input";
import { IEvent, IInput } from "~/interfaces/common/form";

export interface IPaymentFormProps {
  inputs: Array<IInput>;

  handleSubmit?: () => void;
  tailwindClass?: string;
  index?: number;
}

const PaymentsForm = ({ inputs }: IPaymentFormProps) => {
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = () => {};

  const handleFormInputChange = (event: IEvent) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <div className="mx-auto w-full bg-white p-5">
      <div className="grid w-full grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {inputs.map((input: IInput, key: number) => {
          return (
            <div className={`${input.name == "reason" ? "col-span-2" : ""}`}>
              <InputField
                input={input}
                handleChange={handleFormInputChange}
                formValues={formValues}
                formErrors={formErrors}
                key={key * Math.random()}
              />
            </div>
          );
        })}
      </div>
      <button
        className="focus:shadow-outline rounded bg-primary-blue px-4 py-2 font-bold text-white  transition duration-300 hover:bg-hover-blue focus:outline-none"
        type="submit"
      >
        Submit
      </button>
    </div>
  );
};

export default PaymentsForm;
