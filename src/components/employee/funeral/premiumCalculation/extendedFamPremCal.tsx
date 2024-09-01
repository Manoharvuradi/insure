import React, { useState } from "react";
import AddButton from "~/common/buttons/addButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import { AiOutlineDelete } from "react-icons/ai";
import InputField from "~/common/form/input";
import { PremiumCalculationInputs } from "~/utils/constants/premiumCalculation";
import { IPremiumCalculationMember } from "~/interfaces/premiumCalculation";
import Button from "~/common/buttons/filledButton";

interface IPolicyFormProps {
  handleSubmit: () => void;
}
const ExtFamPremiumCalcForm = () => {
  const [formValues, setFormValues] = useState<any>({});
  const [extended, setExtended] = useState<Array<IPremiumCalculationMember>>(
    []
  );
  const [extendedErrors, setExtendedErrors] = useState<Array<any>>([]);
  const [formErrors, setFormErrors] = useState({});

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleExtFamInputChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    let extendedFamily: any = [...extended];
    extendedFamily[index][name] = value;
    setExtended(extendedFamily);
  };

  const addMember = () => {
    setExtended([
      ...extended,
      {
        premiumAmount: 0,
        premiumFrequency: "",
        coverageAmount: 0,
        minimumAge: 0,
        maximumAge: 0,
      },
    ]);
    setExtendedErrors([...extendedErrors, {}]);
  };

  const deleteMember = (index: number) => {
    const extendedFamily = [...extended];
    const extendedFamilyErrors = [...extendedErrors];
    extendedFamily.splice(index, 1);
    extendedFamilyErrors.splice(index, 1);
    setExtended([...extendedFamily]);
    setExtendedErrors([...extendedFamilyErrors]);
  };

  const handleSubmit = () => {
    let errors = false;
    if (!formValues?.options) {
      setFormErrors({
        ...formErrors,
        options: "Please select an option",
      });
      errors = true;
    }
    extended.forEach((family, familyIndex) => {
      if (!family.coverageAmount || family.coverageAmount == 0) {
        let extendedFamilyErrors = [...extendedErrors];
        extendedFamilyErrors[familyIndex].coverageAmount = "field requied!";
        setExtendedErrors(extendedFamilyErrors);
      }
    });
    if (errors) return;
  };

  return (
    <div className="mx-auto w-full bg-white p-5" onSubmit={handleSubmit}>
      <div className="mt-4 w-full">
        <InputField
          input={{
            label: "Options",
            type: "text",
            name: "options",
            required: true,
          }}
          handleChange={handleFormInputChange}
          formValues={formValues}
          formErrors={formErrors}
        />
      </div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Extended family
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            {extended.map((member, index) => {
              return (
                <div className="w-full p-2" key={"extended" + index}>
                  <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                    <span>Member {index + 1} </span>
                    <span>
                      <AiOutlineDelete
                        color="red"
                        onClick={() => {
                          deleteMember(index);
                        }}
                      />
                    </span>
                  </h2>
                  <div className="rounded border border-blue-200 p-5">
                    <FormComponent
                      inputs={PremiumCalculationInputs}
                      formValues={extended}
                      handleChange={handleExtFamInputChange}
                      tailwindClass="grid grid-cols-2 gap-2"
                      index={index}
                      formErrors={extendedErrors[index]}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex w-full justify-center">
              <AddButton name="Add member" handleClick={addMember} />
            </div>
          </div>
        </div>
      </div>
      <Button text="Submit" onClick={handleSubmit} />
    </div>
  );
};

export default ExtFamPremiumCalcForm;
