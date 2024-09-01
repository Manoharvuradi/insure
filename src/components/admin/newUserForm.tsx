import React, { useState, useEffect } from "react";
import Button from "~/common/buttons/filledButton";
import InputField from "~/common/form/input";
import { IEvent, IOption } from "~/interfaces/common/form";
import { IUserStepComponentForm } from "~/interfaces/user";
import {
  agent,
  agentLead,
  agentManager,
  defaultCallCenter,
  registerFormInputs,
} from "~/utils/constants";
import { ToastContainer, toast } from "react-toastify";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Loader from "~/common/loader";
import { UNSAFE_useScrollRestoration } from "react-router-dom";
import { employeeIds } from "~/utils/constants/policyholder";
import { validateFrom } from "~/utils/helpers/validations";
import { IOptions } from "~/interfaces/common";
import { AgentRoleType, UserRole, eventName } from "@prisma/client";
import { roleValues } from "~/utils/constants/user";
import Filter from "~/common/filter";
import AddButton from "~/common/buttons/addButton";
import Modal from "~/common/Modal";
import { AnyNsRecord } from "dns";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Pagination from "~/common/Pagination";
import ComponentLoader from "~/common/componentLoader";

const NewUserForm = ({
  formValues,
  formErrors,
  setFormValues,
  setFormErrors,
  handlePhoneChange,
  handleFormInputChange,
  disable,
}: IUserStepComponentForm) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formDataErrors, setFormDataErrors] = useState({});
  const { isLoading, data, error } = api.callCenter.list.useQuery({
    showPagination: false,
  });

  const [searchText, setSearchText] = useState("");
  const [searchForm, setSearchForm] = useState(false);
  const [fullNamesArray, setFullNamesArray] = useState([] as any);
  const [selectedUsers, setSelectedUsers] = useState([] as any);
  const [previousSelectedUsers, setPreviousSelectedUsers] = useState([] as any);
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [filteredRoleCounts, setFilteredRoleCounts] = useState({
    managerCount: 0,
    leadCount: 0,
    agentCount: 0,
  });
  const [show, setShow] = useState(false);
  const [agentRole, setAgentRole] = useState({
    agent: false,
    lead: false,
    manager: false,
  });
  const itemsPerPage = 10;
  const handlePage = () => {
    refetch();
  };
  const handleOptionChange = (name: any, label: any, index: number = 0) => {
    if (label === "Package Name") {
      if (formValues.newUser?.packageName?.includes(name)) {
        const options = formValues.newUser?.packageName?.filter(
          (option: any) => option != name
        );
        setFormValues({
          ...formValues,
          newUser: {
            ...formValues.newUser,
            packageName: [...options],
          },
        });
        if (formValues.newUser.packageName.length < 2) {
          setFormErrors({
            ...formErrors,
            newUser: {
              ...formErrors.newUser,
              packageName: "Please select package",
            },
          });
        }
      } else {
        setFormValues({
          ...formValues,
          newUser: {
            ...formValues.newUser,
            packageName: [...formValues.newUser?.packageName, name],
          },
        });
        if (formValues.newUser.packageName.length < 1) {
          setFormErrors({
            ...formErrors,
            newUser: {
              ...formErrors.newUser,
              packageName: "",
            },
          });
        }
      }
    } else if (label === "Roles") {
      if (formValues.newUser?.roles?.includes(name)) {
        const options = formValues.newUser?.roles?.filter(
          (role: any) => role != name
        );
        setFormValues({
          ...formValues,
          newUser: {
            ...formValues.newUser,
            roles: [...options],
          },
        });
        if (formValues.newUser.roles.length < 2) {
          setFormErrors({
            ...formErrors,
            newUser: {
              ...formErrors.newUser,
              roles: "Please select a role",
            },
          });
        }
      } else {
        setFormValues({
          ...formValues,
          newUser: {
            ...formValues.newUser,
            roles: [...formValues.newUser?.roles, name],
          },
        });
        if (formValues.newUser.roles.length < 1) {
          setFormErrors({
            ...formErrors,
            newUser: {
              ...formErrors.newUser,
              roles: "",
            },
          });
        }
      }
    }
  };
  const {
    isLoading: userDataLoading,
    data: userData,
    error: hasError,
    refetch,
    isFetching,
  } = api.credentialUser.list.useQuery({
    pageSize: itemsPerPage.toString(),
    offset: currentOffeset.toString(),
    search: searchText,
    filter: "AGENT",
    ...(formValues?.newUser?.company && {
      companyId: formValues?.newUser?.company,
    }),
    email: formValues?.newUser?.email,
  });

  useEffect(() => {
    if (userData?.isArchived) {
      if (userData?.isArchived?.isArchived) {
        setShow(true);
      } else {
        setShow(false);
      }
    }
  }, [userData]);

  const registerNewUser = api.credentialUser.create.useMutation();
  const unArchiveUser = api.credentialUser.unArchive.useMutation();

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (formValues.newUser.packageName.length === 0) {
      toast.error("Fill package Name");
      return;
    } else if (formValues.newUser.roles.length === 0) {
      toast.error("Fill user role");
      return;
    } else {
      const errors = validateFrom(formValues?.newUser, registerFormInputs);
      const isFormValid = Object.values(errors).some(Boolean);
      if (isFormValid) {
        setFormDataErrors(errors);
        return;
      }
      setLoading(true);

      if (
        formValues.newUser?.password !== formValues.newUser?.confirmPassword
      ) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      setLoading(true);
      const request = {
        firstName: formValues.newUser?.firstName,
        lastName: formValues.newUser?.lastName,
        email: formValues.newUser?.email,
        password: formValues.newUser?.password,
        roles: formValues.newUser?.roles,
        phone: formValues.newUser.phone.replace(/[\s-]/g, ""),
        packageName: formValues.newUser?.packageName,
        ...(formValues.newUser.roles.includes(UserRole.AGENT) && {
          callCenterId: Number(formValues.newUser.company),
        }),
        ...(formValues.newUser.roles.includes(UserRole.AGENT) && {
          reportsTo: selectedUsers,
        }),
        agentRoleType: (agentRole.agent
          ? "AGENT"
          : agentRole.lead
          ? "LEAD"
          : agentRole.manager
          ? "MANAGER"
          : "NONE") as AgentRoleType,
      };
      try {
        const newUserData = await registerNewUser.mutateAsync(request);

        if (newUserData) {
          setLoading(false);
          toast.success("New user created successfully");
          setTimeout(() => {
            router.push("/admin/users");
          }, 2000);
        } else {
          setLoading(false);
          toast.error("Please try again later.", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: false,
          });
        }
      } catch (error: any) {
        if (error.data.httpStatus === 409) {
          toast.error("Email Already exists");
        } else {
          toast.error("Invalid credentials.");
        }
      } finally {
        setLoading(false);
      }
    }
  };
  const [callCenterNames, setCallCenterNames] = useState<IOption[]>([]);
  useEffect(() => {
    if (searchForm) {
      setPreviousSelectedUsers(selectedUsers);
    }
  }, [searchForm]);

  useEffect(() => {
    const updatedCallCenters =
      data &&
      data.data.map((callcenter: any) => {
        return {
          id: callcenter?.callCenterId,
          label: callcenter?.callCenterName as string,
          value: callcenter?.callCenterId.toString(),
        };
      });
    if (updatedCallCenters) {
      setCallCenterNames([
        {
          id: 0,
          label: "Select",
          value: "",
        },
        ...updatedCallCenters,
      ]);
    }
  }, [data]);

  const company = {
    label: "Call center",
    type: "select",
    name: "company",
    required: true,
    options: callCenterNames,
  };

  const handleDropDown = (event: any, index: number = 0) => {
    setFormValues({
      ...formValues,
      newUser: {
        ...formValues.newUser,
        company: Number(event.target.value),
      },
    });
  };

  const handleCheckBox = (event: any, index: number = 0) => {
    setSelectedUsers([]);

    const roleMapping: any = {
      addAgent: "agent",
      addLead: "lead",
      addManager: "manager",
    };

    setAgentRole((prevAgentRole) => ({
      ...prevAgentRole,
      agent: false,
      lead: false,
      manager: false,
      [roleMapping[event.target.name]]: event.target.checked,
    }));
  };

  function fullName(user: any) {
    const isAgent = user.reportsTo.length === 2;
    const isLead = user.reportsTo.length === 1;
    const isManager = user.reportsTo.length === 0;
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      isLead: isLead,
      isManager: isManager,
      isAgent: isAgent,
      reportsTo: user?.reportsTo,
    };
  }
  useEffect(() => {
    const userNames: [] = userData?.data.map(fullName);
    setFullNamesArray(userNames);
    const count = userNames?.filter((data) => filterUsersByRole(data)).length;
    setFilteredCount(count);

    const initialCounts = userNames?.reduce(
      (accumulator: any, user: any) => {
        if (user.isManager) {
          accumulator.managerCount += 1;
        }
        if (user.isLead) {
          accumulator.leadCount += 1;
        }
        if (user.isAgent) {
          accumulator.agentCount += 1;
        }
        return accumulator;
      },
      { managerCount: 0, leadCount: 0, agentCount: 0 }
    );

    // Set the initial counts in the state
    setFilteredRoleCounts(initialCounts);
  }, [userData, agentRole, formValues]);

  const handleSearchTextChange = (event: any) => {
    setSearchForm(true);
    setSearchText(event.target.value);
    setData();
  };
  const setData = () => {
    refetch();
    const listOfUsers = userData?.data.map(fullName);
    setFullNamesArray(listOfUsers);
  };
  const validateUserSelection = () => {
    if (
      (agentRole.agent && selectedUsers.length > 2) ||
      (agentRole.lead && selectedUsers.length > 1)
    ) {
      toast.error("You can not select more than 1 users");
    } else {
      setSearchForm(false);
      setSearchText("");
    }
  };

  const handleCheckChange = (event: any, { id, fullName, reportsTo }: any) => {
    if (event.target.checked) {
      handleAddUser(id, fullName, reportsTo);
    } else {
      handleRemoveUser(id, reportsTo);
    }
  };

  const handleAddUser = (id: string, fullName: string, reportsTo: any) => {
    const higherReportee =
      reportsTo && reportsTo.length > 0 ? reportsTo[0] : null;
    setSelectedUsers((prevSelectedUsers: any) => [
      ...prevSelectedUsers,
      { id, fullName },
      ...(higherReportee
        ? [{ id: higherReportee.id, fullName: getFullName(higherReportee) }]
        : []),
    ]);
  };

  const handleRemoveUser = (id: string, reportsTo: any) => {
    const reporteeId =
      reportsTo && reportsTo.length > 0 ? reportsTo[0].id : null;

    setSelectedUsers((prevSelectedUsers: any) => {
      return prevSelectedUsers.filter(
        (user: any) => user.id !== id && user.id !== reporteeId
      );
    });
  };

  const getFullName = (user: any) => `${user?.firstName} ${user?.lastName}`;

  const filterUsersByRole = (user: any) => {
    if (agentRole?.agent && user?.isLead) {
      return true;
    }
    if (agentRole?.lead && user?.isManager) {
      return true;
    }
    if (agentRole.manager) {
      return false;
    }
    return false;
  };

  const handleUnarchive = async () => {
    setLoading(true);
    const request = {
      id: userData?.isArchived?.id,
    };
    try {
      const response = await unArchiveUser.mutateAsync(request);
      if (response) {
        setLoading(false);
        toast.success("User Unarchived Successfully");
        router.push(`/admin/users/${userData?.isArchived?.id}/user`);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to Unarchive user please try again later");
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {show && (
            <Modal
              title={"This User is Archived"}
              children={<div>Do you want to unarchive this user?</div>}
              onCloseClick={() => setShow(false)}
              showButtons={true}
              okButtonTitle={"Unarchive"}
              onSaveClick={handleUnarchive}
            ></Modal>
          )}
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {registerFormInputs.map((input, index) => (
                <InputField
                  key={"employee" + index}
                  input={input}
                  handlePhoneChange={handlePhoneChange}
                  handleChange={handleFormInputChange}
                  formValues={formValues.newUser}
                  formErrors={formErrors.newUser}
                  handleMultipleSelect={handleOptionChange}
                />
              ))}
              {formValues?.newUser?.roles?.includes(
                roleValues.agent as UserRole
              ) && (
                <>
                  <InputField
                    input={company}
                    handleChange={handleDropDown}
                    formValues={formValues.newUser}
                  />
                  <div className="flex flex-row justify-between">
                    {filteredRoleCounts?.leadCount > 0 && (
                      <InputField
                        input={agent}
                        handleChange={handleCheckBox}
                        formValues={{ addAgent: agentRole?.agent }}
                      />
                    )}
                    {filteredRoleCounts?.managerCount > 0 && (
                      <InputField
                        input={agentLead}
                        handleChange={handleCheckBox}
                        formValues={{ addLead: agentRole?.lead }}
                      />
                    )}
                    <InputField
                      input={agentManager}
                      handleChange={handleCheckBox}
                      formValues={{ addManager: agentRole?.manager }}
                    />
                  </div>
                  {filteredCount > 0 && (
                    <div className="mb-2 flex h-full flex-col">
                      <p className="block text-sm font-normal leading-6 text-gray-900">
                        Reports to<span className="text-red-600"> *</span>
                      </p>
                      <div className="rounded border border-gray-300 p-1 focus:border-primary-blue">
                        <div className="mb-3 flex flex-row ">
                          {!searchForm && selectedUsers?.length > 0 && (
                            <>
                              <div className="border-1 m-2 flex max-w-max items-center rounded border border-solid border-slate-400 pb-1 pl-2 pr-2 pt-1 shadow-md ">
                                <span className="ml-2 mr-2">
                                  {selectedUsers[0]?.fullName}
                                </span>
                                <XMarkIcon
                                  className="mr-.5 ml-.5 h-4 w-4 cursor-pointer"
                                  onClick={() => {
                                    setSelectedUsers([]);
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <div className=" ml-3 mt-6">
                          <AddButton
                            name={"Add Reporting To"}
                            handleClick={() => setSearchForm(true)}
                            disabled={selectedUsers.length < 1 ? false : true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {searchForm ? (
                    <>
                      <Modal
                        onCloseClick={() => {
                          setSearchForm(false);
                          setSearchText("");
                          setSelectedUsers(previousSelectedUsers);
                        }}
                        showButtons={true}
                        onSaveClick={() => {
                          validateUserSelection();
                        }}
                      >
                        <>
                          <div className="text-black-500 mb-2 text-left text-lg font-bold ">
                            <h1>
                              Select{" "}
                              {agentRole?.agent ? "Team Lead" : "Manager"}
                            </h1>
                          </div>
                          <div className="my-2 flex h-[50px] w-[350px] items-center rounded-md bg-[#d7edfc] pl-6">
                            <input
                              type="text"
                              value={searchText}
                              onChange={handleSearchTextChange}
                              className="w-[calc(100%-45px)] border-none bg-[#d7edfc] font-gordita text-[15px] font-medium text-black focus:ring-0"
                              placeholder="Search"
                            />
                          </div>

                          {userDataLoading ? (
                            <ComponentLoader />
                          ) : (
                            fullNamesArray?.map(
                              (data: any) =>
                                filterUsersByRole(data) && (
                                  <div className="mt-1" key={data.id}>
                                    <input
                                      type="checkbox"
                                      id={data?.id}
                                      value={data?.id}
                                      onChange={(event) => {
                                        handleCheckChange(event, data);
                                      }}
                                      checked={selectedUsers.some(
                                        (selected: any) =>
                                          selected?.id === data?.id
                                      )}
                                    />
                                    <label className="ml-1.5">
                                      {data?.fullName ?? "unknown"}
                                    </label>
                                  </div>
                                )
                            )
                          )}
                          <Pagination
                            itemsPerPage={itemsPerPage}
                            setCurrentOffset={setCurrentOffset}
                            isLoading={userDataLoading}
                            totalCount={Math.ceil(filteredCount / 10)}
                            handlePage={handlePage}
                          />
                        </>
                      </Modal>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}
            </div>
            <div className="my-2">
              <Button text={"Submit"} type="submit" disabled={disable} />
            </div>
          </form>
        </>
      )}
    </>
  );
};
export default NewUserForm;
