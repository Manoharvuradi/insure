import React, { useEffect, useState } from "react";
import withAuth from "../api/auth/withAuth";
import DefaultLayout from "~/components/defaultLayout";
import * as XLSX from "xlsx";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import Modal from "~/common/Modal";
import { CallCenter, UserRole } from "@prisma/client";
import InputField from "~/common/form/input";
import { IEvent } from "~/interfaces/common/form";
import ListView from "~/common/listView";
import Loader from "~/common/loader";
import { contactFilterOptions, contactsColumn } from "~/utils/constants";
import Button from "~/common/buttons/filledButton";
import Pagination from "~/common/Pagination";
import { useRouter } from "next/router";
import {
  contactsFilters,
  dateConversion,
  getMultipleAccessRoles,
} from "~/utils/helpers";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";

const ContactsList = (props: any) => {
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const [contactsData, setContactsData] = useState([]);

  const [searchParams, setSearchParams] = useState("");
  const [uploadModel, setUploadModel] = useState(false);
  const [showCallCenterModal, setShowCallCenterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignedContacts, setAssignedContacts] = useState<
    { callCenterId: string; totalAssigned: number }[]
  >([]);
  const [numberOfContacts, setNumberOfContacts] = useState(0);
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const itemsPerPage = 10;
  const router = useRouter();
  const contactCreate = api.contacts.createMany.useMutation();
  const distributionList = api.contacts.distribute.useMutation();
  const contactDelete = api.contacts.archiveBulk.useMutation();
  const [filParams, setFilParams] = useState("");
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const [sortParams, setSortParam] = useState("");

  const { isLoading, data, error, refetch } = currentRoleAccessLevels?.Contacts
    ?.canView
    ? api.contacts.list.useQuery({
        pageSize: itemsPerPage.toString(),
        offset: currentOffeset.toString(),
        search: searchParams,
        filter: filParams,
        ...(dateRange.startDate
          ? { startDate: dateRange.startDate as any }
          : {}),
        ...(dateRange.endDate ? { endDate: dateRange.endDate as any } : {}),
      })
    : {
        isLoading: false,
        data: null as any,
        error: null as any,
        refetch: null as any,
      };
  const {
    isLoading: userDataLoading,
    data: callCenterData,
    error: hasError,
    refetch: fetching,
  } = api.callCenter.list.useQuery(
    {
      includeCallCenters: true,
    },
    { enabled: true }
  );

  useEffect(() => {
    if (data) {
      const nullCallCenters = data?.unassignedContacts?.filter(
        (entry: any) => entry.callCenterId === null
      );
      const numberOfNullCallCenters = nullCallCenters.length;
      if (numberOfNullCallCenters > 0) {
        setNumberOfContacts(numberOfNullCallCenters);
        setShowCallCenterModal(true);
      }
    }
  }, [data]);
  const handleFileUpload = async (e: any) => {
    const reader = new FileReader();
    let parsedData: any[] = [];
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = sheetName ? workbook.Sheets[sheetName] : [];
      parsedData = sheet ? XLSX.utils.sheet_to_json(sheet) : [];
      // setContactsData(parsedData as []);
      setContactsData(
        parsedData.map((item) => ({ ...item, status: "OPEN" })) as any
      );
    };
  };

  const handlePage = () => {
    refetch();
    fetching();
  };

  const handleUpload = async () => {
    setLoading(true);
    setUploadModel(false);
    try {
      const response = await contactCreate.mutateAsync(contactsData);
      if (response) {
        setLoading(false);
        toast.success("Contact Created Successfully");
        setShowCallCenterModal(true);
      } else {
        toast.error("Error occured while creating contact");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error occured while creating contact");
    } finally {
      refetch();
      fetching();
    }
  };

  const handleNumberOfContacts = (id: any) => (e: IEvent) => {
    const { value } = e.target;

    const existingCompanyIndex = assignedContacts.findIndex(
      (item) => item.callCenterId === id.callCenterId
    );
    if (existingCompanyIndex !== -1) {
      // Update existing object's value
      const updatedObj: any = [...assignedContacts];
      updatedObj[existingCompanyIndex].totalAssigned = value;
      setAssignedContacts(updatedObj);
    } else {
      // Add new object to obj
      const newObj = { callCenterId: id.callCenterId, totalAssigned: value };
      setAssignedContacts([...assignedContacts, newObj]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setShowCallCenterModal(false);
    setLoading(true);
    const currentTotal = assignedContacts.reduce(
      (sum, item) => sum + +item.totalAssigned,
      0
    );
    if (currentTotal > numberOfContacts) {
      toast.error(
        `Entered contacts should be less than or equal to ${numberOfContacts}`
      );
      setLoading(false);
      return;
    }
    const payload: any[] = [];
    let index = 0;
    assignedContacts.map((item) => {
      const subArray: any = data?.unassignedContacts?.slice(
        index,
        +item.totalAssigned + index
      );
      index = +item.totalAssigned + index;
      payload.push({
        callCenterId: item.callCenterId,
        contactIds: subArray.map((subItem: any) => ({ id: subItem.id })),
      });
    });
    try {
      await distributionList
        .mutateAsync({ payload })
        .then((result) => {
          if (result) {
            setLoading(false);
            toast.success("Contacts assigned successfully");
          }
        })
        .catch((error) => {
          setLoading(false);
          toast.error(
            "Error occured while assigning contacts, please try again later"
          );
        });
    } catch (error) {
      setLoading(false);
      toast.error(
        "Error occured while assigning contacts, please try again later"
      );
    } finally {
      setLoading(false);
      refetch();
      fetching();
    }
  };

  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };
  const handleFilter = () => {
    refetch();
  };

  const handleCreateButton = () => {
    return currentRoleAccessLevels?.Contacts?.canCreate ? "Upload" : "";
  };

  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.dateOfPurchase = dateConversion(data?.dateOfPurchase?.toString());
    });
  }

  const handleExport = () => {
    // Example Contacts
    const Contacts = [
      [
        "phone",
        "planType",
        "productCode",
        "order",
        "model",
        "typeOfDevice",
        "imei",
        "masterDealer",
        "dealerRegion",
        "distribution",
        "dateOfPurchase",
        "firstName",
        "lastName",
        "banNumber",
      ],
    ];

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    // Add a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(Contacts);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Convert the workbook to a binary Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create a blob from the binary Excel Contacts
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Contacts.xlsx");

    // Simulate a click on the link to trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up by revoking the URL
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const exportDisplayName = () => {
    return currentRoleAccessLevels?.Contacts?.canCreate ? "File format" : "";
  };

  const deleteMany = async () => {
    setLoading(true);
    const payload: number[] = [];
    if (selectedIds.length > 0) {
      selectedIds.map((item: any) => {
        payload.push(item.id);
      });
    }
    try {
      await contactDelete.mutateAsync(payload).then((result: any) => {
        if (result) {
          toast.success("Contacts deleted successfully");
          setSelectedIds([]);
          refetch();
          fetching();
          setLoading(false);
        } else {
          toast.error("Error occured while deleting contacts");
          setLoading(false);
        }
      });
    } catch (error) {
      toast.error("Error occured while deleting contacts");
      setLoading(false);
    } finally {
      setLoading(false);
      refetch();
      fetching();
    }
  };

  return currentRoleAccessLevels?.Contacts?.canView ? (
    <>
      {(isLoading || loading || userDataLoading) &&
      !dateRange.startDate &&
      !dateRange.endDate &&
      !filParams ? (
        <Loader />
      ) : (
        <ListView
          setFilParam={setFilParams}
          setSearchParam={setSearchParams}
          showFilter={true}
          setSortParam={setSortParam}
          listName="Contacts"
          data={data?.data}
          column={contactsColumn}
          showCreate={currentRoleAccessLevels?.Contacts?.canCreate}
          // showUpload={true}
          onCreate={
            currentRoleAccessLevels?.Contacts?.canCreate
              ? () => setUploadModel(true)
              : undefined
          }
          onRowClick={handleRowClick}
          filterOptions={contactFilterOptions}
          createButton={handleCreateButton()}
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={0}
          isLoading={isLoading}
          handlePage={handlePage}
          paginationCount={Math.ceil(Number(data?.totalCount)) / 10}
          totalCounts={data?.totalCount ?? 0}
          selectedFilterOptionsCount={selectedFilterOptionsCount}
          setSelectedFilterOptionsCount={setSelectedFilterOptionsCount}
          showDateRangePicker={true}
          dateRange={dateRange}
          setDateRange={setDateRange}
          showExport={currentRoleAccessLevels?.Contacts?.canCreate}
          exportButton={exportDisplayName()}
          handleExport={handleExport}
          multipleSelect={true}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          handleDeleteAll={deleteMany}
          showDeleteAll={true}
        />
      )}
      <Pagination
        itemsPerPage={itemsPerPage}
        setCurrentOffset={setCurrentOffset}
        isLoading={isLoading}
        totalCount={Math.ceil(Number(data?.totalCount)) / 10}
        handlePage={handlePage}
        page={currentOffeset / 10}
      />
      {uploadModel && (
        <Modal
          title={"Upload contacts file"}
          onCloseClick={() => {
            setUploadModel(false);
          }}
          border
        >
          <div className="mt-8 flex flex-col items-center">
            <label htmlFor="fileInput" className="mb-2 text-lg">
              Select a file:
            </label>
            <input
              type="file"
              id="fileInput"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="mb-2 w-64 rounded-lg border px-4 py-2"
            />
            <button
              onClick={handleUpload}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600"
            >
              Upload
            </button>
          </div>
        </Modal>
      )}

      {showCallCenterModal && (
        <Modal
          title={"Call Center"}
          onCloseClick={() => {
            setShowCallCenterModal(false);
          }}
          border
        >
          <>
            <p>
              Number of contacts unassigned:{" "}
              <b className="font-bold">{numberOfContacts}</b>
            </p>
            <form onSubmit={handleSubmit}>
              {callCenterData?.data.map((item: any, index: number) => (
                <div key={item.id}>
                  <InputField
                    input={{
                      label: item.callCenterName,
                      name: item.callCenterName,
                      type: "number",
                      required: true,
                    }}
                    formValues={assignedContacts}
                    handleChange={handleNumberOfContacts(item)}
                  />
                </div>
              ))}
              <div className="flex w-full">
                <Button type="submit" text="Save" className="mr-3" />
                <Button
                  text="Cancel"
                  className="mr-3"
                  onClick={() => {
                    // handleRefetch();
                    setShowCallCenterModal(false);
                  }}
                />
              </div>
            </form>
          </>
        </Modal>
      )}
    </>
  ) : (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <NoAccessComponent />
        </>
      )}
    </>
  );
};

export default withAuth(DefaultLayout(ContactsList));
