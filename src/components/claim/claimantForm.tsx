import { setDefaultResultOrder } from "dns";
import { useEffect, useState } from "react";
import Button from "~/common/buttons/filledButton";
import InputField from "~/common/form/input";
import { IClaimComplaintStepComponentProps } from "~/interfaces/claimComplaint";
import { claimantFormInputs } from "~/utils/constants/claims";
import { validateFrom } from "~/utils/helpers/validations";

export const ClaimantForm = ({
  claimantFormValues,
  claimantFormErrors,
  setClaimFormValues,
  onClickStep,
  index,
  handleFormInputChange,
  handlePhoneNumberChange,
  disable,
}: IClaimComplaintStepComponentProps) => {
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState({} as any);
  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const errors = validateFrom(claimantFormValues, claimantFormInputs);
    const isFormValid = Object.values(errors).some(Boolean);
    if (isFormValid) {
      setFormErrors(errors);
      return;
    }
    onClickStep(index + 1);
  };

  const handlePhoneNumber = (name: string, value: string) => {
    setClaimFormValues({
      ...claimantFormValues,
      phone: value,
    });
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {claimantFormInputs.map((input, index) => (
          <InputField
            key={"employee" + index}
            input={input}
            handleChange={handleFormInputChange}
            handlePhoneChange={handlePhoneNumberChange}
            formValues={claimantFormValues}
            formErrors={formErrors}
          />
        ))}
      </div>
      <div className="my-2">
        <Button text={"Submit"} type="submit" disabled={disable} />
      </div>
    </form>
  );
};

export default ClaimantForm;
