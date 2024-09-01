import { useEffect, useState } from "react";
import DefaultLayout from "~/components/defaultLayout";
import Loader from "~/common/loader";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import { toast } from "react-toastify";
import ErrorComponent from "~/common/errorPage";
import Pagination from "~/common/Pagination";
import { api } from "~/utils/api";
import {
  callCenterColumn,
  userColumn,
  userFilterOptions,
} from "~/utils/constants";
import { useRouter } from "next/router";
import ListView from "~/common/listView";
import withAuth from "~/pages/api/auth/withAuth";
import { UserRole } from "@prisma/client";
import {
  Capitalize,
  dateConversion,
  getMultipleAccessRoles,
} from "~/utils/helpers";

const CallCentersList = (props: any) => {
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [getUserData, setGetUserData] = useState();
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const [flag, setFlag] = useState(false);
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
    ? api.callCenter.list.useQuery({
        pageSize: itemsPerPage.toString(),
        offset: currentOffeset.toString(),
        search: searchParams,
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
    document.title = "Telkom Call center";
  }, []);

  const handleCreate = () => {
    router.push("create");
  };

  const handleClickUserDetails = (item: any) => {
    router.push(`${item.callCenterId}/show`);
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

  return !currentRoleAccessLevels?.Admin?.canView ? (
    <>
      <NoAccessComponent />
    </>
  ) : !hasError ? (
    <>
      {userDataLoading && !searchParams ? (
        <Loader />
      ) : (
        <ListView
          filterOptions={undefined}
          showFilter={false}
          setFilParam={undefined}
          setSearchParam={setSearchParams}
          setSortParam={setSortParams}
          listName="Call centers"
          data={data?.data}
          column={callCenterColumn}
          showCreate={currentRoleAccessLevels?.Admin?.canCreate}
          onCreate={handleCreate}
          createButton="New"
          onRowClick={handleClickUserDetails}
          handleFilter={undefined}
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

      <Pagination
        itemsPerPage={itemsPerPage}
        setCurrentOffset={setCurrentOffset}
        isLoading={userDataLoading}
        totalCount={Math.ceil(data?.totalCount) / 10}
        handlePage={handlePage}
        searchParams={searchParams}
        page={currentOffeset / 10}
      />
    </>
  ) : (
    <>
      <ErrorComponent />
    </>
  );
};

export default withAuth(DefaultLayout(CallCentersList));
