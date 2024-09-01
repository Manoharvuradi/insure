import React, { useEffect, useState } from "react";
import ListView from "~/common/listView";
import DefaultLayout from "~/components/defaultLayout";
import { useRouter } from "next/router";
import {
  AccessLevelsDefinition,
  claimColumn,
  claimFilterOptions,
  claimSupervisorFilterOptions,
} from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import withAuth from "../api/auth/withAuth";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import { roleValues } from "~/utils/constants/user";
import { UserRole } from "@prisma/client";
import Pagination from "~/common/Pagination";

const filteroptions1 = [
  { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  { filterValue: "OPEN", label: "Open", checked: false },
  { filterValue: "CLOSED", label: "Closed", checked: false },
  { filterValue: "FINALIZED", label: "Finalized", checked: false },
  { filterValue: "ACKNOWLEDGED", label: "Acknowledged", checked: false },
];
const filteroptions2 = [
  { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  { filterValue: "CLOSED", label: "Closed", checked: false },
  { filterValue: "FINALIZED", label: "Finalized", checked: false },
  { filterValue: "ACKNOWLEDGED", label: "Acknowledged", checked: false },
];
function ClaimList(props: any) {
  const [clData, setClData] = useState([]);
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [currentOffeset, setCurrentOffset] = useState(0);

  const itemsPerPage = 10;
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const [filterOptions, setFilterOptions] = useState(
    currentRole.includes(roleValues.claimSupervisor as UserRole)
      ? { ...claimSupervisorFilterOptions }
      : { ...claimFilterOptions }
  );
  const handleSupervisorList = () => {
    if (
      currentRole.includes(roleValues.claimSupervisor as UserRole) &&
      currentRole.length === 1
    ) {
      setFilParams(
        filParams
          ? filParams + ",CLOSED,ACKNOWLEDGED,FINALIZED"
          : "CLOSED,ACKNOWLEDGED,FINALIZED"
      );
    }
  };
  useEffect(() => {
    handleSupervisorList();
  }, [currentRole]);

  const { isLoading, data, error, refetch, isFetching } =
    currentRoleAccessLevels?.Claim?.canView
      ? api.claim.list.useQuery({
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

  if (error) {
    toast.error("Failed to fetch data.", {
      toastId: "fetchError",
      autoClose: 2000,
    });
  }

  const handleFilter = () => {
    handleSupervisorList();
  };

  const handlePage = () => {
    refetch();
  };

  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.claimDate = dateConversion(data?.claimDate?.toString());
      data.createdAt = dateConversion(data?.createdAt?.toString());
    });
  }
  useEffect(() => {
    if (data && data?.data) {
      setClData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    document.title = "Telkom Claims";
  }, []);

  useEffect(() => {
    if (filParams === "") {
      currentRole.includes(roleValues.claimSupervisor as UserRole)
        ? setFilterOptions({
            ...claimSupervisorFilterOptions,
            options: filteroptions2,
          })
        : setFilterOptions({ ...claimFilterOptions, options: filteroptions1 });
    }
  }, [filParams]);

  const handleCreate = () => {
    router.push("/claim/create");
  };
  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };

  const handleCreateButton = () => {
    return currentRoleAccessLevels?.Claim?.canCreate ? "New" : "";
  };

  const handleFilterOptions = () => {
    currentRole.includes(roleValues.claimSupervisor as UserRole)
      ? claimSupervisorFilterOptions
      : claimFilterOptions;
  };

  return currentRoleAccessLevels?.Claim?.canView ? (
    <>
      {isLoading && !searchParams && !filParams ? (
        <Loader />
      ) : (
        <ListView
          setFilParam={setFilParams}
          setSearchParam={setSearchParams}
          showFilter={true}
          setSortParam={setSortParams}
          listName="Claims"
          data={clData}
          column={claimColumn}
          showCreate={currentRoleAccessLevels?.Claim.canCreate}
          onCreate={handleCreate}
          onRowClick={handleRowClick}
          filterOptions={filterOptions}
          createButton={handleCreateButton()}
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          handlePage={handlePage}
          paginationCount={Math.ceil(data?.totalCount) / 10}
          totalCounts={data?.totalCount ?? 0}
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
          <NoAccessComponent />
        </>
      )}
    </>
  );
}

export default withAuth(DefaultLayout(ClaimList));
