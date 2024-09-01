import React from "react";
import Image from "next/image";
import DescriptionList from "../showDetails/tableView";
import UploadButton from "../buttons/uploadButton";
import InfoTable from "../infoTable";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { ClaimCheckList } from "@prisma/client";
import NotificationTable from "../notificationTable";
import { checkListColumn } from "~/utils/constants/claims";
import Table from "../table";
import { historyColumn, tranactionsColumn } from "~/utils/constants/payments";
import EditIcon from "../buttons/editIcon";

interface IShowDropdown {
  id: string;
  title?: string;
  status?: string;
  checkStatus?: string;
  canUpdate?: boolean;
  handleEdit?: any;
  handleToggle: any;
  toggleValue: boolean;
  dropDownArray?: any;
  mainArray?: any;
  mainObject?: any;
  months?: number;
  deceasedValue?: string;
  page?: string;
  checkList?: boolean;
  checkListData?: ClaimCheckList[];
  handleApiButton?: any;
  isLoading?: boolean;
  isFetching?: boolean;
  documentRefetch?: any;
  category?: string;
}

const ShowDropdown = ({
  id,
  title,
  status,
  checkStatus,
  canUpdate,
  handleEdit,
  handleToggle,
  toggleValue,
  dropDownArray,
  mainArray,
  mainObject,
  months,
  deceasedValue,
  page,
  checkList,
  checkListData,
  handleApiButton,
  isLoading,
  isFetching,
  documentRefetch,
  category,
}: IShowDropdown) => {
  return (
    <div>
      <div
        className="rounded-[10px] bg-white p-4 transition-all duration-1000"
        id={id}
      >
        <div className="mb-1 flex justify-between ">
          <div className="flex gap-3">
            <h3 className="text-xl font-bold leading-9 text-dark-grey">
              {title}
            </h3>
            {!page &&
            status &&
            status == checkStatus &&
            canUpdate &&
            title != "Documents" ? ( //edit button
              <EditIcon
                handleClick={() => {
                  handleEdit();
                }}
              />
            ) : (
              title == "Documents" &&
              !page &&
              canUpdate &&
              status &&
              status == checkStatus && ( //upload button
                <UploadButton handleClick={() => handleEdit()} />
              )
            )}
          </div>
          <div className="cursor-pointer" onClick={() => handleToggle()}>
            {" "}
            {/* toggle button */}
            <Image
              src="/icons/DropdownIcon.svg"
              height={24}
              width={24}
              alt="drop down"
              className={`mr-4 ${toggleValue ? "rotate-180" : ""}`}
            />
          </div>
        </div>
        <div
          className={`${
            toggleValue ? "block" : "hidden"
          } transition-all duration-500`}
        >
          {!page &&
            canUpdate &&
            checkList &&
            checkListData &&
            checkListData?.length > 0 && ( // For check list in claims
              <div
                className={`${
                  toggleValue ? "block" : "hidden"
                } transition-all duration-500`}
              >
                <NotificationTable
                  data={checkListData as ClaimCheckList[]}
                  column={checkListColumn}
                  eventRefetch={isLoading}
                  page={"CheckList"}
                  handleApiButton={handleApiButton}
                  isLoading={isLoading}
                  isFetching={isFetching}
                />
              </div>
            )}
          {title !== "Documents" && // data for array
          dropDownArray &&
          dropDownArray.length > 0 &&
          mainArray ? (
            mainArray.map((item: any, index: number) => {
              return (
                <div key={index}>
                  {index > 0 ? (
                    <div className="mt-4 border-t-2 px-8 py-2"></div>
                  ) : (
                    ""
                  )}
                  <div className="py-2 text-lg font-medium text-dark-grey">
                    {title?.split(" ")[0]} {index + 1}
                  </div>
                  <DescriptionList data={item} />
                </div>
              );
            })
          ) : title !== "Documents" &&
            dropDownArray &&
            dropDownArray.length > 0 &&
            mainObject ? ( // data for claims object
            <>
              <DescriptionList data={mainObject} />
              {months &&
              months < 6 &&
              deceasedValue === "OTHER" &&
              mainObject?.funeralClaimType == "NATURAL" ? (
                <div className="flex items-center justify-center p-4">
                  <ExclamationTriangleIcon
                    className="m-1 h-6 w-6 text-orange-400"
                    aria-hidden="true"
                  />
                  <p>Under the waiting period of 6 months</p>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : title !== "Documents" && !dropDownArray && mainObject ? ( // data for Single object
            <>
              <DescriptionList data={mainObject} />
            </>
          ) : title === "Documents" &&
            dropDownArray &&
            dropDownArray.length > 0 ? ( // Documents Table
            <>
              <InfoTable
                tableData={dropDownArray}
                refetch={documentRefetch}
                category={category}
              />
            </>
          ) : (title === "Transactions" || title === "History") &&
            dropDownArray ? ( // Documents Table
            <>
              <Table
                isLoading={isLoading}
                data={dropDownArray}
                column={
                  title === "Transactions" ? tranactionsColumn : historyColumn
                }
                // onClick={props.onRowClick}
                multipleSelect={false}
              />
            </>
          ) : title == "Check List" &&
            checkListData &&
            checkListData?.length > 0 ? (
            <></>
          ) : (
            <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
              No Data
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowDropdown;
