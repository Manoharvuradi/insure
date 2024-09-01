import React, { useEffect, useMemo, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Loader from "~/common/loader";
import AddNoteModal from "../addNoteModal";
import TabsBar from "~/common/tabs";
// import { complaintTabs } from "~/utils/constants";
import { ToastContainer, toast } from "react-toastify";
import Modal from "~/common/Modal";
import {
  ComplaintsStatusValues,
  ReasonTitle,
  editComplaint,
} from "~/utils/constants/complaints";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import { IUploadFile } from "~/interfaces/common";
import { BsArrowRightSquareFill } from "react-icons/bs";
import InfoTable from "~/common/infoTable";
import UploadFile from "~/common/uploadFile";
import ImagePreview from "~/common/imagePreview";
import ShowNotesAndActivity from "~/common/showNotesAndActivity";
import { validateEmail, validatePhoneNum } from "~/utils/helpers/validations";
import { checkRequiredFields } from "~/utils/helpers/errors";
import { useSession } from "next-auth/react";
import { AccessLevelsDefinition } from "~/utils/constants";
import { UserRole } from "@prisma/client";
import NoAccessComponent from "~/common/noAccess";
import UploadButton from "~/common/buttons/uploadButton";
import ShowDropdown from "~/common/showDropDown";
import { complaintPhoneInput } from "~/utils/constants/policyholder";
import { getMultipleAccessRoles } from "~/utils/helpers";
import Button from "~/common/buttons/filledButton";
import Status from "~/common/status";
import ArchivedComponent from "~/common/archivedText";

function ComplaintView(props: any) {
  const complaintTabs = [
    {
      name: "complaintDetails",
      label: "Complaint Details",
      key: "1",
      currentTab: false,
    },
    { name: "Documents", label: "Documents", key: "2", currentTab: false },
  ] as const;
  const router = useRouter();
  const complaintId = router.query.id;
  const [activeTab, setActiveTab] = useState("complaintDetails");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState({} as any);
  const [errorData, setErrorData] = useState({} as any);
  const [disable, setDisable] = useState(false);
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const {
    isLoading,
    data,
    error,
    refetch: dataRefetch = () => {},
  } = currentRoleAccessLevels?.Complaints?.canView
    ? api.complaints.show.useQuery(Number(complaintId))
    : {
        isLoading: false,
        data: null as any,
        error: null,
      };
  const [showIsArchiveInComplaint, setShowIsArchiveInComplaint] =
    useState(false);
  const [isArchivedModalInComplaint, setIsArchivedModalInComplaint] =
    useState(false);
  const [showCloseComplaintModel, setShowCloseComplaintModel] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState({ title: "", description: "" });
  const [notes, setNotes]: any = useState([]);
  const [showActivitySection, setShowActivitySection] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [fileStore, setFileStore] = useState<any>([]);
  const [fileUpload, setFileUpload] = useState<any>([]);
  const [files, setFiles] = useState([{ name: "", type: "", fileUrl: "" }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [editComplaintData, setEditComplaintData] = useState({} as any);
  const [reasonValue, setResonValue] = useState<{ [key: string]: string }>({});
  const [showDetails, setShowDetails] = useState({ documents: false });
  const [fileDisable, setFileDisable] = useState<Boolean>(false);
  const updateComplaint = api.complaints.update.useMutation();
  const archivedComplaint = api.complaints.archived.useMutation();
  const updateComplaintStatus = api.complaints.status.useMutation();
  const createFile = api.uploadLibrary.create.useMutation();

  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY;
      setScrollPosition(currentPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    delete complaintData.policyId;
  }, [data]);
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

  useMemo(() => {
    if (data) {
      setComplaintData(data);
      setEditComplaintData(data);
    }
    return null;
  }, [data]);

  const handleFetch = () => {
    dataRefetch();
  };

  const checkProperty = () => {
    setLoading(true);
    if (complaintData?.createdBy && complaintData?.createdBy !== null) {
      complaintData.createdBy =
        data?.createdBy?.firstName + " " + data?.createdBy?.lastName;
    }
    if (complaintData?.updatedBy && complaintData?.updatedBy !== null) {
      complaintData.updatedBy =
        data?.updatedBy?.firstName + " " + data?.updatedBy?.lastName;
    }
  };

  useEffect(() => {
    if (data) {
      setEditComplaintData(data);
    }
  }, [data]);

  const removeKeyValuePair = (key: string) => {
    const clonedObject = { ...complaintData };
    const removedValue = clonedObject[key];
    delete clonedObject[key];
    setComplaintData(clonedObject);
    setResonValue({ [key]: removedValue });
  };

  // Usage
  useEffect(() => {
    removeKeyValuePair("reason");
  }, [data]);

  const onEditSave = async () => {
    setLoading(true);
    setEditOpen(false);
    try {
      const updatedComplaint = await updateComplaint.mutateAsync({
        id: complaintData.id,
        body: {
          policyId: complaintData?.policy?.id,
          status: complaintData.status,
          complainantFirstName: editComplaintData.complainantFirstName,
          complainantLastName: editComplaintData.complainantLastName,
          complainantEmail: editComplaintData.complainantEmail,
          complainantMobileNumber: editComplaintData.complainantMobileNumber,
          reason: editComplaintData.reason,
        },
      });
      if (updatedComplaint) {
        setEditComplaintData(updatedComplaint);
        setComplaintData({
          ...complaintData,
          complainantFirstName: editComplaintData.complainantFirstName,
          complainantLastName: editComplaintData.complainantLastName,
          complainantEmail: editComplaintData.complainantEmail,
          complainantMobileNumber: editComplaintData.complainantMobileNumber,
          reason: editComplaintData.reason,
        });
        setLoading(false);
        toast.success("Complaint details updated successfully");
      } else {
        setLoading(false);
        toast.error("Complaint details update is unsuccessful");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to update claimant please try again later");
    } finally {
      setLoading(false);
      handleFetch();
    }
  };

  let {
    isLoading: noteLoading,
    data: noteData,
    error: noteError,
  } = api.complaintNotes.findByComplaintId.useQuery(
    Number(router.query.id as string)
  );
  let {
    data: activityData,
    refetch,
    error: activityError,
  } = api.complaintsActivity.findByComplaintId.useQuery(
    Number(router.query.id as string)
  );

  const handleRefetch = () => {
    dataRefetch();
  };

  useEffect(() => {
    setNotes(noteData);
  }, [noteData]);

  const addnote = api.complaintNotes.create.useMutation();

  const handleNoteChange = (e: IEvent, index: number = 0) => {
    let form: any = { ...note };
    const { name, value } = e.target;
    form[name] = value;
    setNote({ ...form });
  };

  const handleNoteSubmit = async (title: string, description: string) => {
    setLoading(true);
    let res;
    try {
      const res = await addnote.mutateAsync({
        complaintId: Number(router.query.id),
        title: title,
        description: description,
      });
      if (res) {
        toast.success("Notes added successfully");
        let copy = [...notes];
        copy.push(res);
        setNotes(copy);
        setNote({ title: "", description: "" });
      } else {
        toast.error("Try again later");
      }
    } catch (error) {
      toast.error("Unable to add notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    setOpen(true);
  };

  const handlePhoneChange = (name: string, value: any) => {
    const result = validatePhoneNum(value);
    setErrorData({
      ...errorData,
      [name]: result ? "" : "Invalid phone",
    });
    setEditComplaintData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditComplaint = (e: IEvent): void => {
    const { name, value } = e.target;
    if (name === "complainantEmail") {
      if (validateEmail(value)) {
        setErrorData((prevState: any) => ({
          ...prevState,
          email: "",
        }));
      } else {
        setErrorData((prevState: any) => ({
          ...prevState,
          email: "Invalid email",
        }));
      }
    }

    setEditComplaintData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (data?.createdBy || data?.updatedBy) {
      checkProperty();
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const canArchive =
        !data?.isArchived && currentRoleAccessLevels.Complaints.canDelete;
      setShowIsArchiveInComplaint(canArchive);
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

  const handleIsArchivedInComplaint = () => {
    setIsArchivedModalInComplaint(!isArchivedModalInComplaint);
  };

  useEffect(() => {
    if (data) {
      setFileStore([...data?.fileIds]);
    }
  }, [data]);

  const ComplaintIsArchived = async () => {
    setIsArchivedModalInComplaint(!isArchivedModalInComplaint);
    setLoading(true);
    try {
      const complaintData = await archivedComplaint.mutateAsync({
        id: data?.id ?? 0,
      });
      if (complaintData) {
        toast.success("Complaint archived successfully");
        router.push("/complaint/list");
        setLoading(false);
      } else {
        setLoading(false);
        toast.error("Unbale to archive complaint please try again later");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unbale to archive complaint please try again later");
    } finally {
      setLoading(false);
      handleFetch();
    }
  };

  const handleAlterComplaints = () => {
    setEditOpen(true);
  };

  const handleClosedComplaints = () => {
    setShowCloseComplaintModel(true);
  };

  const closeComplaint = async () => {
    setShowCloseComplaintModel(!showCloseComplaintModel);
    setLoading(true);
    try {
      const closedComplaint: any = await updateComplaintStatus.mutateAsync({
        id: data?.id as number,
        status: "CLOSED",
      });

      if (closedComplaint) {
        router.push("/complaint/list");
        toast.success("Complaint closed successfully");
        setLoading(false);
      } else {
        toast.error("Unable to change the claim status please try again later");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to change the claim status please try again later");
    } finally {
      setLoading(false);
      handleFetch();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const uploadingFiles = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            referenceId: complaintId,
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            category: "complaint",
            createdById: data?.createdById,
          };
          const res = await createFile.mutateAsync(req);
          if (res) {
            toast.success("Document uploaded successfully");
          } else {
            toast.error("Failed to fetch data.", {
              toastId: "createError",
            });
          }
        })
      );

      setFileStore([...fileStore, ...uploadingFiles]);
      setIsModalOpen(false);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch data.", {
        toastId: "createError",
      });
      setLoading(false);
    } finally {
      setLoading(false);
      handleRefetch();
    }
  };

  const handleImagePreviewClose = (index: number) => {
    const removeFileOnClose = [...fileUpload];
    removeFileOnClose.splice(index, 1);
    const convertedFile = [...files];
    convertedFile.splice(index, 1);
    setFileUpload(removeFileOnClose);
    setFiles(convertedFile);
  };

  const imageData = () => {
    const filesCopy: IUploadFile[] = [];
    fileUpload.map((file: any, i: number) => {
      const reader = new FileReader();
      reader?.readAsDataURL(file);
      reader.onload = () => {
        const base64String: any = reader.result;
        filesCopy[i] = {
          name: file.name,
          type: file.type,
          fileUrl: base64String,
          size: file.size / (1024 * 1024),
        };
      };
    });
    setFiles(filesCopy);
  };

  const handleModalOpen = () => {
    setFileUpload([]);
    setIsModalOpen(true);
  };

  const checkFileSize = () => {
    if (fileUpload.length < 1) {
      setButtonDisable(true);
      return;
    }
    const isFileTooLarge = fileUpload.some(
      (file: any) => file.size > 8 * 1024 * 1024
    );
    setButtonDisable(isFileTooLarge);
  };

  useMemo(() => {
    imageData();
    if (fileUpload && fileUpload.length > 0) {
      setButtonDisable(false);
      if (fileDisable) {
        setButtonDisable(true);
      }
    }
    checkFileSize();
    return null;
  }, [fileUpload, fileDisable]);

  const modalClose = () => {
    setSelectedBar(null);
    setImageModalOpen(false);
  };

  const imageOverview = (index: any) => {
    setImageModalOpen(true);
    setSelectedBar(index);
  };
  const closeModal = () => {
    setFileUpload([]);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (error || noteError || activityError) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error, noteError, activityError]);

  useEffect(() => {
    setDisable(!checkRequiredFields(errorData));
  }, [errorData]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  const category = router.pathname.split("/")[1];

  return currentRoleAccessLevels?.Complaints.canView ? (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-row">
          <div className="w-full border-r-2 border-solid border-gray-300">
            <div className="relative flex justify-between border-b">
              <TabsBar
                tabs={complaintTabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleTabChange={handleTabChange}
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

            <div
              className={`flex h-[calc(100vh-85px)] flex-col gap-5 overflow-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md ${
                data?.isArchived ? "bg-gray-300" : "bg-[#f3f7fa]"
              }`}
            >
              <div
                className="center flex justify-between px-5 pt-10"
                id="complaintDetails"
              >
                <div className="flex gap-x-2">
                  <h3 className="text-[26px] font-bold leading-9 text-dark-grey">
                    Complaint Details
                  </h3>
                  <Status status={data?.status} page={"Complaint"} />
                  {data?.isArchived && <ArchivedComponent />}
                </div>
                <div>
                  {currentRoleAccessLevels?.Complaints?.canUpdate &&
                    !data?.isArchived && (
                      <ActionButtons
                        isVisible={true}
                        showAddNotes={true}
                        onClick={handleAddNote}
                        displayAlterComplaints={data?.status == "OPEN"}
                        onClickAlterComplaints={handleAlterComplaints}
                        displayClosedComplaints={data?.status == "OPEN"}
                        onClickClosedComplaints={handleClosedComplaints}
                        showIsArchiveInComplaint={showIsArchiveInComplaint}
                        onClickIsArchivedInComplaint={
                          handleIsArchivedInComplaint
                        }
                      />
                    )}
                </div>
              </div>
              <div className="m-2 mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                <DescriptionList data={complaintData} />
                <div className="mt-4 grid w-full grid-cols-2 items-center justify-between justify-items-center gap-x-[45px] gap-y-4">
                  <div className="grid w-full grid-cols-2">
                    <div className="text-sm font-semibold leading-6 text-gray-900">
                      Policy:
                    </div>
                    <div className=" text-sm leading-6 text-blue-500 underline ">
                      <span
                        className="hover:cursor-pointer"
                        onClick={() => {
                          router.push(
                            `/policy/${complaintData?.policy?.id}/show`
                          );
                        }}
                      >
                        {complaintData?.policy?.policyNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                  <h3 className="text-lg font-semibold">{ReasonTitle}</h3>
                  <p className="text-sm">{reasonValue?.reason}</p>
                </div>
              </div>
              <div
                className="m-2 rounded-[10px] border border-gray-200  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]"
                id="Documents"
              >
                <ShowDropdown
                  id={"Documents"}
                  title={"Documents"}
                  canUpdate={
                    currentRoleAccessLevels?.Complaints?.canUpdate &&
                    !data?.canUpdate
                  }
                  handleEdit={() => handleModalOpen()}
                  handleToggle={() =>
                    setShowDetails({
                      ...showDetails,
                      documents: !showDetails.documents,
                    })
                  }
                  toggleValue={showDetails.documents}
                  dropDownArray={fileStore}
                  category={category}
                  status={data?.status}
                  checkStatus={ComplaintsStatusValues.open}
                  documentRefetch={dataRefetch}
                />
              </div>
            </div>
          </div>
          <ShowNotesAndActivity
            notes={notes}
            activity={activityData}
            showActivitySection={showActivitySection}
          />

          {open && (
            <AddNoteModal
              open={open}
              setOpen={setOpen}
              note={note}
              setNote={setNote}
              handleNoteChange={handleNoteChange}
              handleSubmit={handleNoteSubmit}
            />
          )}

          {isModalOpen && (
            <Modal
              title={"Upload documents"}
              onCloseClick={() => closeModal()}
              onSaveClick={() => handleSubmit()}
              showButtons
              border
              buttonDisabled={buttonDisable}
            >
              <div>
                <div className="mt-10 flex justify-center align-middle">
                  <div className="flex">
                    <UploadFile
                      title={
                        "You can upload your excel sheet or photo to import"
                      }
                      setFileUpload={setFileUpload}
                      fileUpload={fileUpload}
                      uploadMultiple={true}
                    />
                  </div>
                </div>
                <div>
                  {files &&
                    fileUpload.length > 0 &&
                    fileUpload.map((item: any, index: number) => {
                      return (
                        <div
                          className="mb-2 justify-center align-middle"
                          key={index}
                        >
                          <ImagePreview
                            message={item.name}
                            size={item.size}
                            onClick={() => imageOverview(index)}
                            handleClose={() => handleImagePreviewClose(index)}
                            setFileDisable={setFileDisable}
                          />
                        </div>
                      );
                    })}
                </div>
                <div>
                  {imageModalOpen && files && files.length > 0 && (
                    <div>
                      {selectedBar !== null && (
                        <Modal
                          onCloseClick={() => modalClose()}
                          onSaveClick={() => setImageModalOpen(false)}
                          showButtons={false}
                          border={false}
                        >
                          {files[selectedBar]?.type == "application/pdf" ? (
                            <div className="flex h-full w-full justify-center border border-gray-300 align-middle">
                              <iframe
                                src={files[selectedBar]?.fileUrl}
                                title="PDF"
                                height="600px"
                                width="100%"
                                className="overflow-hidden"
                              ></iframe>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <img
                                className="top-0 h-auto w-[400px]"
                                src={files[selectedBar]?.fileUrl}
                                alt="upload image"
                              />
                            </div>
                          )}
                        </Modal>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Modal>
          )}

          {editOpen && (
            <Modal
              title={"Update Complaint"}
              onCloseClick={() => {
                handleRefetch();
                setEditOpen(false);
              }}
              border
              buttonDisabled={disable}
            >
              <div>
                <form onSubmit={onEditSave}>
                  <div className="text-lg font-bold text-gray-900">
                    Complaint Details
                  </div>
                  <FormComponent
                    inputs={editComplaint}
                    formValues={editComplaintData}
                    handleChange={handleEditComplaint}
                    handlePhoneChange={handlePhoneChange}
                    formErrors={errorData}
                    tailwindClass="grid grid-cols-2 gap-4"
                  />
                  <div className="flex w-full">
                    <Button
                      type="submit"
                      text="Save"
                      className="mr-3"
                      disabled={disable}
                    />
                    <Button
                      text="Cancel"
                      className="mr-3"
                      onClick={() => {
                        handleRefetch();
                        setEditOpen(false);
                      }}
                    />
                  </div>
                </form>
              </div>
            </Modal>
          )}

          {showCloseComplaintModel && (
            <Modal
              onCloseClick={() =>
                setShowCloseComplaintModel(!showCloseComplaintModel)
              }
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={closeComplaint}
              title={"Close Complaint"}
            >
              <div>
                <p>Click Confirm to close this complaint</p>
              </div>
            </Modal>
          )}

          {isArchivedModalInComplaint && (
            <Modal
              onCloseClick={() =>
                setIsArchivedModalInComplaint(!isArchivedModalInComplaint)
              }
              showButtons={true}
              okButtonTitle="Confirm"
              onSaveClick={ComplaintIsArchived}
              title={"Archive"}
            >
              <div>
                <p>Click on confirm to Archive</p>
              </div>
            </Modal>
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

export default DefaultLayout(ComplaintView);
