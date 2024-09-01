import { useRouter } from "next/router";
import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { api } from "~/utils/api";
import DefaultLayout from "../defaultLayout";
import Loader from "~/common/loader";
import Prism from "prismjs";
import { removeSpecialCharsAndTitleCase } from "~/utils/helpers";
import Image from "next/image";
import Link from "next/link";
import { ComputerDesktopIcon } from "@heroicons/react/20/solid";
import Button from "~/common/buttons/filledButton";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import { UserRole } from "@prisma/client";

function MasterTemplateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const eventNotificationId = router.query.id;
  const [code, setCode] = useState(``);
  const [eventData, setEventData] = useState({} as any);
  const htmlCodeRef = useRef<any>(null);
  const outputRef = useRef<any>(null);
  const highlightingContentRef = useRef<any>(null);
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
      setCode(data?.emailTemplate as any);
    }
  }, [data]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll(highlightingContentRef.current);
    }
  }, []);

  const handleRefetchShow = () => {
    refetchShow();
  };

  const handleEditorChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCode(event.target.value);
  };

  useEffect(() => {
    const htmlCode = htmlCodeRef?.current?.value;
    const iframe = outputRef?.current;
    const iframeDoc =
      iframe?.contentDocument || iframe?.contentWindow?.document;
    iframeDoc?.open();
    iframeDoc?.write(htmlCode);
    iframeDoc?.close();
  }, [data, code, outputRef]);

  const onUpdate = async () => {
    setLoading(true);
    const request: any = {
      eventName: eventData.eventName,
      eventCategory: eventData.eventCategory,
      packageName: eventData.packageName,
      emailTemplate: code,
      emailNotification: eventData.emailNotification,
      smsNotification: eventData.smsNotification,
      smsTemplate: eventData.smsTemplate,
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
        toast.success("Code updated successfully");
        setLoading(false);
      } else {
        setLoading(false);
        toast.error("Please try again later");
      }
    } catch (e) {
      toast.error(
        "Unable to update the code right now. Please try again later."
      );
      setLoading(false);
    } finally {
      handleRefetchShow();
    }
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : currentRole?.includes("SUPER_ADMIN" as UserRole) ? (
        <>
          <div className="flex h-full w-full justify-between p-5">
            <div className="w-[48%]">
              <div className="flex">
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
              <textarea
                id="editing"
                ref={htmlCodeRef}
                defaultValue={code}
                className="absolute z-[1] mt-4 h-[75%] w-[45%] resize-none rounded-lg border border-gray-500 bg-black p-2 font-mono text-base leading-[20pt] text-white caret-white outline-0"
                onChange={handleEditorChange}
              ></textarea>
              <pre
                id="highlighting"
                aria-hidden="true"
                className="absolute z-0 font-mono text-base leading-[20pt]"
              >
                <code
                  className="font-mono text-base leading-[20pt]"
                  ref={highlightingContentRef}
                ></code>
              </pre>
              <div className="absolute bottom-[4%]">
                <Button text="Save" onClick={onUpdate} />
              </div>
            </div>
            <div className="bg-white-300 w-[50%] rounded-3xl border border-gray-300 shadow-2xl">
              <div className="mx-auto mt-6 h-[80%] w-[90%] rounded-3xl bg-gray-200">
                <iframe ref={outputRef} className="h-full w-full p-6" />
              </div>
              <div className="mx-auto mt-10 flex justify-center align-middle text-sm">
                <ComputerDesktopIcon
                  className="-mr-1 h-6 w-6 text-black"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <NoAccessComponent />
      )}
    </>
  );
}
export default DefaultLayout(MasterTemplateView);
