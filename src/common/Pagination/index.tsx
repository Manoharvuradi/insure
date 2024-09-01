import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { PreviousPage } from "../prevPage";
import { NextPage } from "../nextPage";
import { GrNext, GrPrevious } from "react-icons/gr";

interface IPagination {
  itemsPerPage: number;
  setCurrentOffset: any;
  isLoading: boolean;
  totalCount: number;
  handlePage: any;
  searchParams?: any;
  filParams?: any;
  page?: number;
}
function Pagination({
  itemsPerPage,
  setCurrentOffset,
  isLoading,
  totalCount,
  handlePage,
  searchParams,
  filParams,
  page,
}: IPagination) {
  const handlePageClick = ({ selected }: any) => {
    setCurrentOffset(selected * itemsPerPage);
  };
  useEffect(() => {
    setCurrentOffset(0);
  }, [searchParams, filParams]);

  return (
    <div className={`${totalCount ? "block" : "hidden"}`}>
      <>
        <ReactPaginate
          previousLabel={<GrPrevious />}
          nextLabel={<GrNext />}
          breakLabel={"..."}
          breakClassName={
            "relative inline-flex items-center justify-center h-full px-4 py-2 text-sm font-semibold text-[#005E9B] focus:z-20 focus:outline-offset-0"
          }
          pageCount={`${!isLoading}` ? Math.ceil(totalCount) : 0}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={(e) => {
            handlePageClick(e);
          }}
          containerClassName={
            "mt-3 isolate flex justify-end px-7 m gap-[10px] items-center rounded-md shadow-sm font-medium "
          }
          pageClassName={
            "relative inline-flex items-center justify-center rounded-full px-2 rounded-[50%] text-sm font-semibold text-[#005E9B] focus:z-20 focus:outline-offset-0"
          }
          activeClassName={`relative z-10 bg-blue-500 text-[#FFF] inline-flex items-center justify-center w-[30px] h-[30px] text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
          previousClassName={`text-[#005E9B] relative inline-flex items-center justify-center rounded-l-md px-2 py-2  hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
          nextClassName={` text-[#005E9B] relative inline-flex items-center justify-center rounded-r-md px-2 py-2  hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
          disabledClassName={`text-gray-500 p-2 cursor-not-allowed`}
          forcePage={page}
        />
      </>
    </div>
  );
}

export default Pagination;
