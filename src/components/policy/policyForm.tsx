import React, { useState } from "react";
import AddButton from "~/common/buttons/addButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import {
  applicationInputs,
  policyBeneficiaryInputs,
  policyExtendMemberInputs,
  policyFormInputs,
  policyMemberInputs,
  policyPremiumInputs,
} from "~/utils/constants/policy";
import { AiOutlineDelete } from "react-icons/ai";
import DescriptionInput from "~/common/form/descriptionInput";
import FileUpload from "~/common/form/fileUpload";
import Button from "~/common/buttons/filledButton";

interface IPolicyFormProps {
  handleSubmit?: () => void;
  title?: string;
}
const PolicyForm = ({ title }: IPolicyFormProps) => {
  const [formValues, setFormValues] = useState({});
  const [childrenDetails, setChildrenDetails] = useState<Array<any>>([]);
  const [mainMember, setMainMember] = useState({});
  const [spouse, setSpouse] = useState({});
  const [extended, setExtended] = useState<Array<any>>([]);
  const [beneficiaries, setBeneficiaries] = useState<Array<any>>([]);
  const [formErrors, setFormErrors] = useState({});
  const [childrenErrors, setChildrenErrors] = useState<Array<any>>([]);
  const [mainMemberErrors, setMainMemberErrors] = useState({});
  const [spouseErrors, setSpouseErrors] = useState({});
  const [extendedErrors, setExtendedErrors] = useState<Array<any>>([]);
  const [beneficiaryErrors, setBeneficiaryErrors] = useState<Array<any>>([]);
  const [files, setFiles] = useState<any>([]);

  const handleSubmit = () => {};

  const handleMainMemberInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setMainMember({ ...mainMember, [name]: value });
  };

  const handleSpouseInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setSpouse({ ...spouse, [name]: value });
  };

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
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
  const handleBeneficiaryInputChange = (event: IEvent, index: number = 0) => {
    const { name, value } = event.target;
    let beneficiaryDetails = [...beneficiaries];
    beneficiaryDetails[index][name] = value;
    setBeneficiaries(beneficiaryDetails);
  };

  const handleFileChange = (event: IEvent) => {
    const selectedFiles = event.target.files;
    setFiles((prevFiles: any) => [...prevFiles, ...selectedFiles]);
  };

  const addNewMember = (type: string) => {
    switch (type) {
      case "child":
        setChildrenDetails([...childrenDetails, {}]);
        setChildrenErrors([...childrenErrors, {}]);
        break;
      case "extended":
        setExtended([...extended, {}]);
        setExtendedErrors([...extendedErrors, {}]);
        break;
      case "beneficiary":
        setBeneficiaries([...beneficiaries, {}]);
        setBeneficiaryErrors([...beneficiaryErrors, {}]);
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
        const childrenErrorsArr = [...childrenErrors];
        childrenErrorsArr.splice(index, 1);
        setChildrenDetails([...childrenErrorsArr]);
        break;
      case "extended":
        const extendedMembers = [...extended];
        extendedMembers.splice(index, 1);
        setExtended([...extendedMembers]);
        const extendedMemberErrors = [...extendedErrors];
        extendedMemberErrors.splice(index, 1);
        setExtended([...extendedMemberErrors]);
        break;
      case "beneficiary":
        const beneficiaryDetails = [...beneficiaries];
        beneficiaryDetails.splice(index, 1);
        setBeneficiaries([...beneficiaryDetails]);
        const beneficiariesErrors = [...beneficiaryErrors];
        beneficiariesErrors.splice(index, 1);
        setBeneficiaryErrors([...beneficiariesErrors]);
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
                      tailwindClass="grid grid-cols-2 gap-4"
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
                      tailwindClass="grid grid-cols-2 gap-4"
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
      <div className="mt-4 w-full">
        <FormComponent
          inputs={title == "policy" ? policyFormInputs : applicationInputs}
          formValues={formValues}
          handleChange={handleFormInputChange}
          tailwindClass="grid grid-cols-2 gap-4"
          formErrors={formErrors}
        />
      </div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Beneficiaries
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            {beneficiaries.map((beneficiary, index) => {
              return (
                <div className="w-full p-2" key={"beneficiary" + index}>
                  <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                    <span>Beneficiary {index + 1} </span>
                    <span>
                      <AiOutlineDelete
                        color="red"
                        onClick={() => {
                          deleteMember(index, "beneficiary");
                        }}
                      />
                    </span>
                  </h2>
                  <div className="rounded border border-blue-200 p-5">
                    <FormComponent
                      inputs={policyBeneficiaryInputs}
                      formValues={beneficiary}
                      handleChange={handleBeneficiaryInputChange}
                      tailwindClass="grid grid-cols-2 gap-4"
                      index={index}
                      formErrors={beneficiaryErrors[index]}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex w-full justify-center">
              <AddButton
                name="Add new Beneficiary"
                handleClick={() => addNewMember("beneficiary")}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <FileUpload handleFileChange={handleFileChange} files={files} />
      </div>
      <div className="my-2">
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

export default PolicyForm;
