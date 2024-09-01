import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import DefaultLayout from "../defaultLayout";
import { ToastContainer, toast } from "react-toastify";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import Button from "~/common/buttons/filledButton";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import dynamic from "next/dynamic";
import { UserRole } from "@prisma/client";

const Editor = dynamic(() => import("./ckEditor"), { ssr: false });

const SMSTemplate = () => {
  const outputRef = useRef<any>(null);
  const router = useRouter();
  const [eventData, setEventData] = useState({} as any);
  const [htmlCode, setHtmlCode] = useState(
    "<p>This is the initial content of the editor.</p>"
  );
  const [loading, setLoading] = useState(false);
  const eventNotificationId = router.query.id;
  const {
    isLoading,
    data,
    error,
    refetch: refetchShow,
  } = api.eventNotification.show.useQuery(Number(eventNotificationId));
  const updateEventCode = api.eventNotification.update.useMutation();
  const session = useSession();
  const currentRole = session?.data?.user?.roles;
  useEffect(() => {
    if (data) {
      setEventData(data);
      setHtmlCode(data?.smsTemplate as any);
    }
  }, [data]);

  const handleEditorChange = (content: any) => {
    setHtmlCode(content);
  };

  const handleRefetchShow = () => {
    refetchShow();
  };

  useEffect(() => {
    if (outputRef.current) {
      const iframeDoc =
        outputRef.current?.contentDocument ||
        outputRef.current?.contentWindow?.document;
      iframeDoc?.open();
      iframeDoc?.write(htmlCode);
      iframeDoc?.close();
    }
  }, [htmlCode, data]);

  const onUpdate = async () => {
    setLoading(true);
    const request = {
      eventName: eventData.eventName,
      eventCategory: eventData.eventCategory,
      packageName: eventData.packageName,
      emailTemplate: eventData.emailTemplate,
      emailNotification: eventData.emailNotification,
      smsNotification: eventData.smsNotification,
      smsTemplate: htmlCode,
      isArchived: eventData.isArchived,
    };
    try {
      const updateEventData = await updateEventCode.mutateAsync({
        id: Number(data?.id),
        body: {
          ...request,
        },
      });
      if (updateEventData) {
        toast.success("Text updated successfully");
        setLoading(false);
      } else {
        setLoading(false);
        toast.error("Please try again later");
      }
    } catch (e) {
      toast.error(
        "Unable to update the text right now. Please try again later."
      );
      setLoading(false);
    } finally {
      handleRefetchShow();
    }
  };
  const editorComponent = useMemo(
    () => (
      <Editor value={data?.smsTemplate as any} onChange={handleEditorChange} />
    ),
    [data]
  );
  return (
    <>
      {loading ? (
        <Loader />
      ) : currentRole?.includes("SUPER_ADMIN" as UserRole) ? (
        <div className="flex h-full w-full justify-between p-5">
          <div className="w-[48%]">
            <div className="mb-4 flex">
              <Link
                href={"/users/profiles#eventNotifications"}
                className="flex text-base font-bold text-primary-600"
              >
                <Image
                  src="/icons/Backbutton.svg"
                  height={40}
                  width={40}
                  alt="back"
                  className="ml-3"
                />
              </Link>
              <p className="ml-5 mr-5  p-2 text-sm uppercase">
                {data?.eventName.toString().replace(/_/g, " ") + " TEMPLATE"}
              </p>
            </div>
            {editorComponent}

            <div className="absolute bottom-[5%]">
              <Button text="Save" onClick={onUpdate} />
            </div>
          </div>
          <div className="bg-white-300 mr-32 w-[30%] rounded-3xl border border-gray-300 shadow-2xl">
            <div className="mx-auto mt-10 flex w-[100px]">
              <div className="mx-auto h-[10px] w-[60px] rounded-3xl bg-gray-300"></div>
              <div className="mx-auto h-[10px] w-[10px] rounded-full bg-gray-300"></div>
            </div>
            <div className="mx-auto mt-6 h-[80%] w-[90%] rounded-3xl bg-gray-200">
              <iframe ref={outputRef} className="h-full w-full p-6" />
            </div>
            <div className="mx-auto mt-2 h-[40px] w-[40px] rounded-full bg-gray-300"></div>
          </div>
        </div>
      ) : (
        <NoAccessComponent />
      )}
    </>
  );
};

export default DefaultLayout(SMSTemplate);
