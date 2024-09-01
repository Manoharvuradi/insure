import React, { useState, useEffect } from "react";
import DefaultLayout from "~/components/defaultLayout";
import ListView from "~/common/listView";
import withAuth from "~/pages/api/auth/withAuth";
import { useRouter } from "next/router";
import { AccessLevelsDefinition, complaintColumn } from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import { complaintFilterOptions } from "~/utils/constants";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import ErrorComponent from "~/common/errorPage";
import { UserRole } from "@prisma/client";
import Pagination from "~/common/Pagination";

const filteroptions = [
  { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  { filterValue: "OPEN", label: "Open", checked: false },
  { filterValue: "CLOSED", label: "Closed", checked: false },
];
const index = (props: any) => {
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [complaintData, setComplaintData] = useState();
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    ...complaintFilterOptions,
  });
  const itemsPerPage = 10;
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);

  const { isLoading, data, error, refetch, isFetching } =
    currentRoleAccessLevels?.Complaints?.canView
      ? api.complaints.list.useQuery({
          pageSize: itemsPerPage.toString(),
          offset: currentOffeset.toString(),
          filter: filParams,
          search: searchParams,
          sort: sortParams,
        })
      : {
          isLoading: false,
          data: null,
          error: null,
          refetch: () => {
            return null;
          },
          isFetching: false,
        };

  const handleCreate = () => {
    currentRoleAccessLevels?.Complaints?.canCreate &&
      router.push("/complaint/create");
  };

  const handleFilter = () => {
    refetch();
  };

  const handlePage = () => {
    refetch();
  };

  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.complaintDate = dateConversion(data?.complaintDate?.toString());
      data.createdAt = dateConversion(data?.createdAt?.toString());
    });
  }

  useEffect(() => {
    document.title = "Telkom Complaint";
  }, []);

  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({ ...complaintFilterOptions, options: filteroptions });
    }
  }, [filParams]);

  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };

  useEffect(() => {
    if (data && data?.data) {
      setComplaintData(data?.data);
    }
  }, [data]);

  if (error) {
    toast.error("Failed to fetch data.", {
      toastId: "fetchError",
      autoClose: 2000,
    });
  }

  return !currentRoleAccessLevels?.Complaints?.canView ? (
    <>
      <NoAccessComponent />
    </>
  ) : !error ? (
    <>
      {isLoading && !searchParams && !filParams ? (
        <Loader />
      ) : (
        <ListView
          setFilParam={setFilParams}
          setSearchParam={setSearchParams}
          setSortParam={setSortParams}
          showFilter={true}
          listName="Complaints"
          data={complaintData}
          column={complaintColumn}
          showCreate={currentRoleAccessLevels?.Complaints?.canCreate}
          onCreate={handleCreate}
          onRowClick={handleRowClick}
          filterOptions={filterOptions}
          createButton="New"
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          handlePage={handlePage}
          paginationCount={Math.ceil(data?.totalCount) / 10}
          totalCounts={data?.totalCount}
          selectedFilterOptionsCount={selectedFilterOptionsCount}
          setSelectedFilterOptionsCount={setSelectedFilterOptionsCount}
        />
      )}
      <Pagination
        itemsPerPage={itemsPerPage}
        setCurrentOffset={setCurrentOffset}
        isLoading={isLoading}
        totalCount={Math.ceil(data?.totalCount) / 10}
        handlePage={handlePage}
        searchParams={searchParams}
        filParams={filParams}
        page={currentOffeset / 10}
      />
    </>
  ) : (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <ErrorComponent />
        </>
      )}
    </>
  );
};

export default withAuth(DefaultLayout(index));
