import React, { useEffect, useState } from "react";
import DefaultLayout from "../defaultLayout";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import DescriptionList from "~/common/showDetails/tableView";
import ActionButtons from "~/common/actionButtons";
import { toast } from "react-toastify";
import {
  checkIsRecentPurchase,
  contactStatusNames,
  getMultipleAccessRoles,
} from "~/utils/helpers";
import Status from "~/common/status";
import { ContactStatus, UserRole } from "@prisma/client";
import Loader from "~/common/loader";
import NoAccessComponent from "~/common/noAccess";
import { useSession } from "next-auth/react";
import { AiOutlineDelete } from "react-icons/ai";
const ContactsView = (props: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const contactId = router.query.id;
  const [contactData, setContactData] = useState({});
  const statusUpdate = api.contacts.stauts.useMutation();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const archiveContact = api.contacts.archive.useMutation();
  const { isLoading, data, error, refetch } = api.contacts.show.useQuery(
    Number(contactId)
  );
  useEffect(() => {
    if (data) {
      setContactData(data);
    }
  }, [data]);
  const onClickCreateProspect = () => {
    router.push({
      pathname: "/lead/create/retailDevice",
      query: { contactId: contactId },
    });
  };

  const handleCallScheduled = async () => {
    setLoading(true);
    try {
      const statusUpdating = await statusUpdate.mutateAsync({
        id: Number(contactId),
        status: contactStatusNames.callScheduled,
      });
      if (statusUpdating) {
        setLoading(false);
        toast.success("Call Scheduled Successfully");
      } else {
        toast.error("Failed to update the status");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Error occured while updatding call schedule");
      setLoading(false);
    } finally {
      refetch();
      setLoading(false);
    }
  };

  const handleInterested = async () => {
    setLoading(true);
    try {
      const statusUpdating = await statusUpdate.mutateAsync({
        id: Number(contactId),
        status: contactStatusNames.interested,
      });
      if (statusUpdating) {
        setLoading(false);
        toast.success("status updated Interested Successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update the status");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error occured while updatding status to Interested");
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const handleNotInterested = async () => {
    setLoading(true);
    try {
      const statusUpdating = await statusUpdate.mutateAsync({
        id: Number(contactId),
        status: contactStatusNames.notInterested,
      });
      if (statusUpdating) {
        setLoading(false);
        toast.success("status updated Not Interested Successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update the status");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error occured while updatding status to Not Interested");
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const handleExpired = async () => {
    setLoading(true);
    try {
      const statusUpdating = await statusUpdate.mutateAsync({
        id: Number(contactId),
        status: contactStatusNames.expired,
      });
      if (statusUpdating) {
        setLoading(false);
        toast.success("status updated Expired Successfully");
      } else {
        setLoading(false);
        toast.error("Failed to update the status");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error occured while updatding status to Expired");
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const archiveContactId = async (id: number) => {
    setLoading(true);
    try {
      const response = await archiveContact.mutateAsync(id);
      if (response) {
        setLoading(false);
        toast.success("Contact archived Successfully");
        router.push("/contacts/list");
      } else {
        setLoading(false);
        toast.error("Failed to archive contact");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error occured while archiving contact");
    }
  };

  return currentRoleAccessLevels.Contacts.canView ? (
    <>
      {isLoading || loading ? (
        <Loader />
      ) : (
        <div className="w-full border-r-2 border-solid border-gray-300">
          <div className="h-screen overflow-auto transition duration-300 scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
            <div className="m-2 mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
              <div className="mt-5 rounded-[10px] px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                <div className="center flex justify-between px-5 pt-10">
                  <div className="flex">
                    <h2 className="mb-5 text-[26px] font-bold leading-9 text-dark-grey">
                      Contact Details
                    </h2>
                    <div className="ml-5 mt-1">
                      <Status
                        status={data?.status as ContactStatus}
                        page={"Contacts"}
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <span className="mr-3 mt-2 cursor-pointer">
                      <AiOutlineDelete
                        color="red"
                        onClick={() => {
                          archiveContactId(Number(contactId));
                        }}
                      />
                    </span>
                    <ActionButtons
                      isVisible={
                        data?.status !== contactStatusNames.notInterested &&
                        data?.status !== contactStatusNames.expired &&
                        data?.createdById !== null
                      }
                      showCreateProspect={
                        data?.status === contactStatusNames.interested
                      }
                      onClickCreateProspect={onClickCreateProspect}
                      showCallScheduled={
                        data?.status === contactStatusNames.open
                      }
                      onClickCallScheduled={handleCallScheduled}
                      showInterested={
                        data?.status === contactStatusNames.open ||
                        data?.status === contactStatusNames.callScheduled
                      }
                      onClickInterested={handleInterested}
                      showNotInterested={
                        data?.status === contactStatusNames.open ||
                        data?.status === contactStatusNames.callScheduled
                      }
                      onClickNotInterested={handleNotInterested}
                      showExpired={
                        data?.status === contactStatusNames.open ||
                        data?.status === contactStatusNames.callScheduled
                      }
                      onClickExpired={handleExpired}
                    />
                  </div>
                </div>
                <DescriptionList data={contactData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
};

export default DefaultLayout(ContactsView);
