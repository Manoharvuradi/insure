import { classNames, dateConversion } from "~/utils/helpers";
import Modal from "../Modal";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Loader from "../loader";
import { Menu } from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";
import { toast } from "react-toastify";
import ComponentLoader from "../componentLoader";
import { b64toBlob } from "~/utils/constants";

interface IInfoProps {
  tableData: any;
  refetch?: any;
  category?: any;
}

function InfoTable(props: IInfoProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<any>();
  const [dataType, setDataType] = useState("");
  const [fileReq, setFileReq] = useState({});
  const [enableFileurl, setEnableFileurl] = useState(false);
  const [loader, setLoader] = useState(false);
  const [currentFileName, setCurrentFileName] = useState("");
  const imageOverview = (input: any, data: any) => {
    setCurrentFileName(data?.name ? data?.name : "");
    setFileReq(input);
    setEnableFileurl(true);
    setDataType(data?.type);
    setImageModalOpen(true);
  };
  const {
    isLoading: getUrlLoading,
    data: fileUrl,
    error: getUrlError,
    refetch: getRefetch,
  } = api.uploadLibrary?.gets3url.useQuery(fileReq, {
    enabled: enableFileurl,
  });
  const ArchiveDocument = api.uploadLibrary.update.useMutation();
  const ArchiveAttachment = api.attachments.archive.useMutation();

  useEffect(() => {
    if (fileUrl) {
      const b64Data = fileUrl;
      const blob = b64toBlob(b64Data);
      const blobUrl = URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
    }
  }, [fileUrl]);

  const filteredHeadings = [
    "Date",
    "File Name",
    "Type",
    "Created by",
    "Action",
  ];
  const handleArchive = async (data: any) => {
    setLoader(true);
    if (props.category === "attachments") {
      const req = {
        fileContent: data?.fileUrl,
        name: data?.name,
        type: data?.type,
        isArchived: true,
      };
      try {
        const res = await ArchiveAttachment.mutateAsync({
          id: data.id,
          body: req,
        });
        if (res) {
          toast.success("Attachment archived");
        }
      } catch (error) {
        toast.error("Please try again later");
      } finally {
        setLoader(false);
        props.refetch();
      }
    } else {
      const req = {
        fileContent: data?.fileUrl,
        name: data?.name,
        type: data?.type,
        description: data?.description || "",
        appData: data?.appData || {},
        isArchived: true,
        category: props?.category,
        referenceId: data?.tableId,
      };
      try {
        const res = await ArchiveDocument.mutateAsync({
          id: data.id,
          body: req,
        });
        if (res) {
          toast.success("Document archived");
        }
      } catch (error) {
        toast.error("Please try again later");
      } finally {
        setLoader(false);
        props.refetch();
      }
    }
  };

  return (
    <>
      {loader ? (
        <ComponentLoader />
      ) : (
        <div className="mx-0 cursor-pointer">
          <div className="mt-0 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className=" inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        {filteredHeadings?.map(
                          (title: string, index: number) => {
                            return (
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                key={index}
                              >
                                {title}
                              </th>
                            );
                          }
                        )}
                      </tr>
                    </thead>
                    {props.tableData &&
                      props.tableData.length > 0 &&
                      props.tableData?.map((data: any, index: number) => {
                        return (
                          <tbody
                            className="divide-y divide-gray-200 border-b border-gray-50 bg-white"
                            key={index}
                          >
                            <tr>
                              <td
                                className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                                onClick={() =>
                                  imageOverview(
                                    {
                                      key:
                                        data.s3response?.key ??
                                        data.s3response?.Key,
                                    },
                                    data
                                  )
                                }
                              >
                                {dateConversion(data?.createdAt?.toString())}
                              </td>
                              <td
                                className="whitespace-nowrap px-3 py-4 pl-6 text-sm text-gray-500"
                                onClick={() =>
                                  imageOverview(
                                    {
                                      key:
                                        data.s3response?.key ??
                                        data.s3response?.Key,
                                    },
                                    data
                                  )
                                }
                              >
                                {data?.name}
                              </td>
                              <td
                                className="whitespace-nowrap px-3 py-4 pl-8 text-sm text-gray-500"
                                onClick={() =>
                                  imageOverview(
                                    {
                                      key:
                                        data.s3response?.key ??
                                        data.s3response?.Key,
                                    },
                                    data
                                  )
                                }
                              >
                                {data?.type}
                              </td>
                              <td
                                className=" whitespace-nowrap px-3 py-4 pl-8 text-sm text-gray-500"
                                onClick={() =>
                                  imageOverview(
                                    {
                                      key:
                                        data.s3response?.key ??
                                        data.s3response?.Key,
                                    },
                                    data
                                  )
                                }
                              >
                                {data?.createdBy?.firstName +
                                  " " +
                                  data?.createdBy?.lastName}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                                {!(
                                  data?.name?.includes("Policy schedule") ||
                                  data?.name?.includes("Policy schedule")
                                ) && (
                                  <Menu>
                                    <Menu.Button>
                                      <div className="top-[30%] z-10">
                                        <BsThreeDots
                                          className="cursor-pointer"
                                          color="black"
                                          size={20}
                                        />
                                      </div>
                                    </Menu.Button>
                                    <Menu.Items>
                                      <div className="rounded-md border border-gray-100 bg-white text-sm text-gray-500 shadow-lg">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <div
                                              className={classNames(
                                                active
                                                  ? "text-gray-700"
                                                  : "text-black group-hover:text-white",
                                                "abosolute cursor-pointer rounded-sm p-1 text-black hover:rounded-md hover:border-white hover:bg-telkom-blue hover:text-white"
                                              )}
                                              onClick={() =>
                                                handleArchive(data)
                                              }
                                            >
                                              Archive
                                            </div>
                                          )}
                                        </Menu.Item>
                                      </div>
                                    </Menu.Items>
                                  </Menu>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        );
                      })}
                  </table>
                  {props.tableData && props.tableData.length == 0 && (
                    <div className="text-center"> No Data</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            {imageModalOpen && (
              <Modal
                title={currentFileName}
                onCloseClick={() => setImageModalOpen(false)}
                onSaveClick={() => setImageModalOpen(false)}
                showButtons={false}
                border={false}
              >
                {dataType === "application/pdf" ? (
                  <div className="max-h-[75vh] overflow-auto scrollbar-none">
                    <div className="flex h-full w-full justify-center align-middle">
                      {getUrlLoading ? (
                        <ComponentLoader />
                      ) : (
                        <iframe
                          id="pdfFrame"
                          src={previewUrl}
                          title="PDF"
                          height="600px"
                          width="100%"
                          className="overflow-hidden"
                        ></iframe>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full justify-center align-middle">
                    {getUrlLoading ? (
                      <ComponentLoader />
                    ) : (
                      <img
                        className="h-auto w-[400px] overflow-hidden"
                        src={previewUrl}
                        alt="upload image"
                      />
                    )}
                  </div>
                )}
              </Modal>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default InfoTable;
