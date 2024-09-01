import { useEffect, useLayoutEffect, useState } from "react";
import DefaultLayout from "~/components/defaultLayout";
import Loader from "~/common/loader";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import { ToastContainer, toast } from "react-toastify";
import ErrorComponent from "~/common/errorPage";
import Pagination from "~/common/Pagination";
import { api } from "~/utils/api";
import {
  vehicleDataFilter,
  validateEmail,
  vehicleDataHeaders,
  vehicleData,
} from "~/utils/constants";
import { useRouter } from "next/router";
import ListView from "~/common/listView";
import withAuth from "~/pages/api/auth/withAuth";
import { UserRole } from "@prisma/client";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import Modal from "~/common/Modal";
import InputField from "~/common/form/input";
import { IEvent } from "~/interfaces/common/form";
import { vehicleInputFields } from "~/utils/constants/vehicleData";
import FormComponent from "~/common/form";

export interface IVehicleData {
  AreaOffice?: string;
  EngineNumber?: string;
  Make?: string;
  MarketValue?: string;
  MMNumber?: string;
  Model?: string;
  RecordId?: string;
  RegistrationNumber?: string;
  RetailPrice?: string;
  TradePrice?: string;
  TransactionNumber?: string;
  VehicleRef?: string;
  VINNumber?: string;
  WRTYEnd?: string;
  WRTYStart?: string;
  YearModel?: string;
  VehicleNumber?: string;
}

const VehicleData = (props: any) => {
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showDeleteAllModel, setShowDeleteAllModel] = useState(false);
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [getUserData, setGetUserData] = useState();
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const [filterOptions, setFilterOptions] = useState({ ...vehicleDataFilter });
  const itemsPerPage = 10;
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const [formValues, setFormValues] = useState({
    AreaOffice: "",
    EngineNumber: "",
    Make: "",
    MarketValue: "",
    MMNumber: "",
    Model: "",
    RecordId: "",
    RegistrationNumber: "",
    RetailPrice: "",
    TradePrice: "",
    TransactionNumber: "",
    VehicleRef: "",
    VINNumber: "",
    WRTYEnd: "",
    WRTYStart: "",
    YearModel: "",
    VehicleNumber: "",
  });
  const [formErrors, setFormErrors] = useState({
    AreaOffice: "",
    EngineNumber: "",
    Make: "",
    MarketValue: "",
    MMNumber: "",
    Model: "",
    RecordId: "",
    RegistrationNumber: "",
    RetailPrice: "",
    TradePrice: "",
    TransactionNumber: "",
    VehicleRef: "",
    VINNumber: "",
    WRTYEnd: "",
    WRTYStart: "",
    YearModel: "",
    VehicleNumber: "",
  });
  const router = useRouter();
  const {
    isLoading: userDataLoading,
    data,
    error: hasError,
    refetch: refetechVehicleData,
    isFetching,
  } = api.vehicleData.list.useQuery({
    pageSize: itemsPerPage.toString(),
    offset: currentOffeset.toString(),
    search: searchParams,
    filter: filParams,
    sort: sortParams,
  });

  const createVehicleData = api.vehicleData.createMany.useMutation();
  const deleteAll = api.vehicleData.deleteAll.useMutation();
  const createOneVehicleData = api.vehicleData.create.useMutation();

  useEffect(() => {
    document.title = "Telkom Vehicle Data";
  }, []);

  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({ ...vehicleDataFilter });
    }
  }, [filParams]);
  const handleUpload = () => {
    setShowCsvModal(true);
  };
  const onShowCreateModel = () => {
    setShowCreateModel(true);
  };
  const handleCreate = async () => {
    setLoading(true);
    try {
      const newVehicle = await createOneVehicleData.mutateAsync({
        ...formValues,
      });
      if (newVehicle) {
        toast.success("Successfully created new vehicle");
      } else {
        toast.error("Error creating vehicle");
      }
    } catch (error) {
      toast.error("Error creating vehicle");
    } finally {
      setLoading(false);
      refetechVehicleData();
    }
  };

  const handleCreateNewChange = (e: IEvent): void => {
    const { name, value } = e.target;

    setFormValues((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (data && data?.data) {
      setGetUserData(data?.data);
    }
  }, [data]);

  const handleClickUserDetails = (item: any) => {
    router.push(`/vehicle-data/${item.id}/show`);
  };

  const handleFilter = () => {
    refetechVehicleData();
  };
  const handlePage = () => {
    refetechVehicleData();
  };

  if (hasError) {
    toast.error("Failed to fetch data.", {
      toastId: "fetchError",
      autoClose: 2000,
    });
  }
  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.createdAt = dateConversion(data.createdAt.toString());
    });
  }

  const [tableData, setTableData] = useState<IVehicleData[]>([]);

  const readCSVFile = (event: any) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const file = files[0] as any;
      const reader = new FileReader();

      reader.readAsText(file);

      reader.onload = (e) => {
        const csvdata = e.target!.result as string;
        const rows: any = csvdata
          .split("\n")
          .filter((row) => row.trim().length > 0);

        const headers = rows[0].split(",");

        const formattedData: any = rows.slice(1).map((row: any) => {
          const values = row
            .split(",")
            .map((value: string) => value.trim()) as any;
          const entry: { [key: string]: string } = {};
          headers
            .map((header: any) => header.trim())
            .forEach((header: any, index: number) => {
              entry[header] = values[index];
            });
          return entry;
        });
        setTableData(formattedData);
      };
    } else {
      alert("Please select a file.");
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      const deleted = await deleteAll.mutateAsync();
      if (deleted) {
        toast.success("Deleted all Records");
      } else {
        toast.error("Unable to delete all Records");
      }
    } catch (error) {
      toast.error("Unable to delete all Records");
    } finally {
      setLoading(false);
      refetechVehicleData();
    }
  };

  const onCsvSave = async () => {
    setLoading(true);
    try {
      const applicationRes = await createVehicleData.mutateAsync(tableData);
      if (applicationRes) {
        toast.success("Vehicle Data Uploaded successfully");
      } else {
        toast.error("Failed to  Upload Vehicle Data");
      }
    } catch (err: any) {
      toast.error("Failed to Upload Vehicle Data");
    } finally {
      setLoading(false);
      refetechVehicleData();
    }
  };

  return !currentRoleAccessLevels?.Admin?.canView ? (
    <>
      <NoAccessComponent />
    </>
  ) : !hasError ? (
    <>
      {userDataLoading && !searchParams && !filParams && loading ? (
        <Loader />
      ) : (
        <ListView
          filterOptions={filterOptions}
          setFilParam={setFilParams}
          setSearchParam={setSearchParams}
          setSortParam={setSortParams}
          listName="Vehicle Data"
          data={getUserData}
          column={vehicleData}
          showCreate={currentRoleAccessLevels?.Admin?.canCreate}
          onCreate={onShowCreateModel}
          showUpload={currentRoleAccessLevels?.Admin?.canCreate}
          handleUpload={handleUpload}
          createButton="New"
          onRowClick={handleClickUserDetails}
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          totalCounts={data?.totalCount}
          handlePage={handlePage}
          paginationCount={Math.ceil(data?.totalCount as number) / 10}
          selectedFilterOptionsCount={selectedFilterOptionsCount}
          setSelectedFilterOptionsCount={setSelectedFilterOptionsCount}
          showSampleCSV={true}
          showDeleteAll={true}
          sampleCsvHeaders={vehicleDataHeaders}
          handleDeleteAll={() => setShowDeleteAllModel(true)}
        />
      )}
      {
        <Pagination
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={userDataLoading}
          totalCount={Math.ceil(data?.totalCount as number) / 10}
          handlePage={handlePage}
          searchParams={searchParams}
          filParams={filParams}
          page={currentOffeset / 10}
        />
      }
      {showCsvModal && (
        <>
          <Modal
            title="Upload CSV"
            onCloseClick={() => {
              setShowCsvModal(false);
            }}
            showButtons
            onSaveClick={() => {
              setShowCsvModal(false);
              onCsvSave();
            }}
          >
            <input type="file" id="file" onChange={readCSVFile} accept=".csv" />
          </Modal>
        </>
      )}
      {showDeleteAllModel && (
        <>
          <Modal
            title="Delete all Records?"
            onCloseClick={() => {
              setShowDeleteAllModel(!showDeleteAllModel);
            }}
            showButtons
            onSaveClick={() => {
              setShowDeleteAllModel(!showDeleteAllModel);
              handleDeleteAll();
            }}
          >
            <p>Do you want to delete all records?</p>
          </Modal>
        </>
      )}
      {showCreateModel && (
        <>
          <Modal
            title="Create new Record"
            onCloseClick={() => {
              setShowCreateModel(!showCreateModel);
            }}
            showButtons
            onSaveClick={() => {
              setShowCreateModel(!showCreateModel);
              handleCreate();
            }}
          >
            <FormComponent
              inputs={vehicleInputFields}
              handleChange={handleCreateNewChange}
              formValues={formValues}
              formErrors={formErrors}
              tailwindClass="grid grid-cols-2 gap-4"
            />
          </Modal>
        </>
      )}
    </>
  ) : (
    <>
      <ErrorComponent />
    </>
  );
};

export default withAuth(DefaultLayout(VehicleData));
