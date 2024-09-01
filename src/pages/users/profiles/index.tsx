import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DefaultLayout from "~/components/defaultLayout";
import withAuth from "~/pages/api/auth/withAuth";
import Modal from "~/common/Modal";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import Loader from "~/common/loader";
import { number } from "zod";
import { api } from "~/utils/api";
import Email from "next-auth/providers/email";
import CustomerNotification from "~/components/customerNotifications";
// import bcrypt from "bcrypt";
import { ApiAccessLevel } from "~/components/apiAccessLevel";
import TabsBar from "~/common/tabs";
import { BiHide, BiShow } from "react-icons/bi";
import { inputPasswords, inputProfile } from "~/utils/helpers";
import InputField from "~/common/form/input";
import Button from "~/common/buttons/filledButton";
import { IEvent, IOption } from "~/interfaces/common/form";
import { roleValues } from "~/utils/constants/user";
import PackageDocuments from "~/components/packageDocs";
import Verify2fa from "~/components/authentication/enable2fa";
import { UserRole } from "@prisma/client";
import axios from "axios";
import { env } from "~/env.mjs";

interface IPasswords {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface IProfile {
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
}

const profilePage = () => {
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const adminProfileTabs = [
    {
      name: "profile",
      label: "Profile",
      key: "1",
      currentTab: false,
    },
    {
      name: "eventNotifications",
      label: "Event Notifications",
      key: "2",
      currentTab: false,
    },
    {
      name: "accessLevels",
      label: "Access Levels",
      key: "3",
      currentTab: false,
    },
    {
      name: "resetPassword",
      label: "Reset Password",
      key: "4",
      currentTab: false,
    },
    {
      name: "packageDocuments",
      label: "Package Documents",
      key: "5",
      currentTab: false,
    },
  ];
  const profileTabs = [
    {
      name: "profile",
      label: "Profile",
      key: "1",
      currentTab: false,
    },
    {
      name: "resetPassword",
      label: "Reset Password",
      key: "4",
      currentTab: false,
    },
  ];
  const [activeTab, setActiveTab] = useState("profile");
  const [secretPasswordsValues, setSecretPasswordValues] = useState(
    {} as IPasswords
  );
  const [secretPasswordErrors, setSecretPasswordErrors] = useState(
    {} as IPasswords
  );
  const [userProfileValues, setUserProfileValues] = useState({} as IProfile);
  const [userProfileErrors, setUserProfileErrors] = useState({} as IProfile);

  const userId = session?.data?.user.id?.toString();
  const {
    isLoading: load,
    data,
    error,
    refetch: refetch = () => {},
  }: any = api.credentialUser.show.useQuery(userId as string);
  const { data: company } = api.callCenter.list.useQuery();

  const disable2FA = api.twofa.disable2FA.useMutation();

  const [callCenter, setCallCenter] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const updatedUser = api.credentialUser.update.useMutation();
  const [updateIsDisabled, setUpdateIsDisable] = useState(true);
  const [showEnable2FA, setShowEnable2FA] = useState(false);

  const resetPassword = api.credentialUser.resetPassword.useMutation();

  useEffect(() => {
    if (data) {
      setUserProfileValues(data);
      setCallCenter(data.callCenterId);
    }
  }, [data]);

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleDropDown = (event: any) => {
    setCallCenter(event.target.value);
  };
  const [callCenterNames, setCallCenterNames] = useState<IOption[]>([]);
  useEffect(() => {
    const updatedCallCenters =
      company &&
      company?.data.map((callcenter: any) => {
        return {
          id: callcenter?.callCenterId,
          label: callcenter?.callCenterName as string,
          value: callcenter?.callCenterId.toString(),
        };
      });
    if (updatedCallCenters) {
      setCallCenterNames(updatedCallCenters);
    }
  }, [data]);

  const callCenters = {
    label: "Company",
    type: "select",
    name: "company",
    required: true,
    options: callCenterNames,
  };

  const handleProfileSubmit = async (e: any) => {
    e.preventDefault();
    if (session?.data?.user?.email !== userProfileValues.email) {
      toast.error("Please you cannot change the email");
      return;
    }

    setIsLoading(true);
    const updateProfile = await updatedUser.mutateAsync({
      id: Number(session.data?.user.id),
      firstName: userProfileValues.firstName,
      lastName: userProfileValues.lastName,
    });

    if (updateProfile) {
      setIsLoading(false);
      setIsProfileModalOpen(false);
      setUserProfileValues(data);
      toast.info(
        "User details are successfully updated. Please wait for redirecting to login page"
      );
      setTimeout(() => {
        signOut();
      }, 5000);
    } else {
      toast.error("Unable to update details");
    }
  };

  useEffect(() => {
    const isFormValidProfile = () => {
      if (
        userProfileValues.firstName !== session?.data?.user?.firstName ||
        userProfileValues.lastName !== session.data?.user?.lastName
      ) {
        setUpdateIsDisable(false);
        return setUpdateIsDisable;
      } else if (
        userProfileValues.firstName === session?.data?.user?.firstName ||
        userProfileValues.lastName === session.data?.user?.lastName ||
        userProfileValues.firstName === null
      ) {
        setUpdateIsDisable(true);
        return setUpdateIsDisable;
      }
    };
    isFormValidProfile();
  }, [data]);

  const handlePasswordChange = (event: IEvent) => {
    const { name, value } = event.target;
    if (name === "newPassword") {
      if (value.length < 8) {
        setSecretPasswordErrors({
          ...secretPasswordErrors,
          [name]: "Password length must be greater that 8",
        });
      } else {
        setSecretPasswordErrors({
          ...secretPasswordErrors,
          [name]: "",
        });
      }
    }
    setSecretPasswordValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: any) => {
    e.preventDefault();
    if (
      secretPasswordsValues.newPassword !==
      secretPasswordsValues.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    const resetPasswordResponse = await resetPassword.mutateAsync({
      oldPassword: secretPasswordsValues?.oldPassword,
      newPassword: secretPasswordsValues?.newPassword,
    });

    if (resetPasswordResponse) {
      setIsLoading(false);
      toast.info(
        "Password reset successfully.Please wait for redirecting to login page"
      );
      setTimeout(() => {
        signOut();
      }, 5000);
    } else {
      setIsLoading(false);
      toast.error("Invalid old password");
    }
  };

  const handleProfileChange = (event: IEvent) => {
    const { name, value } = event.target;
    setUserProfileValues((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };

  useEffect(() => {
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
      setActiveTab(initialHash);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleTabChange = (tabId: any) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const handleHashChange = () => {
    const newHash = window.location.hash.substring(1);
    setActiveTab(newHash);
  };

  const disableTwoFactorAuth = async () => {
    try {
      setIsLoading(true);
      const response = await disable2FA.mutateAsync({
        id: Number(session.data?.user.id),
      });
      toast.warning("Two Factor Authentication Disabled");
      setTimeout(() => {
        signOut();
      }, 3000);
    } catch (error: any) {
      toast.error("Unable to Disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayments = async () => {
    setIsLoading(true);
    try {
      const recordPayments = await axios({
        method: "GET",
        url: `/api/paymentactions/recordpayments`,
      });
      if (recordPayments.status == 200) {
        toast.success("Payments recorded Successfully");
      } else {
        toast.error("Record Payments Error");
      }
    } catch (error) {
      toast.error("Something went wrong, try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNegetiveBalance = async () => {};

  return (
    <>
      <div className="fixed z-30 flex w-full justify-between border-b">
        <TabsBar
          tabs={
            currentRole.includes("SUPER_ADMIN" as UserRole)
              ? adminProfileTabs
              : profileTabs
          }
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleTabChange={handleTabChange}
        />
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="-z-10 pt-12">
            {activeTab === "resetPassword" && (
              <div
                id="resetPassword"
                className="mx-auto mt-6 w-[40%] rounded-md bg-gray-200 p-8 shadow-md"
              >
                <h2 className="pb-4 text-2xl font-semibold">Reset Password</h2>
                <form className="w-full" onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-2">
                    {inputPasswords.map((input, index) => (
                      <InputField
                        key={"employee" + index}
                        input={input}
                        handleChange={handlePasswordChange}
                        formValues={secretPasswordsValues}
                        formErrors={secretPasswordErrors}
                      />
                    ))}
                  </div>
                  <div className="my-2">
                    <Button
                      text={"Submit"}
                      type="submit"
                      disabled={secretPasswordsValues?.newPassword?.length < 8}
                    />
                  </div>
                </form>
              </div>
            )}
            {activeTab === "profile" && (
              <>
                <div className="-z-10 float-right flex pt-5">
                  <Button
                    className="mr-2"
                    onClick={handleRecordPayments}
                    text="RecordPayments"
                    disabled={true}
                  />
                  <Button
                    className="mr-2"
                    onClick={handleNegetiveBalance}
                    text="UpdateBalance"
                    disabled
                  />
                </div>
                <div
                  id="profile"
                  className="mx-auto mt-6 w-[40%] rounded-md bg-gray-200 p-8 shadow-md"
                >
                  <div className="margin-bottom-5 float-right">
                    {/* <Button
                    text={
                      !session.data?.user.otp_enabled
                        ? `Enable 2FA`
                        : `Disable 2FA`
                    }
                    onClick={() => {
                      !session.data?.user.otp_enabled
                        ? setShowEnable2FA(true)
                        : disableTwoFactorAuth();
                    }}
                  /> Temporaily disabled*/}
                    {!session.data?.user.otp_enabled && (
                      <Button
                        text="Enable 2FA"
                        onClick={() => setShowEnable2FA(true)}
                      />
                    )}
                  </div>
                  <h2 className="pb-4 text-2xl font-semibold">
                    Update Profile
                  </h2>
                  <div className="margin-top-10">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid gap-2">
                        {inputProfile.map((input, index) => (
                          <InputField
                            key={"employee" + index}
                            input={input}
                            handleChange={handleProfileChange}
                            formValues={userProfileValues}
                            formErrors={userProfileErrors}
                          />
                        ))}
                      </div>
                      {currentRole?.includes(roleValues.agent as UserRole) && (
                        <InputField
                          input={callCenters}
                          handleChange={handleDropDown}
                          formValues={{ company: callCenter }}
                          disabled
                        />
                      )}
                      <div className="my-2">
                        <Button
                          text={"Submit"}
                          type="submit"
                          disabled={false}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
            {activeTab === "eventNotifications" && (
              <div id="eventNotifications">
                {" "}
                <CustomerNotification />
              </div>
            )}
            {isProfileModalOpen && (
              <Modal
                onCloseClick={toggleProfileModal}
                showButtons={true}
                okButtonTitle="OK"
                onSaveClick={handleProfileSubmit}
                title="Update Details"
              >
                <form onSubmit={handleProfileSubmit}>
                  <h3 className="p-4">
                    Are you sure want to update data, click OK to continue
                  </h3>
                </form>
              </Modal>
            )}
            {showEnable2FA ? (
              <Verify2fa
                user_id={Number(session.data?.user.id)}
                closeModel={() => {
                  setShowEnable2FA(!showEnable2FA);
                }}
              />
            ) : (
              <></>
            )}
            {activeTab === "accessLevels" && (
              <div id="accessLevels">
                {" "}
                <ApiAccessLevel />{" "}
              </div>
            )}

            {activeTab === "packageDocuments" && (
              <div id="packageDocuments">
                {""}
                <PackageDocuments />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default withAuth(DefaultLayout(profilePage));
