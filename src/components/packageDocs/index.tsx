import { getUrl } from "@trpc/client/dist/links/internals/httpUtils";
import { useSession } from "next-auth/react";
import React, { useState, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Modal from "~/common/Modal";
import Button from "~/common/buttons/filledButton";
import UploadButton from "~/common/buttons/uploadButton";
import ComponentLoader from "~/common/componentLoader";
import FormComponent from "~/common/form";
import InputField from "~/common/form/input";
import ImagePreview from "~/common/imagePreview";
import InfoTable from "~/common/infoTable";
import DescriptionList from "~/common/showDetails/tableView";
import ShowDropdown from "~/common/showDropDown";
import UploadFile from "~/common/uploadFile";
import { IUploadFile, packageNameoptions } from "~/interfaces/common";
import { IEvent, IInput, IOption } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import Image from "next/image";
import {
  PackageNamesObject,
  editPackageRulesInput,
  inputPackageName,
  inputpackages,
  packageNameOptions,
  packageRuleLimits,
  updateInputpackages,
} from "~/utils/constants";
import {
  dateConversion,
  getExistPackages,
  getPackagesModified,
} from "~/utils/helpers";
import Premium from "../premium";
import { Package, PackageName } from "@prisma/client";
import EditButton from "~/common/buttons/editButton";
import { AiOutlineDelete } from "react-icons/ai";
import AddButton from "~/common/buttons/addButton";
import { DeviceFarm } from "aws-sdk";
import DisplayTable from "../displayTable";
import DeleteButton from "~/common/buttons/deleteButton";

interface IPackageRule {
  id?: number;
  packageName?: string;
  ruleStartDate: Date;
  packageRuleLimit: IPackageLimit[];
}

interface IPackageLimit {
  id?: number;
  freeCoverBenefitAmount?: number;
  freeCoverPremium?: number;
  aditionalCoverPercentage?: number;
  minValue?: number;
  maxValue?: number;
}

const PackageDocuments = () => {
  const [packageId, setPackageId] = useState<any>();

  // const [selectPackage, setSelectPackage] = useState<any>("");
  const [formValues, setFormValues] = useState({} as IPackageRule);
  const [modalOpen, setModalOpen] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);
  const [openPackageRule, setOpenPackageRule] = useState(false);
  const [fileUpload, setFileUpload] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([{ name: "", type: "", fileUrl: "" }]);
  const [fileStore, setFileStore] = useState<any>([]);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [createPackages, setCreatePackages] = useState(inputpackages);
  const [disable, setDisable] = useState(false);
  const [coverAmount, setCoverAmount] = useState({} as any);
  const [fileDisable, setFileDisable] = useState<Boolean>(false);
  const [openEditPackageRule, setOpenEditPackageRule] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState(0);
  const [createPackageRules, setCreatePackageRules] = useState(
    {} as IPackageRule
  );
  const [currentPackage, setCurrentPackage] = useState({
    packageName: "" as PackageName,
  });
  const createPackage: any = api.packages.createPackage.useMutation();
  const createPackageRule = api.packages.createPackageRule.useMutation();
  const updatePackage = api.packages.update.useMutation();
  const deletePackageRule = api.packages.deletePackageRule.useMutation();
  const deletePackageLimit = api.packages.deleteLimit.useMutation();
  const {
    data: getPackages,
    isLoading,
    refetch: refetchPackage = () => {},
  } = api.packages.getPackages.useQuery();
  const session = useSession();

  useEffect(() => {
    if (getPackages) {
      const updatedPackages = getPackages?.map((pkg: any) => {
        const updatedRules = pkg?.packageRules?.map((rule: any) => ({
          ...rule,
          ruleStartDate: dateConversion(rule?.ruleStartDate),
        }));
        return {
          ...pkg,
          packageRules: updatedRules,
        };
      });
      setFileStore(updatedPackages);
    }
  }, [getPackages]);

  useEffect(() => {
    const packageNames = getExistPackages(getPackages);
    const inputProperties = [
      {
        label: "Package Name",
        type: "select",
        name: "packageName",
        required: true,
        options: packageNames,
      },
    ];
    setCreatePackages(inputProperties);
    if (packageNames.length < 2) {
      setDisable(true);
    }
  }, [getPackages]);

  useEffect(() => {
    if (getPackages && getPackages?.length) {
      const packageNames = getExistPackages(getPackages);
      const inputProperties = [
        {
          label: "Package Name",
          type: "select",
          name: "packageName",
          required: true,
          options: packageNames,
        },
      ];
      setCreatePackages(inputProperties);
    }
  }, [getPackages]);

  const closeModal = () => {
    setFileUpload([]);
    setModalOpen(false);
  };

  const handleDocumentsSubmit = async () => {
    setLoading(true);
    setModalOpen(false);
    try {
      const uploadFiles: any[] = [];
      const uploadingFiles = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            createdById: session.data?.user?.id,
          };
          uploadFiles?.push(req);
          return req;
        })
      );
      const request: any = {
        attachments: uploadFiles,
      };
      const response = await updatePackage.mutateAsync({
        id: packageId,
        body: request,
      });
      if (response) {
        toast.success("successfully updated details");
        setFileStore([...fileStore, ...uploadingFiles]);
      }
      setLoading(false);
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to upload document.");
      setLoading(false);
    } finally {
      setLoading(false);
      setFileUpload([]);
      refetchPackage();
    }
  };

  const imageOverview = (index: any) => {
    setImageModalOpen(true);
    setSelectedBar(index);
  };

  const modalClose = () => {
    setSelectedBar(null);
    setImageModalOpen(false);
  };

  const handleImagePreviewClose = (index: number) => {
    const removeFileOnClose = [...fileUpload];
    removeFileOnClose.splice(index, 1);
    const convertedFile = [...files];
    convertedFile.splice(index, 1);
    setFileUpload(removeFileOnClose);
    setFiles(convertedFile);
    setButtonDisable(true);
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

  useMemo(() => {
    imageData();
    if (fileUpload && fileUpload.length > 0) {
      setButtonDisable(false);
      if (fileDisable) {
        setButtonDisable(true);
      }
    }
    return null;
  }, [fileUpload, fileDisable]);

  const handleSelectPackage = (e: IEvent) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleCreatePackage = async () => {
    setPackageOpen(false);
    setLoading(true);
    try {
      const uploadedFiles: any[] = [];
      const uploadingFiles: any = await Promise.all(
        files.map(async (file) => {
          const req: any = {
            name: file.name,
            type: file.type,
            fileContent: file.fileUrl,
            createdById: session.data?.user?.id,
          };
          uploadedFiles?.push(req);
          return req;
        })
      );
      const request: any = {
        attachments: uploadedFiles,
        packageName: formValues.packageName,
      };
      const getPackage = await createPackage.mutateAsync(request);
      if (getPackage) {
        toast.success("Package created Successfully");
        setFileStore([...fileStore, ...uploadingFiles]);
      } else {
        setLoading(false);
        toast.error("Error occured");
      }
    } catch (error) {
      setLoading(false);
      toast.error("please try again later");
    } finally {
      setLoading(false);
      refetchPackage();
      setFileUpload([]);
    }
  };

  const handleClick = (packageId: number) => {
    setPackageId(packageId);
    setModalOpen(true);
  };

  const editPackageRule = (
    packageIndex: any,
    ruleIndex: any,
    packageId: any,
    ruleId: any
  ) => {
    setOpenEditPackageRule(true);
    setCurrentPackageId(packageId);
    setFormValues({
      id: fileStore?.[packageIndex]?.packageRules?.[ruleIndex]?.id,
      ruleStartDate:
        fileStore?.[packageIndex]?.packageRules?.[ruleIndex]?.ruleStartDate,
      packageRuleLimit:
        fileStore?.[packageIndex]?.packageRules?.[ruleIndex]?.ruleLimits,
    });
  };

  const onPackageRuleEditSave = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    const updatedRule = {
      id: formValues?.id,
      ruleStartDate: new Date(formValues?.ruleStartDate),
      ruleLimits: formValues?.packageRuleLimit.map((rule: IPackageLimit) => ({
        ...rule,
        aditionalCoverPercentage: Number(rule?.aditionalCoverPercentage),
        freeCoverBenefitAmount: Number(rule?.freeCoverBenefitAmount),
        freeCoverPremium: Number(rule?.freeCoverPremium),
        minValue: Number(rule?.minValue),
        maxValue: Number(rule?.maxValue),
      })),
    };
    const req = {
      id: currentPackageId,
      body: {
        packageRules: [updatedRule],
      },
    };
    try {
      const updatedRules = await updatePackage.mutateAsync(req);
      if (updatedRules) {
        toast.success("Rules updated successfully");
      } else {
        toast.error("Rules not updated");
      }
    } catch (error) {
      toast.error("Cannot update package");
    } finally {
      setOpenEditPackageRule(false);
      setLoading(false);
    }
  };

  const onPackageRuleCreateSave = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        packageid: currentPackageId,
        ruleStartDate: new Date(createPackageRules.ruleStartDate),
        ruleLimits: createPackageRules.packageRuleLimit.map((limit: any) => {
          return {
            freeCoverBenefitAmount: Number(limit?.freeCoverBenefitAmount),
            freeCoverPremium: Number(limit?.freeCoverPremium),
            aditionalCoverPercentage: parseInt(limit?.aditionalCoverPercentage),
            minValue: Number(limit?.minValue),
            maxValue: Number(limit?.maxValue),
          };
        }),
      };
      const createdRule = await createPackageRule.mutateAsync(payload);
      if (createdRule) {
        toast.success("Successfully created Rule");
      } else {
        toast.error("Error creating Rule");
      }
    } catch (error) {
      toast.error("Cannot Create Rule");
    } finally {
      setLoading(false);
      refetchPackage();
      setOpenPackageRule(false);
    }
  };
  const removeLimit = async (index: any) => {
    const currentPackageRulesDetails = { ...createPackageRules };
    currentPackageRulesDetails.packageRuleLimit.splice(index, 1);
    setCreatePackageRules({ ...currentPackageRulesDetails });
  };

  const removeLimitInEdit = async (index: any) => {
    if (formValues?.packageRuleLimit[index]?.id) {
      try {
        setLoading(true);
        const deleteLimit = await deletePackageLimit.mutateAsync({
          id: Number(formValues?.packageRuleLimit[index]?.id),
        });
        if (deleteLimit) {
          const currentPackageRulesDetails = { ...formValues };
          currentPackageRulesDetails.packageRuleLimit.splice(index, 1);
          setFormValues({ ...currentPackageRulesDetails });
          toast.success("Liimit deleted successfully");
        } else {
          toast.error("Cannot delete Rule");
        }
      } catch (error) {
        toast.error("Cannot delete Rule");
      } finally {
        setLoading(false);
      }
    } else {
      const currentPackageRulesDetails = { ...formValues };
      currentPackageRulesDetails.packageRuleLimit.splice(index, 1);
      setFormValues({ ...currentPackageRulesDetails });
    }
  };

  const handleDeleteRule = async (packageIndex: any, ruleIndex: any) => {
    setLoading(true);
    try {
      const deletedRule = await deletePackageRule.mutateAsync({
        id: fileStore?.[packageIndex]?.packageRules?.[ruleIndex]?.id,
      });
      if (deletedRule) {
        toast.success("Rule deleted successfully");
      } else {
        toast.error("Cannot delete Rule ");
      }
    } catch (error) {
      toast.error("Cannot delete Rule ");
    } finally {
      setLoading(false);
    }
  };

  const addNewRule = () => {
    setCreatePackageRules({
      ...createPackageRules,
      packageRuleLimit: [...createPackageRules?.packageRuleLimit, {}],
    });
  };

  const addNewLimit = () => {
    setFormValues({
      ...formValues,
      packageRuleLimit: [...formValues?.packageRuleLimit, {}],
    });
  };
  const handlePackageRuleChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = createPackageRules;
    if (name == "ruleStartDate") {
      setCreatePackageRules({ ...createPackageRules, ruleStartDate: value });
    } else {
      form.packageRuleLimit[index][name] = value;
      setCreatePackageRules({ ...form });
    }
  };
  const handlePackageRuleEditChange = (e: IEvent, index: number = 0) => {
    const { name, value } = e.target;
    const form: any = formValues;
    if (name == "ruleStartDate") {
      setFormValues({ ...formValues, ruleStartDate: value });
    } else {
      form.packageRuleLimit[index][name] = value;
      setFormValues({ ...form });
    }
  };
  const handleAddRule = (id: any, packageName: any) => {
    setCurrentPackageId(id);
    setCurrentPackage(packageName);
    setOpenPackageRule(true);
    setCreatePackageRules({ ...createPackageRules, packageRuleLimit: [{}] });
  };
  const [openCards, setOpenCards] = useState([] as any);

  const toggleCard = (index: any) => {
    if (openCards.includes(index)) {
      setOpenCards(openCards.filter((i: any) => i !== index));
    } else {
      setOpenCards([...openCards, index]);
    }
  };

  return (
    <>
      {loading || isLoading ? (
        <ComponentLoader />
      ) : (
        <>
          <div className="my-2 flex w-full justify-between bg-white shadow-md">
            <div className="my-auto flex h-16 w-full justify-between">
              <div className="ml-5 mt-1 text-xl font-bold leading-9 text-dark-grey">
                Package Documents
              </div>
              <AddButton
                name={"Add Package"}
                handleClick={() => setPackageOpen(true)}
                className="mx-6 mt-3"
                disabled={disable}
              />
            </div>
          </div>
          {!fileStore.length ? (
            <>
              <div className="mx-auto mt-10 w-full text-center text-dark-grey">
                {" "}
                No data
              </div>
            </>
          ) : (
            <>
              {fileStore?.map((item: any, packageIndex: number) => {
                const { id, attachments, packageName, packageRules } = item;
                const isCardOpen = openCards.includes(packageIndex);
                return (
                  <div
                    key={packageIndex}
                    className={`m-10 text-gray-400 shadow-xl ${
                      isCardOpen ? "open" : "closed"
                    }`}
                  >
                    <div className="ml-5 flex place-content-between text-xl font-bold leading-9 text-dark-grey">
                      <div>{PackageNamesObject[item?.packageName]}</div>
                      <div className="flex">
                        <AddButton
                          className=""
                          name="Add Rule"
                          handleClick={() => {
                            handleAddRule(id, packageName);
                          }}
                        />
                        <button
                          className="ml-4"
                          onClick={() => toggleCard(packageIndex)}
                        >
                          <Image
                            src="/icons/DropdownIcon.svg"
                            height={24}
                            width={24}
                            alt="drop down"
                            className={`} mr-4`}
                          />
                        </button>
                      </div>
                    </div>
                    {/* ... rest of your card content */}
                    {openCards.includes(packageIndex) && (
                      <div className={`transition-all duration-500`}>
                        <div className="ml-5">
                          {packageRules?.length > 0 && (
                            <div className="rounded-[10px] bg-white p-4 transition-all duration-1000">
                              {packageRules.map(
                                (item: any, ruleIndex: number) => (
                                  <div
                                    key={ruleIndex}
                                    className="mb-4 items-center justify-between rounded-md border p-5 shadow-xl"
                                  >
                                    <div className={` float-right flex`}>
                                      <EditButton
                                        className=" mr-2"
                                        handleClick={() => {
                                          editPackageRule(
                                            packageIndex,
                                            ruleIndex,
                                            id,
                                            item.id
                                          );
                                        }}
                                      />
                                      {/* <DeleteButton
                                      handleDelete={() => {
                                        handleDeleteRule(packageIndex, ruleIndex);
                                      }}
                                    /> */}
                                    </div>
                                    <DescriptionList data={item} />
                                    <DisplayTable
                                      headings={[
                                        "minValue",
                                        "maxValue",
                                        "aditionalCoverPercentage",
                                        "freeCoverBenefitAmount",
                                        "freeCoverPremium",
                                      ]}
                                      data={item?.ruleLimits}
                                      className={`mt-2`}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        {attachments?.length >= 0 && (
                          <div>
                            <h2 className="text-l ml-5 font-bold text-dark-grey">
                              Attachments
                            </h2>
                            <div className={"flex flex-row"}>
                              <div className="m-10 w-[95%]">
                                <InfoTable
                                  category={"attachments"}
                                  tableData={attachments}
                                  refetch={refetchPackage}
                                />
                              </div>
                              <div className={"mr-3 mt-10"}>
                                {packageName && (
                                  <UploadButton
                                    handleClick={() => handleClick(item?.id)}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
      {packageOpen && (
        <Modal
          title={"Create Package"}
          onCloseClick={() => setPackageOpen(false)}
          border
        >
          <div>
            <form onSubmit={handleCreatePackage}>
              <FormComponent
                inputs={createPackages}
                handleChange={handleSelectPackage}
                formValues={formValues}
              />
              <div className="mt-10 flex justify-center align-middle">
                <div className="flex">
                  <UploadFile
                    title={"You can upload your excel sheet or photo to import"}
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
                        className="mb-2 justify-center align-middle "
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
              <div className="flex w-full justify-end">
                <Button text="Save" type={"submit"} className="mr-3" />
                <Button
                  text="Cancel"
                  onClick={() => {
                    setPackageOpen(false);
                  }}
                />
              </div>
            </form>
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

      {openPackageRule && (
        <Modal
          title={"Create Package Rules"}
          onCloseClick={() => {
            setOpenPackageRule(false);
            refetchPackage();
          }}
          border
        >
          {loading ? (
            <ComponentLoader />
          ) : (
            <form
              onSubmit={onPackageRuleCreateSave}
              className="max-h-[75vh] overflow-auto scrollbar-none"
            >
              <FormComponent
                inputs={editPackageRulesInput}
                formValues={createPackageRules}
                handleChange={handlePackageRuleChange}
                formErrors={undefined}
                tailwindClass="grid grid-cols-2 gap-4"
              />
              {createPackageRules.packageRuleLimit?.map(
                (item: IPackageLimit, index: number) => {
                  return (
                    <div key={index} className="mb-3">
                      <div className="mt-3 flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                        <div className="text-lg font-bold text-gray-900">
                          Limit {index + 1}
                        </div>
                        {createPackageRules.packageRuleLimit.length > 1 && (
                          <span>
                            <AiOutlineDelete
                              color="red"
                              onClick={() => {
                                removeLimit(index);
                              }}
                            />
                          </span>
                        )}
                      </div>
                      <div className="rounded border border-gray-300 p-5">
                        <FormComponent
                          inputs={packageRuleLimits}
                          formValues={item}
                          index={index}
                          handleChange={handlePackageRuleChange}
                          formErrors={undefined}
                          tailwindClass="grid grid-cols-2 gap-4"
                        />
                      </div>
                    </div>
                  );
                }
              )}
              <AddButton
                className="mt-2 justify-center"
                name="Add Limit"
                handleClick={() => addNewRule()}
              />
              <div className="mt-5 flex w-full justify-center">
                <Button
                  text="Save"
                  type={"submit"}
                  className="mr-3"
                  // disabled={disable}
                />
              </div>
            </form>
          )}
        </Modal>
      )}

      {openEditPackageRule && (
        <Modal
          title={"Edit PackageRules"}
          onCloseClick={() => {
            setOpenEditPackageRule(false);
            refetchPackage();
          }}
          border
        >
          {loading ? (
            <ComponentLoader />
          ) : (
            <form
              onSubmit={onPackageRuleEditSave}
              className="max-h-[75vh] overflow-auto scrollbar-none"
            >
              <FormComponent
                inputs={editPackageRulesInput}
                formValues={formValues}
                handleChange={handlePackageRuleEditChange}
                formErrors={undefined}
                tailwindClass="grid grid-cols-2 gap-4"
              />
              {formValues.packageRuleLimit?.map(
                (item: IPackageLimit, index: number) => {
                  return (
                    <div key={index}>
                      <div className="flex justify-between pb-2 text-base font-semibold leading-7 text-gray-900">
                        <div className="text-lg font-bold text-gray-900">
                          Limit {index + 1}
                        </div>
                        {formValues.packageRuleLimit?.length > 1 && (
                          <span>
                            <AiOutlineDelete
                              color="red"
                              onClick={() => {
                                removeLimitInEdit(index);
                              }}
                            />
                          </span>
                        )}
                      </div>
                      <FormComponent
                        inputs={packageRuleLimits}
                        formValues={item}
                        index={index}
                        handleChange={handlePackageRuleEditChange}
                        formErrors={undefined}
                        tailwindClass="grid grid-cols-2 gap-4"
                      />
                    </div>
                  );
                }
              )}
              <div className="mt-5 flex w-full justify-center">
                <Button text="Save" type={"submit"} className="mr-3" />
                <AddButton name="Add Limit" handleClick={() => addNewLimit()} />
              </div>
            </form>
          )}
        </Modal>
      )}

      {modalOpen && (
        <Modal
          title={"Upload documents"}
          onCloseClick={() => {
            closeModal();
          }}
          border
          buttonDisabled={buttonDisable}
        >
          <div>
            <form onSubmit={handleDocumentsSubmit}>
              <UploadFile
                title={"You can upload your excel sheet or photo to import"}
                setFileUpload={setFileUpload}
                fileUpload={fileUpload}
                uploadMultiple={true}
              />
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
              <div className="flex w-full justify-end">
                <Button text="Save" type={"submit"} className="mr-3" />
                <Button
                  text="Cancel"
                  onClick={() => {
                    closeModal();
                  }}
                />
              </div>
            </form>
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
    </>
  );
};

export default PackageDocuments;
