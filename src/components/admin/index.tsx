import React, { useEffect, useMemo, useState } from "react";
import DefaultLayout from "../defaultLayout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import DescriptionList from "~/common/showDetails/tableView";
import Loader from "~/common/loader";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import {
  RoleLabelNames,
  editUserDetailsModal,
  packageNameValues,
  roleValues,
} from "~/utils/constants/user";
import { IEvent, IOption } from "~/interfaces/common/form";
import {
  AgentRoleType,
  CredentialsUser,
  PackageName,
  UserRole,
} from "@prisma/client";
import { signOut, useSession } from "next-auth/react";
import TabsBar from "~/common/tabs";
import { BsArrowRightSquareFill } from "react-icons/bs";
import ShowNotesAndActivity from "~/common/showNotesAndActivity";
import Tokens from "~/pages/admin/tokens";
import { ToastContainer, toast } from "react-toastify";
import NoAccessComponent from "~/common/noAccess";
import ErrorComponent from "~/common/errorPage";
import DeleteButton from "~/common/buttons/deleteButton";
import { validateFrom, validatePhoneNum } from "~/utils/helpers/validations";
import InputField from "~/common/form/input";
import Button from "~/common/buttons/filledButton";
import SecondaryButton from "~/common/buttons/secondaryButton";
import { getMultipleAccessRoles } from "~/utils/helpers";
import {
  agent,
  agentLead,
  agentManager,
  agentRoleType,
  defaultCallCenter,
  none,
} from "~/utils/constants";
import EditIcon from "~/common/buttons/editIcon";
import XMarkIcon from "@heroicons/react/20/solid/XMarkIcon";
import AddButton from "~/common/buttons/addButton";
import SelectUserTable from "./selectUserTable";

interface IUserDetails {
  id: number | undefined;
  firstName: string | null;
  lastName: string | null;
  roles: UserRole[];
  phone: string;
  callCenterId: number;
  packageName: any;
  reportsTo: CredentialsUser[] | [];
  reportingUsers: CredentialsUser[] | [];
  agentRoletype: AgentRoleType;
}

const UsersView = (props: any) => {
  const [editUserDetails, setEditUserDetails] = useState(false);
  const [editUser, setEditUser] = useState({} as IUserDetails);
  const [showSelectUsersTable, setShowSelectUsersTable] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [errorData, setErrorData] = useState({} as any);
  const [showActivitySection, setShowActivitySection] = useState(true);

  const updateUserDetails = api.credentialUser.update.useMutation();
  const archiveUser = api.credentialUser.archive.useMutation();
  const unArchiveUser = api.credentialUser.unArchive.useMutation();
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const [disable, setDisable] = useState(false);
  const [callCenter, setCallCenter] = useState(defaultCallCenter);
  const [reportingUsers, setReportingUsers] = useState([] as CredentialsUser[]);
  const [reportsTo, setReportsTo] = useState([] as CredentialsUser[]);
  const [agentRole, setAgentRole] = useState("");
  const userId = router.query.id as String;
  let {
    isLoading,
    data,
    error,
    refetch: refetch = () => {},
  } = currentRoleAccessLevels?.Admin?.canView
    ? api.credentialUser.show.useQuery(userId as string)
    : { isLoading: false, data: null as any, error: null };
  const { data: company } = api.callCenter.list.useQuery();
  const onEditSave = async () => {
    const errors = validateFrom(editUser, editUserDetailsModal);
    const isFormValid = Object.values(errors).some(Boolean);
    if (isFormValid) {
      setErrorData(errors);
      return;
    }
    setLoading(true);
    setEditUserDetails(false);
    try {
      const request = {
        firstName: editUser?.firstName as string,
        lastName: editUser?.lastName as string,
        roles: editUser?.roles as UserRole[],
        phone: editUser?.phone ? editUser?.phone.replace(/[\s-]/g, "") : "",
        packageName: editUser?.packageName,
        ...(editUser.roles.includes(roleValues.agent as UserRole) && {
          callCenterId: Number(callCenter),
        }),
        agentRoleType: editUser?.agentRoletype,
        reportingUsers: editUser?.reportingUsers.map((user) => {
          return { id: user.id };
        }),
      };
      const updateUserProfile = await updateUserDetails.mutateAsync({
        id: Number(editUser?.id),
        ...request,
      });
      if (updateUserProfile) {
        toast.success("User details updated successfully");
      }
      setTimeout(() => {
        if (editUser) {
          if (Number(session.data?.user.id) == editUser.id) {
            signOut({ callbackUrl: "/" });
            router.push("/");
          }
        }
      }, 2000);
    } catch (error) {
      toast.error("Unable to update the user details please try again later");
    } finally {
      setLoading(false);
      handleRefetch();
    }
  };

  useMemo(() => {
    if (data) {
      delete data.otp_verified;
      delete data.otp_auth_url;
      delete data.otp_base32;
      setEditUser(data);
      if (data?.callCenterId) {
        setCallCenter(data?.callCenterId);
      }
      if (
        data?.roles.includes(roleValues.agent as UserRole) &&
        data?.reportsTo
      ) {
        setReportsTo(data?.reportsTo);
      }
      if (
        data?.roles.includes(roleValues.agent as UserRole) &&
        data?.reportingUsers
      ) {
        setReportingUsers(data?.reportingUsers);
      }
    }
    return null;
  }, [data]);

  const handleRefetch = () => {
    refetch();
  };

  const handleArchiveUser = async () => {
    setLoading(true);
    try {
      const archivedUser = await archiveUser.mutateAsync({
        id: Number(data?.id),
      });
      if (archivedUser) {
        setLoading(false);
        toast.success("User has been Archived");
        setTimeout(() => {
          if (session?.data?.user?.id == userId) {
            signOut({ callbackUrl: "/" });
            router.push("/");
          } else {
            setLoading(false);
            router.push("/admin/users");
          }
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to Archive user please try again later");
    } finally {
      setLoading(false);
      handleRefetch();
    }
  };

  const handleFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;
    setEditUser((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));

    setErrorData((prevFormErrors: any) => ({
      ...prevFormErrors,
      [name]: false,
    }));
  };

  const handlePhoneChange = (name: string, value: string) => {
    setDisable(!validatePhoneNum(value));
    setEditUser({
      ...editUser,
      phone: value,
    });
  };

  const handleOptionChange = (name: any, label: any, index: number = 0) => {
    if (label === "Package Name") {
      if (editUser.packageName?.includes(name)) {
        const options = editUser.packageName?.filter(
          (option: any) => option != name
        );
        setEditUser({
          ...editUser,
          packageName: [...options],
        });
        if (editUser.packageName.length < 2) {
          setDisable(true);
          setErrorData({
            ...errorData,
            packageName: "Please select package",
          });
        }
      } else {
        setEditUser({
          ...editUser,
          packageName: [...editUser.packageName, name],
        });
      }
      if (editUser.packageName.length < 1) {
        setDisable(false);
        setErrorData({
          ...errorData,
          packageName: "",
        });
      }
    } else if (label === "Roles") {
      if (editUser.roles?.includes(name)) {
        const options = editUser.roles?.filter((option: any) => option != name);
        setEditUser({
          ...editUser,
          roles: [...options],
        });
        if (editUser.roles.length < 2) {
          setDisable(true);
          setErrorData({
            ...errorData,
            roles: "Please select package",
          });
        }
      } else {
        setEditUser({
          ...editUser,
          roles: [...editUser.roles, name],
        });
      }
      if (editUser.roles.length < 1) {
        setDisable(false);
        setErrorData({
          ...errorData,
          roles: "",
        });
      }
    }
  };

  const [callCenterNames, setCallCenterNames] = useState<IOption[]>([]);
  useEffect(() => {
    const updatedCallCenters =
      company &&
      company?.data?.map((callcenter: any) => {
        return {
          id: callcenter?.callCenterId,
          label: callcenter?.callCenterName as string,
          value: callcenter?.callCenterId?.toString(),
        };
      });
    if (updatedCallCenters) {
      setCallCenterNames(updatedCallCenters);
    }
  }, [data]);

  const callCenters = {
    label: "Call Center Name",
    type: "select",
    name: "company",
    required: true,
    options: callCenterNames,
  };

  const handleDropDown = (event: any) => {
    setCallCenter(event.target.value);
  };

  const handleRemoveUser = (userToRemove: any) => {
    const updatedReportingUsers = editUser?.reportingUsers.filter(
      (u) => u.id !== userToRemove.id
    );
    setReportingUsers(updatedReportingUsers);
    setEditUser((prevEditUser) => ({
      ...prevEditUser,
      reportingUsers: updatedReportingUsers,
    }));
  };

  const handleCheckBox = (event: any) => {
    if (event.target.value) {
      switch (event.target.name) {
        case "addNone":
          setEditUser({ ...editUser, agentRoletype: "NONE" });
          break;
        case "addAgent":
          setEditUser({ ...editUser, agentRoletype: "AGENT" });
          break;
        case "addLead":
          setEditUser({ ...editUser, agentRoletype: "LEAD" });
          break;
        case "addManager":
          setEditUser({ ...editUser, agentRoletype: "MANAGER" });
          break;
      }
    }
  };

  const handleUnarchive = async () => {
    setLoading(true);
    const request = {
      id: Number(data?.id),
    };
    try {
      const response = await unArchiveUser.mutateAsync(request);
      if (response) {
        setLoading(false);
        toast.success("User Unarchived Successfully");
        router.push("/admin/users");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to Unarchive user please try again later");
    }
  };

  const generateExistingUserIds = () => {
    const exsistingReportingUsers =
      editUser?.reportingUsers
        .map((user) => user.id)
        .concat([Number(userId)]) || [];
    const exsistingReportsToUsers =
      reportsTo.map((user) => user.id).concat([Number(userId)]) || [];
    return exsistingReportingUsers.concat(exsistingReportsToUsers);
  };

  return currentRoleAccessLevels?.Admin?.canView ? (
    data && (
      <>
        {loading || (isLoading && !error) ? (
          <Loader />
        ) : !error ? (
          <div className="flex flex-row">
            <div className="w-full border-r-2 border-solid border-gray-300">
              <div className="h-screen overflow-auto transition duration-300 scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
                <div
                  className="my-4 flex items-center justify-between px-5"
                  id="Claim details"
                >
                  <h2 className="text-[26px] font-bold leading-9 text-dark-grey">
                    User Details
                  </h2>
                  <div className="flex gap-4">
                    {currentRoleAccessLevels?.Admin?.canDelete && (
                      <DeleteButton
                        handleDelete={
                          data?.isArchived ? handleUnarchive : handleArchiveUser
                        }
                        isArchive={data?.isArchived}
                      />
                    )}
                    {currentRoleAccessLevels?.Admin?.canUpdate && (
                      <EditIcon
                        handleClick={() => {
                          setEditUserDetails(true);
                        }}
                      />
                    )}
                    {!(
                      data.roles.length == 1 &&
                      data.roles.includes("AGENT" as UserRole)
                    ) && (
                      <BsArrowRightSquareFill
                        className={`${
                          !showActivitySection && "rotate-180"
                        } h-8 w-8 cursor-pointer text-primary-blue  hover:text-hover-blue`}
                        aria-hidden="true"
                        onClick={() =>
                          setShowActivitySection(!showActivitySection)
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="m-2 mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                  <DescriptionList
                    data={{
                      ...data,
                      ...(editUser?.roles?.includes(
                        roleValues.agent as UserRole
                      ) && {
                        callCenterName: data?.callCenter?.name,
                      }),
                    }}
                  />
                  <div className="mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                    <h3 className="text-lg font-semibold">Roles</h3>
                    {data?.roles && data?.roles.length > 0 ? (
                      <ol className="mt-3">
                        {data?.roles.map((item: UserRole, index: number) => (
                          <li className="mt-2 text-sm" key={index}>
                            <span className="font-semibold">{index + 1}.</span>{" "}
                            {item === roleValues.agent
                              ? RoleLabelNames[item] + " " + agentRole
                              : RoleLabelNames[item]}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                        No Roles are selected
                      </p>
                    )}
                  </div>
                  <div className="mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                    <h3 className="text-lg font-semibold">Package Name</h3>
                    {data?.packageName && data?.packageName.length > 0 ? (
                      <ol className="mt-3">
                        {data?.packageName.map(
                          (item: PackageName, index: number) => (
                            <li className="mt-2 text-sm" key={index}>
                              <span className="font-semibold">
                                {index + 1}.
                              </span>{" "}
                              {packageNameValues[item]}
                            </li>
                          )
                        )}
                      </ol>
                    ) : (
                      <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                        No packages are selected
                      </p>
                    )}
                  </div>
                  {data.roles.length == 1 &&
                    data.roles.includes("AGENT" as UserRole) && (
                      <>
                        <div className="mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                          <h3 className="text-lg font-semibold">
                            Reporting Users
                          </h3>
                          {data?.roles.includes(roleValues.agent as UserRole) &&
                          data?.reportingUsers &&
                          data?.reportingUsers.length > 0 ? (
                            <ol className="mt-3">
                              {data?.reportingUsers.map(
                                (item: CredentialsUser, index: number) => (
                                  <div className="flex flex-row">
                                    <span className="mr-1 font-semibold">
                                      {index + 1}.
                                    </span>{" "}
                                    <div
                                      className="text-sm leading-6 text-blue-500 underline hover:cursor-pointer"
                                      onClick={() => {
                                        router.push(
                                          `/admin/users/${item.id}/user`
                                        );
                                      }}
                                    >
                                      {item?.firstName + " " + item?.lastName}
                                    </div>
                                  </div>
                                )
                              )}
                            </ol>
                          ) : (
                            <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                              Does not have any reportees
                            </p>
                          )}
                        </div>
                        <div className="mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                          <h3 className="text-lg font-semibold">Reports To</h3>
                          {data?.roles.includes(roleValues.agent as UserRole) &&
                          data?.reportsTo &&
                          data?.reportsTo.length > 0 ? (
                            <ol className="mt-3">
                              {data?.reportsTo.map(
                                (item: CredentialsUser, index: number) => (
                                  <li className="mt-2 text-sm" key={index}>
                                    <div className="flex flex-row">
                                      <span className="mr-1 font-semibold">
                                        {index + 1}.
                                      </span>{" "}
                                      <div
                                        className="text-sm leading-6 text-blue-500 underline hover:cursor-pointer"
                                        onClick={() => {
                                          router.push(
                                            `/admin/users/${item.id}/user`
                                          );
                                        }}
                                      >
                                        {item?.firstName + " " + item?.lastName}
                                      </div>
                                    </div>
                                  </li>
                                )
                              )}
                            </ol>
                          ) : (
                            <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                              Does not Report to anyone
                            </p>
                          )}
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>
            {!(
              data.roles.length == 1 && data.roles.includes("AGENT" as UserRole)
            ) && (
              <Tokens
                data={data}
                showActivitySection={showActivitySection}
                accessLevels={currentRoleAccessLevels?.Admin}
              />
            )}
            {editUserDetails && (
              <Modal
                title={"Edit User Details"}
                onCloseClick={() => {
                  setEditUserDetails(false);
                  handleRefetch();
                }}
                border
              >
                <>
                  <form onSubmit={onEditSave}>
                    <div>
                      <FormComponent
                        inputs={editUserDetailsModal}
                        formValues={editUser}
                        handleChange={handleFormInputChange}
                        handlePhoneChange={handlePhoneChange}
                        handleOptionChange={handleOptionChange}
                        formErrors={errorData}
                        tailwindClass="grid grid-col-2 gap-4"
                      />
                    </div>

                    {editUser?.roles?.includes(
                      roleValues.agent as UserRole
                    ) && (
                      <>
                        <InputField
                          input={callCenters}
                          handleChange={handleDropDown}
                          formValues={{ company: callCenter }}
                        />
                        {(editUser.agentRoletype === "MANAGER" ||
                          editUser.agentRoletype === "LEAD") && (
                          <div className="mb-2 flex h-full flex-col">
                            <p className="block text-sm font-normal leading-6 text-gray-900">
                              Reporting users
                              <span className="text-red-600"> *</span>
                            </p>
                            <div className="rounded-md border border-gray-300 p-1 focus:border-primary-blue">
                              <div className="-mx-2 flex flex-wrap">
                                {editUser?.reportingUsers?.length > 0 && (
                                  <>
                                    {editUser?.reportingUsers.map(
                                      (user, index) => (
                                        <div
                                          key={index}
                                          className="w-1/2 p-2 md:w-1/3 lg:w-1/4 xl:w-1/5"
                                        >
                                          <div className="border-1 flex items-center rounded border border-solid border-slate-400 pb-1 pl-2 pr-2 pt-1 shadow-md">
                                            <span className="ml-2 mr-2">
                                              {user?.firstName +
                                                " " +
                                                user?.lastName}
                                            </span>
                                            <XMarkIcon
                                              className="h-4 w-4 cursor-pointer"
                                              onClick={() =>
                                                handleRemoveUser(user)
                                              }
                                            />
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="ml-3 mt-6">
                                <AddButton
                                  name={"Add Reporting users"}
                                  handleClick={() =>
                                    setShowSelectUsersTable(true)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mb-2 flex h-full flex-col">
                          <p className="block text-sm font-normal leading-6 text-gray-900">
                            Agent role type
                            <span className="text-red-600"> *</span>
                            <div className="flex rounded-md border border-gray-300 p-1 focus:border-primary-blue">
                              <InputField
                                input={none}
                                handleChange={handleCheckBox}
                                formValues={{
                                  addNone:
                                    editUser?.agentRoletype ===
                                    agentRoleType[0],
                                }}
                              />
                              <InputField
                                input={agent}
                                handleChange={handleCheckBox}
                                formValues={{
                                  addAgent:
                                    editUser?.agentRoletype == agentRoleType[1],
                                }}
                              />
                              <InputField
                                input={agentLead}
                                handleChange={handleCheckBox}
                                formValues={{
                                  addLead:
                                    editUser?.agentRoletype == agentRoleType[2],
                                }}
                              />
                              <InputField
                                input={agentManager}
                                handleChange={handleCheckBox}
                                formValues={{
                                  addManager:
                                    editUser?.agentRoletype == agentRoleType[3],
                                }}
                              />
                            </div>
                          </p>
                        </div>
                      </>
                    )}
                    <div className="mt-5 flex w-full justify-end">
                      <Button
                        text="Save"
                        type={"submit"}
                        className="mr-3"
                        disabled={disable}
                      />
                      <SecondaryButton
                        text="Close"
                        onClick={() => {
                          setEditUserDetails(false);
                          refetch();
                        }}
                      />
                    </div>
                  </form>
                </>
              </Modal>
            )}
            {showSelectUsersTable && (
              <SelectUserTable
                setSelectedUserProps={(value) => {
                  setSelectedUsers(value);
                  setEditUser({
                    ...editUser,
                    reportingUsers: editUser?.reportingUsers.concat(value),
                  });
                }}
                setCloseModel={(value: boolean) => {
                  setShowSelectUsersTable(value);
                }}
                exsistingUserIds={generateExistingUserIds()}
                callcenterId={callCenter}
              />
            )}
          </div>
        ) : (
          <>
            <ErrorComponent />{" "}
          </>
        )}
      </>
    )
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
};

export default DefaultLayout(UsersView);
