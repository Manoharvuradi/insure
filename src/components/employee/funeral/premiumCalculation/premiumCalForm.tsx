import React, { useState } from "react";
import AddButton from "~/common/buttons/addButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import { policyExtendMemberInputs } from "~/utils/constants/policy";
import { AiOutlineDelete } from "react-icons/ai";
import InputField from "~/common/form/input";
import { PremiumCalculationInputs } from "~/utils/constants/premiumCalculation";
import Button from "~/common/buttons/filledButton";

interface IPolicyFormProps {
  handleSubmit: () => void;
}
const PremiumCalculationForm = () => {
  const [formValues, setFormValues] = useState({});
  const [childrenDetails, setChildrenDetails] = useState<Array<any>>([]);
  const [mainMember, setMainMember] = useState({});
  const [spouse, setSpouse] = useState({});
  const [extended, setExtended] = useState<Array<any>>([]);
  const [childrenErrors, setChildrenErrors] = useState<Array<any>>([]);
  const [mainMemberErrors, setMainMemberErrors] = useState({});
  const [spouseErrors, setSpouseErrors] = useState({});
  const [extendedErrors, setExtendedErrors] = useState<Array<any>>([]);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = () => {};
  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };
  const handleMainMemberInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setMainMember({ ...mainMember, [name]: value });
  };

  const handleSpouseInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setSpouse({ ...spouse, [name]: value });
  };

  const handleChildrenInputChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    let children = [...childrenDetails];
    children[index][name] = value;
    setChildrenDetails(children);
  };

  const addChild = () => {
    setChildrenDetails([...childrenDetails, {}]);
  };

  const deleteChild = (index: number) => {
    const children = [...childrenDetails];
    children.splice(index, 1);
    setChildrenDetails([...children]);
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
            options: [
              { label: "A", value: "a" },
              { label: "B", value: "b" },
              { label: "C", value: "c" },
              { label: "D", value: "d" },
              { label: "E", value: "e" },
              { label: "Telkom free Benefit", value: "TELKOM_FREE_BENEFIT" },
            ],
          }}
          handleChange={handleFormInputChange}
          formValues={formValues}
          formErrors={formErrors}
        />
      </div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Main member
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            <FormComponent
              inputs={PremiumCalculationInputs}
              formValues={mainMember}
              handleChange={handleMainMemberInputChange}
              formErrors={mainMemberErrors}
            />
          </div>
        </div>
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Spouse
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            <FormComponent
              inputs={PremiumCalculationInputs}
              formValues={spouse}
              handleChange={handleSpouseInputChange}
              formErrors={spouseErrors}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Children
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            {childrenDetails.map((child, index) => {
              return (
                <div className="w-full p-2" key={"child" + index}>
                  <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                    <span>Child {index + 1} </span>
                    <span>
                      <AiOutlineDelete
                        color="red"
                        onClick={() => {
                          deleteChild(index);
                        }}
                      />
                    </span>
                  </h2>
                  <div className="rounded border border-blue-200 p-5">
                    <FormComponent
                      inputs={PremiumCalculationInputs}
                      formValues={child}
                      handleChange={handleChildrenInputChange}
                      tailwindClass="grid grid-cols-2 gap-2"
                      index={index}
                      formErrors={childrenErrors[index]}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex w-full justify-center">
              <AddButton name="Add Child" handleClick={addChild} />
            </div>
          </div>
        </div>
      </div>
      <Button text="Submit" onClick={handleSubmit} />
    </div>
  );
};

export default PremiumCalculationForm;
