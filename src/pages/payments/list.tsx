import React, { useState, useEffect } from "react";
import DefaultLayout from "~/components/defaultLayout";
import ListView from "~/common/listView";
import withAuth from "~/pages/api/auth/withAuth";
import { useRouter } from "next/router";
import {
  claimPayoutColumn,
  policyPremiumColumn,
  paymentFilterOptions,
  AccessLevelsDefinition,
} from "~/utils/constants";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import { dateConversion, getMultipleAccessRoles } from "~/utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";
import NoAccessComponent from "~/common/noAccess";
import { UserRole } from "@prisma/client";
import ErrorComponent from "~/common/errorPage";
import Pagination from "~/common/Pagination";
const paymentsFilteroptions = [
  { sortValue: "id:asc", label: "Sort By Date", checked: false },
  { filterValue: "PENDING", label: "Pending", checked: false },
  { filterValue: "SUBMITTED", label: "Submitted", checked: false },
  { filterValue: "PROCESSING", label: "Processing", checked: false },
  { filterValue: "SUCCESSFUL", label: "Successful", checked: false },
  { filterValue: "FAILED", label: "Failed", checked: false },
  { filterValue: "CANCELLED", label: "Cancelled", checked: false },
];

const index = (props: any) => {
  const [filParams, setFilParams] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [sortParams, setSortParams] = useState("");
  const [paymentData, setPaymentData] = useState({} as any);
  const [currentOffeset, setCurrentOffset] = useState(0);
  const itemsPerPage = 10;
  const [filterOptions, setFilterOptions] = useState({
    ...paymentFilterOptions,
  });
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const routerPath = router.query.name;

  const { isLoading, data, error, refetch, isFetching } =
    currentRoleAccessLevels?.Payments?.canView
      ? api.payments.list.useQuery({
          pageSize: itemsPerPage.toString(),
          offset: currentOffeset.toString(),
          filter: filParams,
          search: searchParams,
          sort: sortParams,
          paymentType:
            routerPath === "policyPremium" ? "policyPremium" : "claimPayOut",
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

  useEffect(() => {
    if (data && data.data) {
      data.data.forEach((data: any) => {
        data.amount = data?.amount && "R " + String(data?.amount);
        data.balance = data?.balance && "R " + String(data?.balance);
        data.paymentDate = dateConversion(data?.paymentDate?.toString());
        data.createdAt = dateConversion(data?.createdAt?.toString());
      });
    }
  }, [data]);

  useEffect(() => {
    document.title = "Telkom Payment";
  }, []);

  useEffect(() => {
    if (filParams === "") {
      setFilterOptions({
        ...paymentFilterOptions,
        options: paymentsFilteroptions,
      });
    }
  }, [filParams]);

  const handleRowClick = (item: any) => {
    router.push(`${item.id}/show`);
  };

  useEffect(() => {
    if (data && data) {
      setPaymentData(data?.data);
    }
  }, [data]);

  if (error) {
    toast.error("Failed to fetch data.", {
      toastId: "fetchError",
      autoClose: 2000,
    });
  }

  return !currentRoleAccessLevels?.Payments?.canView ? (
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
          listName={
            routerPath === "policyPremium" ? "Policy payment" : "Claim payout"
          }
          data={paymentData}
          column={
            routerPath === "policyPremium"
              ? policyPremiumColumn
              : claimPayoutColumn
          }
          onRowClick={handleRowClick}
          filterOptions={filterOptions}
          handleFilter={handleFilter}
          itemsPerPage={itemsPerPage}
          setCurrentOffset={setCurrentOffset}
          isLoading={isFetching}
          handlePage={handlePage}
          paginationCount={Math.ceil(data?.totalCount as number) / 10}
          totalCounts={data?.totalCount}
          showCreate={false}
          onCreate={undefined}
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
