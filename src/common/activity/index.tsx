import { useState, useRef, useEffect, useCallback } from "react";
import { dateConversion, excludeActivityOnClick } from "~/utils/helpers";
import Modal from "../Modal";
import {
  JsonView,
  allExpanded,
  darkStyles,
  defaultStyles,
} from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import GetUrl from "../activityGet3Url";

export default function Activity({ activity }: any) {
  // const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });
  const [data, setData] = useState<any>([]);
  const [activityModal, setActivityModal] = useState(false);
  const [s3Url, setS3Url] = useState({});
  const [showAttachment, setShowAttachment] = useState(false);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [packageKeys, setPackageKeys] = useState([]);

  function convertStringToTitleCase(title: string, input: string): string {
    if (typeof input !== "string" || !input.trim()) {
      return "";
    }
    if (title == "lastName") {
      let words = input?.toLowerCase();
      return words;
    } else {
      let words = input?.toLowerCase().split(" ");
      const capitalizedWords = words.map((word) => {
        const firstLetter = word.charAt(0).toUpperCase();
        const restOfWord = word.slice(1);
        return firstLetter + restOfWord;
      });
      return capitalizedWords.join(" ");
    }
  }

  const handleShowDescripton = (des: any, id: any) => {
    if (
      des?.name === "Mail sent successfully" ||
      des?.name === "Mail sent failed" ||
      des?.name === "Sms sent successfully" ||
      des?.name === "Sms sent failed" ||
      des?.name === "Documents updated"
    ) {
      if (
        des?.description?.data[0]?.attachment !== undefined &&
        (des?.name === "Mail sent successfully" ||
          des?.name === "Mail sent failed")
      ) {
        if (des?.description?.data[0]?.attachment) {
          setS3Url({ key: des?.description?.data[0]?.attachment });
          setPackageKeys(des?.description?.data[0]?.packageKeyAttachments);
          setShowAttachment(true);
        } else {
          setShowAttachment(false);
        }
      }
      setData(des);
    } else {
      setShowName(true);
      setName(des?.name);
      setData(des?.differences);
    }
    setActivityModal(true);
  };

  return (
    <div className="flow-root p-4">
      <ul role="list" className="-mb-8">
        {activity &&
          activity.map((item: any, index: number) => {
            return (
              <li key={index}>
                <div className="relative pb-8">
                  {index !== activity.length - 1 ? (
                    <span
                      className="absolute left-3 top-[21px] -ml-px h-[75%] w-0.5 bg-gray-300"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-gray-300 ring-4 ring-white">
                        <span
                          className={`h-3 w-3 ${
                            index === 0 ? "bg-green-500" : "bg-green-200"
                          }  rounded-full`}
                        ></span>
                      </span>
                    </div>
                    <div
                      className={`flex min-w-0 flex-1 ${
                        excludeActivityOnClick.includes(item?.name)
                          ? ""
                          : "cursor-pointer"
                      } flex-col justify-between space-x-4 rounded-md bg-gray-100 p-2 shadow-md hover:bg-white`}
                      onClick={() => {
                        if (!excludeActivityOnClick.includes(item?.name)) {
                          setActivityModal(true);
                          handleShowDescripton(item, item.id);
                        }
                      }}
                    >
                      <div className="">
                        <p className=" text-sm font-medium text-gray-900">
                          {item.name}{" "}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <p className="text-right text-xs font-semibold">
                          {convertStringToTitleCase(
                            "firstName",
                            item.createdBy?.firstName
                          )}{" "}
                          {convertStringToTitleCase(
                            "lastName",
                            item.createdBy?.lastName
                          )}{" "}
                          at
                        </p>
                        <p className="text-right text-[10px]">
                          <span> {dateConversion(item.createdAt)} </span>
                          {item.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        {activityModal && (
          <Modal
            onCloseClick={() => {
              setActivityModal(!activityModal);
              setShowName(false);
              setShowAttachment(false);
            }}
            onCloseButton={true}
            title={showName ? name : data?.name}
          >
            <>
              {data?.description?.data?.length > 0 ? (
                <div>
                  {data?.description?.data?.map((item: any, index: number) => {
                    const emailDisplay = item?.email
                      ? `Message: ${item?.email} ${
                          item?.status
                            ? ` for event name ${item?.eventName}`
                            : "not verified"
                        }`
                      : "";
                    const phoneNumberDisplay = item?.phoneNumber
                      ? `Message: ${item?.phoneNumber} ${
                          item?.status
                            ? `for event name ${item?.eventName}`
                            : "is not valid"
                        }`
                      : "";
                    const smsHtmlCode = item?.smsConvert;
                    const smsPlainText = smsHtmlCode
                      ?.replace(/<br>/g, "\n")
                      .replace(/<\/?[^>]+(>|$)/g, "");
                    const htmlCode = item?.emailConvert;
                    const htmlPlainText = htmlCode
                      ?.replace(/<br>/g, "\n")
                      .replace(/<\/?[^>]+(>|$)/g, "");

                    return (
                      <div key={index} className="">
                        {data?.name === "Mail sent successfully" ||
                        data?.name === "Mail sent failed" ? (
                          <>
                            {emailDisplay && (
                              <p className="text-sm">{emailDisplay}</p>
                            )}
                            {htmlPlainText && (
                              <iframe
                                title="Email Content"
                                className="mt-2 h-[250px] w-[100%] overflow-auto rounded-md border border-primary-500 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md"
                                srcDoc={`
                                      <div style="white-space: pre-line;">
                                        <pre>${htmlPlainText}</pre>
                                      </div>
                                    `}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            {phoneNumberDisplay && (
                              <p className="text-sm">{phoneNumberDisplay}</p>
                            )}
                            {smsPlainText && (
                              <iframe
                                title="SMS Content"
                                className="mt-2 h-[250px] w-[100%] overflow-auto rounded-md border border-primary-500 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md"
                                srcDoc={`
                                        <div style="white-space: pre-line;">
                                          <pre>${smsPlainText}</pre>
                                        </div>
                                      `}
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {/* <div className="rounded-md border border-primary-500 p-5">
                    <DynamicReactJson
                      src={necessaryFields(data)}
                      name="data"
                      theme="rjv-default" // Choose a theme
                      iconStyle="triangle" // Choose icon
                      collapsed={1} // Start with all levels expanded
                      displayDataTypes={false} // Hide data types
                      enableClipboard={true} // Disable copy to clipboard
                    />
                  </div>  */}
                  <div className="rounded-md border border-primary-500 p-5">
                    <JsonView
                      data={data}
                      shouldInitiallyExpand={allExpanded}
                      style={defaultStyles}
                    />
                  </div>
                </>
              )}
              {showAttachment && (
                <GetUrl data={s3Url} packageKeys={packageKeys} />
              )}
            </>
          </Modal>
        )}
      </ul>
    </div>
  );
}
