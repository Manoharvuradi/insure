import React, { useState } from "react";
import AddButton from "~/common/buttons/addButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import {
  policyExtendMemberInputs,
  policyMemberInputs,
  policyPremiumInputs,
} from "~/utils/constants/policy";
import { AiOutlineDelete } from "react-icons/ai";
import Button from "~/common/buttons/filledButton";

interface IPolicyFormProps {
  handleSubmit: () => void;
}
const QuotationForm = () => {
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

  const handleExtendInputChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    let extendedFamily = [...extended];
    extendedFamily[index][name] = value;
    setExtended(extendedFamily);
  };

  const addNewMember = (type: string) => {
    switch (type) {
      case "child":
        setChildrenDetails([...childrenDetails, {}]);
        break;
      case "extended":
        setExtended([...extended, {}]);
        break;
      default:
        break;
    }
  };

  const deleteMember = (index: number, type: string) => {
    switch (type) {
      case "child":
        const children = [...childrenDetails];
        children.splice(index, 1);
        setChildrenDetails([...children]);
        break;
      case "extended":
        const extendedMembers = [...extended];
        extendedMembers.splice(index, 1);
        setExtended([...extendedMembers]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="mx-auto w-full bg-white p-5" onSubmit={handleSubmit}>
      <div className="mt-4 w-full">
        <FormComponent
          inputs={policyPremiumInputs}
          formValues={formValues}
          handleChange={handleFormInputChange}
          tailwindClass="grid grid-cols-2 gap-4"
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
              inputs={policyMemberInputs}
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
              inputs={policyMemberInputs}
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
                          deleteMember(index, "child");
                        }}
                      />
                    </span>
                  </h2>
                  <div className="rounded border border-blue-200 p-5">
                    <FormComponent
                      inputs={policyMemberInputs}
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
              <AddButton
                name="Add Child"
                handleClick={() => addNewMember("child")}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Extended Family
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            {extended.map((member, index) => {
              return (
                <div className="w-full p-2" key={"extend" + index}>
                  <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                    <span>Member {index + 1} </span>
                    <span className="hover:pointer">
                      <AiOutlineDelete
                        color="red"
                        onClick={() => {
                          deleteMember(index, "extended");
                        }}
                      />
                    </span>
                  </h2>
                  <div className="rounded border border-blue-200 p-5">
                    <FormComponent
                      inputs={policyExtendMemberInputs}
                      formValues={member}
                      handleChange={handleExtendInputChange}
                      tailwindClass="grid grid-cols-2 gap-2"
                      index={index}
                      formErrors={extendedErrors[index]}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex w-full justify-center">
              <AddButton
                name="Add new member"
                handleClick={() => addNewMember("extended")}
              />
            </div>
          </div>
        </div>
      </div>
      <Button text="Submit" onClick={handleSubmit} />
    </div>
  );
};

export default QuotationForm;
