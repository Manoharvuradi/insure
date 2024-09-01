import { useState } from "react";
import Button from "~/common/buttons/filledButton";
import InputField from "~/common/form/input";
import { IClaimComplaintStepComponentProps } from "~/interfaces/claimComplaint";
import { IEvent } from "~/interfaces/common/form";
import { complaintFormInputs } from "~/utils/constants/complaints";
import { validateEmail, validatePhoneNum } from "~/utils/helpers/validations";

export const ComplaintForm = ({
  complaintFormValues,
  complaintFormErrors,
  setComplaintFormValues,
  onClickStep,
  index,
}: IClaimComplaintStepComponentProps) => {
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onClickStep(index + 1);
  };

  const handleFormInputChange = (e: IEvent, inputIndex?: number) => {
    const { name, value } = e.target;
    if (name == "complainantEmail") {
      setIsFormValid(!validateEmail(value));
    } else if (name === "reason") {
      if (value === "" || value.length >= 50) {
        setIsFormValid(false);
      } else {
        setIsFormValid(true);
      }
    }
    setComplaintFormValues((prevFormValues: any) => {
      const updatedFormValues = {
        ...prevFormValues,
        [name]: value,
      };
      return updatedFormValues;
    });
  };

  const handlePhoneNumber = (name: string, value: string) => {
    setIsFormValid(!validatePhoneNum(value));
    setComplaintFormValues({
      ...complaintFormValues,
      [name]: value,
    });
  };
  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {complaintFormInputs.map((input, index) => (
          <InputField
            key={"employee" + index}
            input={input}
            handleChange={handleFormInputChange}
            handlePhoneChange={handlePhoneNumber}
            formValues={complaintFormValues}
            formErrors={complaintFormErrors}
          />
        ))}
      </div>
      <div className="my-2">
        <Button text={"Next"} type="submit" disabled={isFormValid} />
      </div>
    </form>
  );
};

export default ComplaintForm;
