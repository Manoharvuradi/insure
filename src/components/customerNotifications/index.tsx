import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import {
  AccessLevelsDefinition,
  NotificationHeader,
  notificationOptions,
  packageName,
  packageNameOptions,
} from "~/utils/constants";
import { EventNotification, PackageName, UserRole } from "@prisma/client";
import Filter from "~/common/filter";
import { BsInfo } from "react-icons/bs";
import NotificationTable from "~/common/notificationTable";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import { eventInputs } from "~/utils/constants/eventNotification";
import { IEvent } from "~/interfaces/common/form";
import SelectInput from "~/common/form/selectInput";
import { editUserDetailsModal } from "~/utils/constants/user";
import InputField from "~/common/form/input";
import Button from "~/common/buttons/filledButton";
import ComponentLoader from "~/common/componentLoader";

// import bcrypt from "bcrypt";
interface IE {
  currentPageCount: number;
  data: EventNotification[];
  totalCount: number;
}

const filteroptions = [
  { filterValue: "POLICY", label: "Policy", checked: false },
  { filterValue: "CLAIM", label: "Claim", checked: false },
  { filterValue: "APPLICATION", label: "Application", checked: false },
  { filterValue: "COMPLAINT", label: "Complaint", checked: false },
  { filterValue: "POLICYHOLDER", label: "Policyholder", checked: false },
  { filterValue: "LEAD", label: "Leads", checked: false },
];
function CustomerNotification() {
  const session = useSession();
  const router = useRouter();
  const [sortParam, setSortParam] = useState("");
  const [componentLoading, setComponentLoading] = useState(false);
  const [notificationData, setNotificationData] =
    useState<EventNotification[]>();
  const [activePackageName, setActivePackageName] = useState(
    "EMPLOYEE_FUNERAL_INSURANCE"
  );
  const [filParams, setFilParams] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [eventNotificationData, setEventNotificationData] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    ...notificationOptions,
  });
  const createEvent = api.eventNotification.create.useMutation();
  const eventUpdate = api.eventNotification.update.useMutation();
  const handleOptionChange = (e: any, index: number = 0) => {
    setActivePackageName(e.target.value);
    sessionStorage.setItem("PackageName", e.target.value);
  };

  const currentRole = session.data?.user.roles;
  const {
    isLoading,
    data: eventData,
    error,
    refetch: eventRefetch,
  } = currentRole?.includes("SUPER_ADMIN" as UserRole)
    ? api.eventNotification.list.useQuery({
        filter: filParams,
        packageName: activePackageName,
      })
    : {
        isLoading: false,
        data: null,
        error: null,
        refetch: () => {
          return null;
        },
      };

  const handleFilter = () => {
    eventRefetch();
  };
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);

  useEffect(() => {
    const PackageName = sessionStorage.getItem("PackageName");
    setActivePackageName(PackageName ? PackageName : "");
  }, []);

  useEffect(() => {
    if (eventData !== undefined && eventData) {
      setComponentLoading(true);
      setNotificationData(eventData?.data);
      setComponentLoading(false);
    }
  }, [eventData]);

  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({ ...notificationOptions, options: filteroptions });
    }
  }, [filParams]);

  const handleCreateEvent = (e: IEvent): void => {
    const { name, value } = e.target;
    setEventNotificationData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleButton = async (item: any, save: boolean, type: string) => {
    setComponentLoading(true);
    if (item.id) {
      const queryOptions: any = {
        id: item.id,
        body: {
          eventName: item.eventName,
          eventCategory: item.eventCategory,
          packageName: item.packageName,
        },
      };
      if (type === "email") {
        queryOptions.body.emailNotification = save;
      } else if (type === "sms") {
        queryOptions.body.smsNotification = save;
      }
      const res = await eventUpdate.mutateAsync(queryOptions);
      if (res) {
        eventRefetch();
      }
    }
  };

  const onEventSave = async () => {
    setModalOpen(false);
    setLoading(true);
    const request = {
      eventName: eventNotificationData.eventName,
      eventCategory: eventNotificationData.eventCategory,
      packageName: eventNotificationData.packageName,
    };
    try {
      const setEvents = await createEvent.mutateAsync(request);
      if (setEvents) {
        setLoading(false);
        toast.success("Event created successfully");
      } else {
        setLoading(false);
        toast.error(
          "Error occured while creating the event please try again later"
        );
      }
    } catch (err) {
      setLoading(false);
      toast.error("Event already exist please create another event");
    } finally {
      setLoading(false);
      eventRefetch();
      setEventNotificationData("");
    }
  };

  return (
    <>
      <>
        <div>
          <>
            <div className="my-2 flex w-full justify-between bg-white px-8 shadow-md">
              <div className="w-[300px]">
                <InputField
                  input={packageNameOptions}
                  handleChange={handleOptionChange}
                  formValues={{ packageName: activePackageName }}
                />
              </div>
              <div className="flex gap-2 pt-7">
                <Button text={"New Event"} onClick={() => setModalOpen(true)} />
                <div className="pt-1">
                  <Filter
                    filterOptions={filterOptions}
                    setFilParams={setFilParams}
                    showSearchInput={false}
                    showFilter={true}
                    handleFilter={handleFilter}
                    setSortParams={setSortParam}
                    selectedFilterOptionsCount={selectedFilterOptionsCount}
                    setSelectedFilterOptionsCount={
                      setSelectedFilterOptionsCount
                    }
                  />
                </div>
              </div>
            </div>
            {isLoading || loading || componentLoading ? (
              <ComponentLoader />
            ) : (
              <div className="mb-20 w-full bg-white px-8 pb-5 shadow-md">
                <div className="inline-block min-w-full align-middle">
                  <div className="relative">
                    <NotificationTable
                      column={NotificationHeader}
                      data={notificationData as EventNotification[]}
                      eventRefetch={eventRefetch}
                      handleApiButton={handleButton}
                      page="Event Notification"
                    />
                  </div>
                </div>
              </div>
            )}
            {modalOpen && (
              <Modal
                title={"Events"}
                onCloseClick={() => {
                  // handleDataRefetch();
                  setModalOpen(false);
                  // handleRefetchShow();
                }}
                onSaveClick={onEventSave}
                showButtons
                border
              >
                <div>
                  <FormComponent
                    inputs={eventInputs}
                    formValues={eventNotificationData}
                    handleChange={handleCreateEvent}
                    formErrors={() => {}}
                    tailwindClass="grid grid-cols-2 gap-4"
                  />
                </div>
              </Modal>
            )}
          </>
        </div>
      </>
    </>
  );
}

export default CustomerNotification;
