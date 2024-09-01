import React, { useEffect, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Loader from "~/common/loader";
import AddNoteModal from "../addNoteModal";
import TabsBar from "~/common/tabs";
import { ToastContainer, toast } from "react-toastify";
import { BsArrowRightSquareFill } from "react-icons/bs";
import ShowNotesAndActivity from "~/common/showNotesAndActivity";
import { useSession } from "next-auth/react";
import { AccessLevelsDefinition } from "~/utils/constants";
import { UserRole } from "@prisma/client";
import NoAccessComponent from "~/common/noAccess";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";

function PaymentView(props: any) {
  const paymentTabs = [
    {
      name: "Payment details",
      label: "Payment Details",
      key: "1",
      currentTab: false,
    },
  ] as const;

  const router = useRouter();
  const paymentsId = router.query.id;
  const [activeTab, setActiveTab] = useState(paymentTabs[0].name);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({} as any);
  const [toggle, setToggle] = useState<boolean>(false);
  const [showActivitySection, setShowActivitySection] = useState(true);
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);

  const {
    isLoading,
    data,
    error,
    refetch: refetchShow,
  } = currentRoleAccessLevels?.Payments?.canView
    ? api.payments.show.useQuery(paymentsId as any)
    : {
        isLoading: false,
        data: null as any,
        error: null,
        refetch: null as any,
      };

  const [open, setOpen] = useState(false);
  const [note, setNote] = useState({ title: "", description: "" });
  const [notes, setNotes]: any = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY;
      setScrollPosition(currentPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const tabElements = document.getElementsByClassName("tab-section");
    const tabPositions = Array.from(tabElements).map((element) => {
      const rect = element.getBoundingClientRect();
      return { key: element.id, top: rect.top, bottom: rect.bottom };
    });

    const currentTab: any = tabPositions.find(
      (tab) => scrollPosition >= tab.top && scrollPosition <= tab.bottom
    );

    if (currentTab) {
      setActiveTab(currentTab.key);
    }
  }, [scrollPosition]);

  let {
    isLoading: noteLoading,
    data: noteData,
    error: noteError,
  } = api.claimNote.findByClaimId.useQuery(router.query.id as string);

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  const handleFetch = () => {
    refetchShow();
  };

  const addnote = api.complaintNotes.create.useMutation();
  const handleNoteSubmit = async (title: string, description: string) => {
    setLoading(true);
    try {
      const res = await addnote.mutateAsync({
        complaintId: Number(router.query.id),
        title: title,
        description: description,
      });
      if (!res) {
        setLoading(false);
        toast.error("Failed to fetch data.", {
          toastId: "createError",
          autoClose: 2000,
        });
      } else {
        setLoading(false);
        let copy = [...notes];
        copy.push(res);
        setNotes(copy);
        setNote({ title: "", description: "" });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to add note please try again later");
    } finally {
      setLoading(false);
      handleFetch();
    }
  };

  const handleAddNote = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (data) {
      setPaymentData(data);
      setToggle(!toggle);
    }
  }, [data]);

  useEffect(() => {
    const selectedTab: any = document.getElementById(`${activeTab}`);
    selectedTab?.scrollIntoView({
      block: "start",
      behavior: "smooth",
      inline: "center",
    });
  }, [activeTab]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error]);

  useEffect(() => {
    const createdAt = dateConversion(paymentData.createdAt);
    const updatedAt = dateConversion(paymentData.updatedAt);

    const createObject = {
      createdAt: createdAt,
      updatedAt: updatedAt,
    };

    setPaymentData((prev: any) => ({
      ...prev,
      ...createObject,
    }));
  }, [toggle]);
  return currentRoleAccessLevels?.Payments?.canView ? (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-row">
          <div className="w-full border-r-2 border-solid border-gray-300">
            <div className="relative flex justify-between border-b">
              <TabsBar
                tabs={paymentTabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <div className="flex items-center justify-center p-2">
                <BsArrowRightSquareFill
                  className={`${
                    !showActivitySection && "rotate-180"
                  } h-8 w-8 cursor-pointer text-primary-blue transition duration-300 hover:text-hover-blue`}
                  aria-hidden="true"
                  onClick={() => setShowActivitySection(!showActivitySection)}
                />
              </div>
            </div>

            <div className="h-[calc(100vh-120px)] overflow-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
              <div
                className="center flex justify-between px-5 pt-10"
                id="Complaint details"
              >
                <div className="flex gap-x-2">
                  <h3 className="my-2 text-[26px] font-bold leading-9 text-dark-grey">
                    Payment Details
                  </h3>
                  {data?.status == "SUBMITTED" && (
                    <span className=" place-self-center rounded-lg  border-green-500 bg-green-500 px-3 py-1.5 text-sm text-white">
                      Submitted
                    </span>
                  )}
                  {data?.status === "PENDING" && (
                    <span className=" place-self-center rounded-lg  border-orange-500 bg-orange-500 px-3 py-1.5 text-sm text-white">
                      Pending
                    </span>
                  )}
                </div>
                <div>
                  {currentRoleAccessLevels?.Payments?.canUpdate && (
                    <ActionButtons
                      isVisible={true}
                      showAddNotes={true}
                      onClick={handleAddNote}
                    />
                  )}
                </div>
              </div>
              <div className="mx-5">
                <div className="mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                  <DescriptionList data={paymentData} />
                </div>
              </div>
            </div>
          </div>
          <ShowNotesAndActivity
            notes={notes}
            showActivitySection={showActivitySection}
          />

          {open && (
            <AddNoteModal
              open={open}
              setOpen={setOpen}
              note={note}
              setNote={setNote}
              handleSubmit={handleNoteSubmit}
            />
          )}
        </div>
      )}
    </>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}

export default DefaultLayout(PaymentView);
