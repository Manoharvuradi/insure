import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { api } from "~/utils/api";
import DefaultLayout from "../defaultLayout";
import DescriptionList from "~/common/showDetails/tableView";
import Loader from "~/common/loader";
import ErrorComponent from "~/common/errorPage";
import { capitalizedConvertion } from "~/utils/helpers";
import Pagination from "~/common/Pagination";
import Filter from "~/common/filter";
import Table from "~/common/table";
import { agentColumn } from "~/utils/constants";
import AgentPerformance from "./agentPerformance";
import ComponentLoader from "~/common/componentLoader";

interface User {
  id: number;
  firstName: string | null;
}

interface UserData {
  id: number;
  name: string | null;
  description: string | null;
}

function CallCentersShow() {
  const itemsPerPage = 10;
  const [currentOffeset, setCurrentOffset] = useState(0);
  const router = useRouter();
  const [searchParams, setSearchParams] = useState("");
  const callCenterId = router.query.id as String;
  const {
    isLoading,
    data,
    error,
    refetch: dataRefetch = () => {},
  } = api.callCenter.show.useQuery({
    id: callCenterId as string,
    pageSize: itemsPerPage.toString(),
    offset: currentOffeset.toString(),
    search: searchParams,
  });
  const [callcentersData, setCallcenterData] = useState({});
  useEffect(() => {
    if (data) {
      setCallcenterData(data);
    }
  }, [data]);

  const handlePage = () => {
    dataRefetch();
  };

  const { user, ...rest } = callcentersData as { user: User[] } & UserData;

  return (
    <>
      {isLoading && !error && !searchParams ? (
        <Loader />
      ) : !error ? (
        <div className="w-full border-r-2 border-solid border-gray-300">
          <div className="h-screen overflow-auto transition duration-300 scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
            <div className="mt-5 rounded-[10px] px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
              <h2 className="mb-5 text-[26px] font-bold leading-9 text-dark-grey">
                Call center Details
              </h2>
              <DescriptionList data={rest} />
              <h3 className="mt-5 text-lg font-semibold">Agents Performance</h3>
              <>
                <AgentPerformance
                  setSearchParams={setSearchParams}
                  isLoading={setSearchParams}
                  data={data?.agentPerformance}
                  itemsPerPage={itemsPerPage}
                  setCurrentOffset={setCurrentOffset}
                  loader={isLoading}
                  totalCount={Math.ceil(Number(data?.totalCount)) / 10}
                  handlePage={handlePage}
                />
              </>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ErrorComponent />{" "}
        </>
      )}
      <Pagination
        itemsPerPage={itemsPerPage}
        setCurrentOffset={setCurrentOffset}
        isLoading={isLoading}
        totalCount={Math.ceil(Number(data?.totalCount)) / 10}
        handlePage={handlePage}
        searchParams={searchParams}
        page={currentOffeset / 10}
      />
    </>
  );
}

export default DefaultLayout(CallCentersShow);
