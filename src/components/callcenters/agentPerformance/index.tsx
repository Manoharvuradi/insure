import { useRouter } from "next/router";
import React, { useState } from "react";
import Pagination from "~/common/Pagination";
import ComponentLoader from "~/common/componentLoader";
import Filter from "~/common/filter";
import Loader from "~/common/loader";
import Table from "~/common/table";
import { agentColumn } from "~/utils/constants";

interface IStats {
  setSearchParams: (str: string) => void;
  data: any;
  itemsPerPage: number;
  setCurrentOffset: (num: number) => void;
  isLoading: any;
  handlePage: any;
  totalCount: number;
  loader: boolean;
  allowOnClick?: boolean;
}

function AgentPerformance({
  setSearchParams,
  data,
  itemsPerPage,
  setCurrentOffset,
  isLoading,
  handlePage,
  totalCount,
  loader,
  allowOnClick,
}: IStats) {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const handleRowClick = (item: any) => {
    allowOnClick && router.push(`/admin/users/${item.agentId}/user`);
  };

  return (
    <>
      <div className="mb-3 ml-auto w-[600px]">
        <Filter
          setSearchParams={setSearchParams}
          showSearchInput={true}
          searchText={searchText}
          setSearchText={setSearchText}
          showFilter={false}
        />
      </div>
      {loader ? (
        <ComponentLoader />
      ) : (
        <>
          <Table
            isLoading={setSearchParams}
            data={data}
            column={agentColumn}
            onClick={handleRowClick}
            multipleSelect={false}
          />
        </>
      )}
    </>
  );
}

export default AgentPerformance;
