import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Loader from "~/common/loader";
import Table from "~/common/table";
import { IClaimComplaintStepComponentProps } from "~/interfaces/claimComplaint";
import { api } from "~/utils/api";
import { packageNames, policyColumn } from "~/utils/constants";
import Modal from "react-modal";
import { dateConversion } from "~/utils/helpers";
import Button from "~/common/buttons/filledButton";
import { ToastContainer, toast } from "react-toastify";
import Image from "next/image";
import Pagination from "~/common/Pagination";
import SecondaryButton from "~/common/buttons/secondaryButton";
import ComponentLoader from "~/common/componentLoader";

function SelectPolicyTable({
  resource,
  claimantFormValues,
  complaintFormValues,
  index,
  onClickStep,
}: IClaimComplaintStepComponentProps & { resource: "claim" | "complaint" }) {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const itemsPerPage = 10;
  const [currentOffeset, setCurrentOffset] = useState(0);
  const { isLoading, data, error, refetch, isFetching } =
    api.policy.list.useQuery({
      filter: "ACTIVE",
      pageSize: itemsPerPage.toString(),
      offset: currentOffeset.toString(),
      search: searchParams,
    });
  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.startDate = dateConversion(data?.startDate?.toString());
      data.createdAt = dateConversion(data?.createdAt?.toString());
    });
  }

  const submitClaim = api.claim.create.useMutation();
  const submitComplaint = api.complaints.create.useMutation();

  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowClicked, setRowClicked] = useState({} as any);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const generatePackage = (packageName: string) => {
    switch (packageName) {
      case packageNames.funeral:
        return "DEATHDETAILS";
      case packageNames.creditLifeMotor:
        return "CREDITLIFE";
    }
  };
  const handleModelSubmit = async () => {
    setLoading(true);
    try {
      if (resource === "claim") {
        const claimResult = await submitClaim.mutateAsync({
          claimant: {
            ...claimantFormValues,
            phone: claimantFormValues.phone.replace(/[\s-]/g, ""),
          },
          claimStatus: "OPEN",
          packageName: rowClicked?.packageName,
          requestedAmount: 0,
          policyId: rowClicked.id as string,
        });
        if (claimResult) {
          toast.success("Claims created successfully", {
            toastId: "createcomplaintSuccess",
            autoClose: 2000,
          });
          setTimeout(() => {
            router.push(`/claim/${claimResult?.id}/show`);
          }, 2000);
        } else {
          setLoading(false);
          toast.error("Error in creating claim.", {
            toastId: "createClaimError",
            autoClose: 2000,
          });
        }
        handleModalClose();
      } else if (resource === "complaint") {
        const complaintResult = await submitComplaint.mutateAsync({
          ...complaintFormValues,
          complainantMobileNumber:
            complaintFormValues?.complainantMobileNumber.replace(/[\s-]/g, ""),
          status: "OPEN",
          policyId: rowClicked.id as string,
          packageName: rowClicked?.packageName,
        });
        if (complaintResult) {
          toast.success("Complaint created successfully", {
            toastId: "createcomplaintSuccess",
            autoClose: 2000,
          });
          setTimeout(() => {
            router.push(`/complaint/${complaintResult?.id}/show`);
          }, 2000);
        } else {
          setLoading(false);
          toast.error("Error in creating complaint.", {
            toastId: "createcomplaintFailed",
            autoClose: 2000,
          });
        }
        handleModalClose();
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unable to submit claim");
    } finally {
      setLoading(false);
    }
  };

  const onRowClick = (item: any) => {
    setRowClicked(item);
    handleModalOpen();
  };

  const dropDownOptions = [
    {
      label: "Edit",
      href: "#",
    },
    {
      label: "Delete",
      href: "#",
    },
  ];

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error]);

  useEffect(() => {
    if (searchText) {
      const delayDebounceFn = setTimeout(() => {
        setSearchParams(searchText);
      }, 500);
      return () => {
        clearTimeout(delayDebounceFn);
      };
    } else {
      setSearchParams("");
    }
  }, [searchText]);

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };
  const handlePage = () => {
    refetch();
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flow-root">
            <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="relative">
                  {isLoading && !searchText ? (
                    <Loader />
                  ) : (
                    <>
                      <div className="flex">
                        <h1 className="p-2 text-2xl">Select a Policy</h1>
                        <div className=" mb-2 ml-auto flex w-[300px] items-center rounded-md border bg-[#d7edfc] pl-6">
                          <Image
                            src="/icons/search-icon.svg"
                            width={20}
                            height={20}
                            alt="search input icon"
                          />
                          <input
                            type="text"
                            value={searchText}
                            onChange={handleSearchTextChange}
                            className="w-[300px] rounded-md border-none bg-[#d7edfc] text-[15px] font-medium text-black focus:ring-0"
                            placeholder="Search"
                          />
                        </div>
                      </div>
                      {isFetching ? (
                        <ComponentLoader />
                      ) : (
                        <Table
                          dropDownOptions={dropDownOptions}
                          data={data && data.data}
                          column={policyColumn}
                          onClick={onRowClick}
                          multipleSelect={false}
                          smallTable={true}
                        />
                      )}
                    </>
                  )}{" "}
                  <Pagination
                    itemsPerPage={itemsPerPage}
                    setCurrentOffset={setCurrentOffset}
                    isLoading={isLoading}
                    totalCount={Math.ceil(data?.totalCount) / 10}
                    handlePage={handlePage}
                  />
                  <div className="mt-5">
                    <Button
                      text={"Back"}
                      onClick={() => onClickStep(index - 1)}
                    />
                  </div>{" "}
                  <Modal
                    isOpen={isModalOpen}
                    onRequestClose={handleModalClose}
                    contentLabel={`Create ${
                      resource === "claim" ? "Claim" : "Complaint"
                    } Modal`}
                    className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
                    overlayClassName="fixed inset-0"
                  >
                    <div className="rounded-lg bg-white p-4 shadow-md ">
                      <h2 className="mb-4 text-lg font-medium">
                        Create {resource === "claim" ? "Claim" : "Complaint"}
                      </h2>
                      <p>
                        Do you want to link your{" "}
                        {resource === "claim" ? "claim" : "complaint"} to{" "}
                        <span className="font-semibold text-blue-600">
                          {rowClicked.policyNumber}{" "}
                        </span>
                        policy
                      </p>
                      <div className="b-0 flex justify-between py-3">
                        <SecondaryButton
                          text="Close"
                          onClick={handleModalClose}
                        />
                        <Button text="Create" onClick={handleModelSubmit} />
                      </div>
                    </div>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SelectPolicyTable;
