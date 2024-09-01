import React, { useEffect, useState } from "react";
import ListView from "~/common/listView";
import DefaultLayout from "~/components/defaultLayout";
import { useRouter } from "next/router";
import {
  AccessLevelsDefinition,
  leadListColumn,
  listColumn,
} from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import withAuth from "../api/auth/withAuth";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import { leadFilterOptions } from "~/utils/constants";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import { UserRole } from "@prisma/client";
import Pagination from "~/common/Pagination";

function LeadsList(props: any) {
  const [leadsData, setLeadsData] = useState([] as any);
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

  const { isLoading, data, error, refetch, isFetching } =
    currentRoleAccessLevels?.Leads?.canView
      ? api.lead.list.useQuery({
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

  const showAddUser = () => {
    return props?.currentUserDetails?.agentRoletype === "MANAGER";
  };

  if (data && data.data) {
    data.data.forEach((data: any) => {
      data.startDate = dateConversion(data?.startDate?.toString());
      data.createdAt = dateConversion(data?.createdAt?.toString());
    });
  }
  useEffect(() => {
    if (data && data?.data) {
      setLeadsData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    document.title = "Telkom Policy";
  }, []);

  const handleCreate = () => {
    router.push("/lead/create");
  };
  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };
  const handleAddUser = () => {
    router.push("/lead/create/adduser");
  };
  return currentRoleAccessLevels?.Leads?.canView ? (
    <>
      {isLoading && !searchParams && !filParams ? (
        <Loader />
      ) : (
        <ListView
          listName="Prospects"
          setFilParam={setFilParams}
          setSearchParam={setSearchParams}
          showFilter={true}
          showAddUser={showAddUser()}
          addUserButton="Add New User"
          onAddUser={handleAddUser}
          setSortParam={setSortParams}
          data={leadsData}
          column={leadListColumn}
          showCreate={
            currentRoleAccessLevels?.Leads?.canCreate ||
            currentRoleAccessLevels?.Leads?.canCreate
          }
          onCreate={handleCreate}
          onRowClick={handleRowClick}
          filterOptions={leadFilterOptions}
          createButton="New"
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          handlePage={handlePage}
          paginationCount={Math.ceil(data?.totalCount as number) / 10}
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
          <NoAccessComponent />
        </>
      )}
    </>
  );
}

export default withAuth(DefaultLayout(LeadsList));
