import React, { useState } from "react";
import Button from "~/common/buttons/filledButton";
// import AddButton from "~/common/buttons/addButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
// import { AiOutlineDelete } from "react-icons/ai";
// import InputField from "~/common/form/input";
// import { PremiumCalculationInputs } from "~/utils/constants/premiumCalculation";
// import { IPremiumCalculationMember } from "~/interfaces/premiumCalculation";
import {
  roleCheckOptions,
  roleInputs,
  userInputs,
} from "~/utils/constants/user";
// import RadioBox from "~/common/form/radioBox";

interface IPolicyFormProps {
  handleSubmit: () => void;
}
const UserForm = () => {
  const [formValues, setFormValues] = useState<any>({});
  //   const [roles, setRoles] = useState<Array<IPremiumCalculationMember>>([]);
  //   const [rolesErrors, setRolesErrors] = useState<Array<any>>([]);
  const [formErrors, setFormErrors] = useState({});
  //   const [selectedOptions, setSelectedOptions] = useState<any>([]);

  //   const handleCheckboxChange = (event: IEvent) => {
  //     const value = event.target.value;
  //     if (selectedOptions.includes(value)) {
  //       setSelectedOptions(
  //         selectedOptions.filter((option: any) => option !== value)
  //       );
  //     } else {
  //       setSelectedOptions([...selectedOptions, value]);
  //     }
  //   };

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  //   const handleRoleInputChange = (event: IEvent, index: number) => {
  //     const { name, value } = event.target;
  //     let userRoles: any = [...roles];
  //     userRoles[index][name] = value;
  //     setRoles(userRoles);
  //   };

  //   const addRole = () => {
  //     setRoles([
  //       ...roles,
  //       {
  //         premiumAmount: 0,
  //         premiumFrequency: "",
  //         coverageAmount: 0,
  //         minimumAge: 0,
  //         maximumAge: 0,
  //       },
  //     ]);
  //     setRolesErrors([...rolesErrors, {}]);
  //   };

  //   const deleteRole = (index: number) => {
  //     const userRoles = [...roles];
  //     const userRolesErrors = [...rolesErrors];
  //     userRoles.splice(index, 1);
  //     userRolesErrors.splice(index, 1);
  //     setRoles([...userRoles]);
  //     setRolesErrors([...userRolesErrors]);
  //   };

  const handleSubmit = () => {
    let errors = false;
    if (!formValues?.options) {
      setFormErrors({
        ...formErrors,
        options: "Please select an option",
      });
      errors = true;
    }
    // roles.forEach((role, roleIndex) => {
    //   if (!role.coverageAmount || role.coverageAmount == 0) {
    //     let userRolesErrors = [...rolesErrors];
    //     userRolesErrors[roleIndex].coverageAmount = "field requied!";
    //     setRolesErrors(userRolesErrors);
    //   }
    // });
    if (errors) return;
  };

  return (
    <div className="mx-auto w-full bg-white p-5" onSubmit={handleSubmit}>
      <div className="mt-4 w-full">
        <FormComponent
          inputs={userInputs}
          formValues={formValues}
          handleChange={handleFormInputChange}
          tailwindClass="grid grid-cols-2 gap-2"
          formErrors={formErrors}
        />
      </div>
      {/* <div className="flex justify-between gap-4">
        <div className="w-full">
          <h2 className="pb-2 text-base font-semibold leading-7 text-gray-900">
            Roles
          </h2>
          <div className="rounded border border-l-8 border-blue-200 p-5">
            {roles.map((role, index) => {
              return (
                <div className="w-full p-2" key={"roles" + index}>
                  <h2 className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                    <span>Role {index + 1} </span>
                    <span>
                      <AiOutlineDelete
                        color="red"
                        onClick={() => {
                          deleteRole(index);
                        }}
                      />
                    </span>
                  </h2>
                  <div className="rounded border border-blue-200 p-5">
                    <FormComponent
                      inputs={roleInputs}
                      formValues={role}
                      handleChange={handleRoleInputChange}
                      tailwindClass="grid grid-cols-2 gap-2"
                      index={index}
                      formErrors={rolesErrors[index]}
                    />
                    <RadioBox
                      options={roleCheckOptions}
                      selectedOptions={selectedOptions}
                      handleChange={handleCheckboxChange}
                      tailwindClass="grid grid-cols-4 gap-2"
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex w-full justify-center">
              <AddButton name="Add role" handleClick={addRole} />
            </div>
          </div>
        </div>
      </div> */}

      <Button text="Submit" onClick={handleSubmit} />
    </div>
  );
};

export default UserForm;
