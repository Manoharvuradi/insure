import React, { useEffect, useState } from "react";
import ListView from "~/common/listView";
import DefaultLayout from "~/components/defaultLayout";
import { useRouter } from "next/router";
import { IApplication } from "~/interfaces/common";
import { policyholderColumn } from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import withAuth from "../api/auth/withAuth";
import { ToastContainer, toast } from "react-toastify";
import Pagination from "~/common/Pagination";

interface IPolicyholderGetResponse {
  data: IApplication[];
}

function PolicyHolder() {
  const router = useRouter();
  //options that will be in Action Dropdown
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
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [filParams, setFilParams] = useState("");
  const [currentOffeset, setCurrentOffset] = useState(0);
  const itemsPerPage = 10;
  //To get data from query
  const { isLoading, data, error, refetch, isFetching } =
    api.policyholder.list.useQuery({
      pageSize: itemsPerPage.toString(),
      offset: currentOffeset.toString(),
      filter: filParams,
      search: searchParams,
      sort: sortParams,
    });

  //create action
  const handleCreate = () => {
    router.push("/policyholder/create");
  };
  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };
  const handleFilter = () => {
    refetch();
  };

  const handlePage = () => {
    refetch();
  };

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error]);
  return (
    <>
      {isLoading && !searchParams && !filParams && !isFetching ? (
        <Loader />
      ) : (
        <ListView
          listName="Policyholder"
          data={data && data.data}
          column={policyholderColumn}
          showCreate={false}
          onCreate={handleCreate}
          onRowClick={handleRowClick}
          filterOptions={undefined}
          setFilParam={setFilParams}
          handleFilter={handleFilter}
          setSearchParam={setSearchParams}
          setSortParam={setSortParams}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          totalCounts={data && data.totalCount}
          handlePage={undefined}
        />
      )}
      <Pagination
        itemsPerPage={itemsPerPage}
        setCurrentOffset={setCurrentOffset}
        isLoading={isFetching}
        totalCount={Math.ceil(data?.totalCount) / 10}
        handlePage={handlePage}
        searchParams={searchParams}
        filParams={filParams}
        page={currentOffeset / 10}
      />
    </>
  );
}

export default withAuth(DefaultLayout(PolicyHolder));
