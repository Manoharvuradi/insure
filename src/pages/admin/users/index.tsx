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
  AccessLevelsDefinition,
  userColumn,
  userFilterOptions,
} from "~/utils/constants";
import { useRouter } from "next/router";
import ListView from "~/common/listView";
import withAuth from "~/pages/api/auth/withAuth";
import { UserRole } from "@prisma/client";
import {
  Capitalize,
  capitalizedConvertion,
  dateConversion,
  getMultipleAccessRoles,
} from "~/utils/helpers";

const filter = [
  { sortValue: "createdAt:asc", label: "Sort By Date", checked: false },
  { filterValue: "AGENT", label: "Agent", checked: false },
  { filterValue: "CLAIM_ASSESSOR", label: "Claim Assessor", checked: false },
  { filterValue: "DEVELOPER", label: "Developer", checked: false },
  {
    filterValue: "POLICY_ADMINISTRATOR",
    label: "Policy Administrator",
    checked: false,
  },
  {
    filterValue: "CLAIM_SUPERVISOR",
    label: "Claim Supervisor",
    checked: false,
  },
  { filterValue: "SUPER_ADMIN", label: "Super Admin", checked: false },
  { filterValue: "archived", label: "Show archived", checked: false },
];

const Tokens = (props: any) => {
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [getUserData, setGetUserData] = useState();
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const [filterOptions, setFilterOptions] = useState({ ...userFilterOptions });
  const itemsPerPage = 10;
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);

  const router = useRouter();
  const {
    isLoading: userDataLoading,
    data,
    error: hasError,
    refetch,
    isFetching,
  } = currentRoleAccessLevels?.Admin?.canView
    ? api.credentialUser.list.useQuery({
        pageSize: itemsPerPage.toString(),
        offset: currentOffeset.toString(),
        search: searchParams,
        filter: filParams,
        sort: sortParams,
      })
    : {
        isLoading: false,
        data: null as any,
        error: null as any,
        refetch: null as any,
        isFetching: false,
      };

  useEffect(() => {
    document.title = "Telkom Admin";
  }, []);
  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({ ...userFilterOptions, options: filter });
    }
  }, [filParams]);
  const handleCreate = () => {
    router.push("users/create");
  };

  useEffect(() => {
    if (data && data?.data) {
      const users = data?.data;
      const cleanedUsers = users.map((user: any) => ({
        ...user,
        roles: user.roles.map((role: any) => Capitalize(role)),
      }));
      setGetUserData(cleanedUsers);
    }
  }, [data]);

  const handleClickUserDetails = (item: any) => {
    router.push(`users/${item.id}/user`);
  };

  const handleFilter = () => {
    refetch();
  };
  const handlePage = () => {
    refetch();
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
  return !currentRoleAccessLevels?.Admin?.canView ? (
    <>
      <NoAccessComponent />
    </>
  ) : !hasError ? (
    <>
      {userDataLoading && !searchParams && !filParams ? (
        <Loader />
      ) : (
        <ListView
          filterOptions={filterOptions}
          setFilParam={setFilParams}
          showFilter={true}
          setSearchParam={setSearchParams}
          setSortParam={setSortParams}
          listName="Users"
          data={getUserData}
          column={userColumn}
          showCreate={currentRoleAccessLevels?.Admin?.canCreate}
          onCreate={handleCreate}
          createButton="New"
          onRowClick={handleClickUserDetails}
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          totalCounts={data?.totalCount}
          handlePage={handlePage}
          paginationCount={Math.ceil(data?.totalCount) / 10}
          selectedFilterOptionsCount={selectedFilterOptionsCount}
          setSelectedFilterOptionsCount={setSelectedFilterOptionsCount}
        />
      )}
      {
        <Pagination
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={userDataLoading}
          totalCount={Math.ceil(data?.totalCount) / 10}
          handlePage={handlePage}
          searchParams={searchParams}
          filParams={filParams}
          page={currentOffeset / 10}
        />
      }
    </>
  ) : (
    <>
      <ErrorComponent />
    </>
  );
};

export default withAuth(DefaultLayout(Tokens));
