import React, { useState, useEffect } from "react";
import DefaultLayout from "~/components/defaultLayout";
import ListView from "~/common/listView";
import withAuth from "~/pages/api/auth/withAuth";
import { useRouter } from "next/router";
import {
  downloadCsv,
  reportsColumn,
  reportsFilterOptions,
} from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import ErrorComponent from "~/common/errorPage";
import { UserRole } from "@prisma/client";
import Pagination from "~/common/Pagination";

const filteroptions = [
  { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
];
const index = (props: any) => {
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [reportsData, setReportsData] = useState();
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    ...reportsFilterOptions,
  });
  const itemsPerPage = 10;
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const routerPath = router.query.name;

  const { isLoading, data, error, refetch, isFetching } =
    currentRoleAccessLevels?.Admin?.canView
      ? api.reports.list.useQuery({
          pageSize: itemsPerPage.toString(),
          offset: currentOffeset.toString(),
          filter: filParams,
          search: searchParams,
          sort: sortParams,
          reportType: routerPath == "telkom" ? "TELKOM" : "QSURE",
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
      data.createdAt = dateConversion(data?.createdAt?.toString());
    });
  }

  useEffect(() => {
    document.title = "Telkom Reports";
  }, []);

  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({ ...reportsFilterOptions, options: filteroptions });
    }
  }, [filParams]);

  // Handle row click
  const handleRowClick = (rowData: any) => {
    const headings = Object.keys(rowData.csvData[0]);
    const dataRows = rowData.csvData.map((row: any) => {
      // Construct CSV row based on the data object properties
      return headings
        .map((heading) => {
          return `${row[heading] || ""}`;
        })
        .join(",");
    });
    downloadCsv(dataRows, headings);
  };

  useEffect(() => {
    if (data && data?.data) {
      setReportsData(data?.data);
    }
  }, [data]);

  if (error) {
    toast.error("Failed to fetch data.", {
      toastId: "fetchError",
      autoClose: 2000,
    });
  }

  return !currentRoleAccessLevels?.Admin?.canView ? (
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
          listName="Reports"
          data={reportsData}
          column={reportsColumn}
          showCreate={false}
          onCreate={undefined}
          onRowClick={handleRowClick}
          filterOptions={filterOptions}
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
