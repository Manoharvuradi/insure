import React, { useEffect, useState } from "react";
import ListView from "~/common/listView";
import DefaultLayout from "~/components/defaultLayout";
import { useRouter } from "next/router";
import { AccessLevelsDefinition, applicationColumn } from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import withAuth from "../api/auth/withAuth";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import NoAccessComponent from "~/common/noAccess";
import { useSession } from "next-auth/react";
import { appFilterOptions } from "~/utils/constants";
import ErrorComponent from "~/common/errorPage";
import { UserRole } from "@prisma/client";
import Pagination from "~/common/Pagination";
import { CSVLink, CSVDownload } from "react-csv";

const filteroptions = [
  { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  { filterValue: "APPROVED", label: "Approved", checked: false },
  { filterValue: "PENDING", label: "Pending", checked: false },
  { filterValue: "REJECTED", label: "Rejected", checked: false },
];

function ApplicationList(props: any) {
  const [appData, setAppData] = useState([] as any);
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [filterOptions, setFilterOptions] = useState({ ...appFilterOptions });
  const itemsPerPage = 10;
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);

  const { isLoading, data, error, refetch, isFetching } =
    currentRoleAccessLevels?.Application?.canView
      ? api.application.list.useQuery({
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

  const handleFilter = () => {
    refetch();
  };

  const handlePage = () => {
    refetch();
  };

  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.startDate = dateConversion(data?.startDate?.toString());
      data.createdAt = dateConversion(data?.createdAt?.toString());
    });
  }
  useEffect(() => {
    if (data && data?.data) {
      setAppData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({ ...appFilterOptions, options: filteroptions });
    }
  }, [filParams]);

  useEffect(() => {
    document.title = "Telkom Application";
  }, []);
  const handleCreate = () => {
    router.push("/application/create");
  };
  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };

  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.startDate = dateConversion(data.startDate.toString());
      data.createdAt = dateConversion(data.createdAt.toString());
    });
  }

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error]);

  return !currentRoleAccessLevels.Application.canView ? (
    <>
      <NoAccessComponent />
    </>
  ) : !error ? (
    <>
      {isLoading && !searchParams && !filParams ? (
        <Loader />
      ) : (
        <>
          <ListView
            filterOptions={filterOptions}
            setFilParam={setFilParams}
            showFilter={true}
            setSearchParam={setSearchParams}
            setSortParam={setSortParams}
            listName="Applications"
            data={appData}
            column={applicationColumn}
            showCreate={false}
            onCreate={handleCreate}
            onRowClick={handleRowClick}
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
        </>
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
}

export default withAuth(DefaultLayout(ApplicationList));
