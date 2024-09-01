import { Menu, Switch } from "@headlessui/react";
import {
  AccessLevels,
  ClaimCheckList,
  EventNotification,
} from "@prisma/client";
import React, { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { api } from "~/utils/api";
import { EventNames } from "~/utils/constants";
import Loader from "../loader";
import { classNames } from "~/utils/helpers";
import { useRouter } from "next/router";
import InputField from "~/common/form/input";
import ComponentLoader from "../componentLoader";
import { toast } from "react-toastify";
interface IColum {
  key: string;
  label: string;
}

interface INotificationProps {
  data: EventNotification[] | AccessLevels[] | ClaimCheckList[];
  column: IColum[];
  eventRefetch?: any;
  page?: string;
  handleApiButton?: any;
  isLoading?: boolean;
  isFetching?: boolean;
}
export default function NotificationTable(props: INotificationProps) {
  const [eventLoading, setEventLoading] = useState<boolean>(false);
  const deleteEvent = api.eventNotification.delete.useMutation();
  const router = useRouter();
  const eventCategories = props.data?.map((item: any) => {
    if (item.eventCategory) {
      return item.eventCategory;
    }
  });

  const eventNamesArray = [...new Set(eventCategories)];
  const handleEdit = (id: number, eventName: any) => {
    const lowerEventName = eventName.toLowerCase();
    router.push(`/users/profiles/${lowerEventName}/${id}/show`);
  };

  const handleDeleteEvent = async (id: number) => {
    setEventLoading(true);
    try {
      const deletingEvent = await deleteEvent.mutateAsync({
        id: Number(id),
      });
      if (deletingEvent) {
        setEventLoading(false);
        toast.success("Event has been deleted");
      } else {
        setEventLoading(false);
        toast.error("Error occured while deleting the event");
      }
    } catch (err) {
      toast.error(
        "Error occured while deleting the event, please try again later"
      );
    } finally {
      setEventLoading(false);
      props.eventRefetch();
    }
  };

  const handleSmsEdit = (id: number, eventName: any) => {
    const lowerEventNameSMS = eventName.toLowerCase();
    router.push(`/users/profiles/${lowerEventNameSMS}/${id}/showSMS`);
  };

  const smsPublishedTemplate = (id: number) => {};

  const eventUpdate = api.eventNotification.update.useMutation();

  const handleAttachmentOn = async (eventdata: EventNotification) => {
    setEventLoading(true);
    try {
      if (eventdata.id) {
        const res = await eventUpdate.mutateAsync({
          id: eventdata.id,
          body: {
            eventName: eventdata.eventName,
            attachment: true,
            eventCategory: eventdata.eventCategory,
            packageName: eventdata.packageName,
          },
        });
        if (res) {
          props.eventRefetch();
          setEventLoading(false);
          toast.success("PDF attachment turned on");
        } else {
          setEventLoading(false);
          toast.error("Error occured please try again later");
        }
      }
    } catch (err) {
      setEventLoading(false);
      toast.error("Error occured please try again later");
    } finally {
      props.eventRefetch();
    }
  };

  const handleAttachmentOff = async (eventdata: EventNotification) => {
    setEventLoading(true);
    try {
      if (eventdata.id) {
        const res = await eventUpdate.mutateAsync({
          id: eventdata.id,
          body: {
            eventName: eventdata.eventName,
            attachment: false,
            eventCategory: eventdata.eventCategory,
            packageName: eventdata.packageName,
          },
        });
        if (res) {
          props.eventRefetch();
          setEventLoading(false);
          toast.success("PDF attachment turned off");
        } else {
          setEventLoading(false);
          toast.error("Error occured while plase try agian later");
        }
      }
    } catch (err) {
      setEventLoading(false);
      toast.error("Please try again later");
    } finally {
      props.eventRefetch();
    }
  };

  return (
    <div className="w-[100%]">
      {props?.data?.length > 0 ? (
        eventNamesArray?.map((category: string, categoryIndex: number) => {
          return (
            <div key={categoryIndex} className="">
              <div className="my-4 font-bold"> {category}</div>
              {eventLoading || props?.isLoading ? (
                <ComponentLoader />
              ) : (
                <table className="text-align-center mt-10 w-full table-fixed gap-y-2 divide-y divide-gray-50 overflow-x-scroll">
                  <thead className="bg-gray-50 ">
                    <tr className="max-w-[300px]">
                      {props.column?.map(
                        (
                          columnItem: { key: string; label: string },
                          index: number
                        ) => {
                          return (
                            <th
                              key={index}
                              scope="col"
                              className={`${
                                props.column?.length == 2 &&
                                props.column?.length == index + 1
                                  ? "text-end"
                                  : "text-start"
                              } px-3 py-2.5  text-sm font-bold text-gray-900`}
                            >
                              {columnItem.label}
                            </th>
                          );
                        }
                      )}
                    </tr>
                  </thead>

                  <tbody className=" cursor-pointer divide-y divide-gray-50 break-all bg-white">
                    {props.data?.length > 0 ? (
                      props.data.map((item: any, index: number) => {
                        return (
                          category == item.eventCategory && (
                            <tr
                              key={index}
                              className="relative max-h-[80px] w-full text-center hover:bg-gray-100"
                            >
                              <td className=" w-[30%] items-center px-3 text-start text-sm text-gray-800">
                                {EventNames[item.eventName] ||
                                  item.features ||
                                  item.condition}
                              </td>
                              {props.page === "CheckList" ? (
                                <td className="whitespace-nowrap px-3 text-start text-sm text-gray-800 ">
                                  <div
                                    className={`flex ${
                                      props.column?.length == 2
                                        ? "justify-end"
                                        : "justify-start"
                                    }  gap-x-2  `}
                                  >
                                    <div className="pt-[5px]">
                                      {props.isLoading && props.isFetching ? (
                                        <ComponentLoader />
                                      ) : (
                                        <InputField
                                          input={{
                                            label: "",
                                            type: "checkbox",
                                            name: "checked",
                                            required: false,
                                          }}
                                          handleChange={(event, index) => {
                                            props.handleApiButton(
                                              item.id,
                                              event.target.checked
                                            );
                                          }}
                                          checked={item.checked}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                <>
                                  <td className="whitespace-nowrap px-3  text-start text-sm text-gray-800 ">
                                    <div className="flex justify-start  gap-x-2  text-start">
                                      <div className="pt-[5px]">
                                        <InputField
                                          input={{
                                            label: "",
                                            type: "checkbox",
                                            name: "canView",
                                            required: false,
                                          }}
                                          handleChange={(event, index) => {
                                            props.handleApiButton(
                                              item,
                                              event.target.checked,
                                              props.page === "Access Levels"
                                                ? "canView"
                                                : "email"
                                            );
                                          }}
                                          checked={
                                            item.checked ||
                                            item.canView ||
                                            item.emailNotification == true
                                          }
                                        />
                                      </div>
                                      <div className="mt-[9px]">
                                        {props.page === "Event Notification" &&
                                        item.emailProductSpecification !==
                                          undefined &&
                                        item.emailProductSpecification == true
                                          ? props.page ===
                                              "Event Notification" && (
                                              <p>Product-specific template</p>
                                            )
                                          : props.page ===
                                              "Event Notification" && (
                                              <p>Master template</p>
                                            )}
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    className={`${
                                      props.page === "Event Notification"
                                        ? "inline-block w-[10%]"
                                        : "px-3"
                                    }  whitespace-nowrap   text-start text-sm font-normal text-[#333333]`}
                                  >
                                    <div className="flex justify-start gap-x-2 text-start ">
                                      {props.page === "Access Levels" ? (
                                        <div className="pt-[5px]">
                                          <InputField
                                            input={{
                                              label: "",
                                              type: "checkbox",
                                              name: "canCreate",
                                              required: false,
                                            }}
                                            handleChange={(event, index) => {
                                              props.handleApiButton(
                                                item,
                                                event.target.checked,
                                                "canCreate"
                                              );
                                            }}
                                            checked={item.canCreate}
                                          />
                                        </div>
                                      ) : (
                                        <div className="absolute top-[30%] z-10">
                                          <Menu>
                                            <Menu.Button>
                                              <div>
                                                <BsThreeDots
                                                  className="cursor-pointer"
                                                  color="black"
                                                  size={20}
                                                />
                                              </div>
                                            </Menu.Button>
                                            <Menu.Items>
                                              <div className="z-12 absolute bottom-[1] right-[20px] rounded-md border border-gray-100 bg-white p-2 text-sm text-gray-500 shadow-lg">
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <div
                                                      className={classNames(
                                                        active
                                                          ? "text-gray-700"
                                                          : "text-black",
                                                        "cursor-pointer rounded-sm px-4 py-1 hover:rounded-md hover:border-white hover:bg-[#F0F9FF] hover:text-primary-blue"
                                                      )}
                                                      onClick={() =>
                                                        handleEdit(
                                                          item.id,
                                                          item.eventCategory
                                                        )
                                                      }
                                                    >
                                                      Edit template
                                                    </div>
                                                  )}
                                                </Menu.Item>
                                                {item.attachment == true &&
                                                item.eventCategory !==
                                                  "CLAIM" ? (
                                                  <Menu.Item>
                                                    {({ active }) => (
                                                      <div
                                                        className={classNames(
                                                          active
                                                            ? "text-gray-700"
                                                            : "text-black group-hover:text-white",
                                                          "cursor-pointer rounded-sm px-4 py-1 hover:rounded-md hover:border-white hover:bg-[#F0F9FF] hover:text-primary-blue"
                                                        )}
                                                        onClick={() =>
                                                          handleAttachmentOff(
                                                            item
                                                          )
                                                        }
                                                      >
                                                        Turn Off(attachment)
                                                      </div>
                                                    )}
                                                  </Menu.Item>
                                                ) : (
                                                  item.eventCategory !==
                                                    "CLAIM" && (
                                                    <Menu.Item>
                                                      {({ active }) => (
                                                        <div
                                                          className={classNames(
                                                            active
                                                              ? "text-gray-700"
                                                              : "text-black group-hover:text-white",
                                                            "cursor-pointer rounded-sm px-4 py-1 hover:rounded-md hover:border-white hover:bg-[#F0F9FF] hover:text-primary-blue"
                                                          )}
                                                          onClick={() =>
                                                            handleAttachmentOn(
                                                              item
                                                            )
                                                          }
                                                        >
                                                          Turn On(attachment)
                                                        </div>
                                                      )}
                                                    </Menu.Item>
                                                  )
                                                )}
                                                <Menu.Item>
                                                  {({ active }) => (
                                                    <div
                                                      className={classNames(
                                                        active
                                                          ? "text-gray-700"
                                                          : "text-black",
                                                        "cursor-pointer rounded-sm px-4 py-1 hover:rounded-md hover:border-white hover:bg-[#F0F9FF] hover:text-primary-blue"
                                                      )}
                                                      onClick={() =>
                                                        handleDeleteEvent(
                                                          item.id
                                                        )
                                                      }
                                                    >
                                                      Delete Event
                                                    </div>
                                                  )}
                                                </Menu.Item>
                                              </div>
                                            </Menu.Items>
                                          </Menu>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-3  text-start text-sm text-gray-800 ">
                                    <div className="flex justify-start gap-x-2 text-start">
                                      <div className="pt-[5px]">
                                        <InputField
                                          input={{
                                            label: "",
                                            type: "checkbox",
                                            name: "canUpdate",
                                            required: false,
                                          }}
                                          handleChange={(event, index) => {
                                            props.handleApiButton(
                                              item,
                                              event.target.checked,
                                              props.page === "Access Levels"
                                                ? "canUpdate"
                                                : "sms"
                                            );
                                          }}
                                          checked={
                                            item.smsNotification === true ||
                                            item.canUpdate === true
                                          }
                                        />
                                      </div>
                                      <div className="mt-[9px]">
                                        {props.page === "Event Notification" &&
                                        item.smsProductSpecification == true
                                          ? props.page ===
                                              "Event Notification" && (
                                              <p>Product-specific template</p>
                                            )
                                          : props.page ===
                                              "Event Notification" && (
                                              <p>Master template</p>
                                            )}
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    className={`${
                                      props.page === "Event Notification"
                                        ? "inline-block w-[10%]"
                                        : "px-3"
                                    }  whitespace-nowrap   text-start text-sm font-normal text-[#333333]`}
                                  >
                                    {props.page === "Access Levels" ? (
                                      <div className="pt-[5px]">
                                        <InputField
                                          input={{
                                            label: "",
                                            type: "checkbox",
                                            name: "canDelete",
                                            required: false,
                                          }}
                                          handleChange={(event, index) => {
                                            props.handleApiButton(
                                              item,
                                              event.target.checked,
                                              "canDelete"
                                            );
                                          }}
                                          checked={item.canDelete}
                                        />
                                      </div>
                                    ) : (
                                      <div className="absolute top-[30%] z-10">
                                        <Menu>
                                          <Menu.Button>
                                            <div>
                                              <BsThreeDots
                                                className="cursor-pointer"
                                                color="black"
                                                size={20}
                                              />
                                            </div>
                                          </Menu.Button>
                                          <Menu.Items>
                                            <div className="z-12 absolute right-[20px] rounded-md border border-gray-100 bg-white p-2 text-sm text-gray-500 shadow-lg">
                                              <Menu.Item>
                                                {({ active }) => (
                                                  <div
                                                    className={classNames(
                                                      active
                                                        ? "text-gray-700"
                                                        : "text-black",
                                                      "cursor-pointer rounded-sm px-4 py-1 hover:rounded-md hover:border-white hover:bg-[#F0F9FF] hover:text-primary-blue"
                                                    )}
                                                    onClick={() =>
                                                      handleSmsEdit(
                                                        item.id,
                                                        item.eventCategory
                                                      )
                                                    }
                                                  >
                                                    Edit template
                                                  </div>
                                                )}
                                              </Menu.Item>
                                              <Menu.Item>
                                                {({ active }) => (
                                                  <div
                                                    className={classNames(
                                                      active
                                                        ? "text-gray-700"
                                                        : "text-black group-hover:text-white",
                                                      "cursor-pointer rounded-sm px-4 py-1 text-center text-black hover:rounded-md hover:border-white hover:bg-[#F0F9FF] hover:text-primary-blue"
                                                    )}
                                                    onClick={() =>
                                                      smsPublishedTemplate(
                                                        item?.id
                                                      )
                                                    }
                                                  >
                                                    View published template
                                                  </div>
                                                )}
                                              </Menu.Item>
                                            </div>
                                          </Menu.Items>
                                        </Menu>
                                      </div>
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          )
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          className="whitespace-nowrap px-3  text-center text-sm font-bold text-gray-800"
                          colSpan={props.column?.length + 1}
                        >
                          NoData
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      ) : (
        <table className="min-w-full table-fixed gap-y-2 divide-y divide-gray-50 overflow-x-scroll">
          <tbody className="bg-white">
            <tr>
              <td
                className="whitespace-nowrap border border-solid border-b-gray-100 px-3  text-center text-xs font-thin text-gray-600"
                colSpan={props.column?.length + 1}
              >
                No results
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
