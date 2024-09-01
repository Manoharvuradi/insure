import Filter from "../filter";
import Table from "../table";
import { useState } from "react";
import Loader from "../loader";
import AddButton from "../buttons/addButton";
import ComponentLoader from "../componentLoader";
import SmallLoader from "../tinyLoader";
import { CSVLink } from "react-csv";
import DeleteButton from "../buttons/deleteButton";
import UploadButton from "../buttons/uploadButton";

interface IListView {
  setFilParam?: any;
  handleFilter?: any;
  setSearchParam?: any;
  setSortParam?: any;
  filterOptions?: any;
  listName?: string;
  data?: any;
  column?: any;
  showCreate?: boolean;
  showAddUser?: boolean;
  onCreate?: any;
  onAddUser?: any;
  onRowClick?: any;
  createButton?: string;
  addUserButton?: string;
  itemsPerPage?: any;
  setCurrentOffset?: any;
  isLoading?: any;
  paginationCount?: any;
  handlePage?: any;
  totalCounts?: number;
  setSelectedFilterOptionsCount?: any;
  selectedFilterOptionsCount?: number;
  showUpload?: boolean;
  handleUpload?: any;
  showSampleCSV?: boolean;
  showDeleteAll?: boolean;
  handleDeleteAll?: any;
  sampleCsvHeaders?: any;
  showFilter?: boolean;
  showDateRangePicker?: boolean;
  dateRange?: Date | any;
  setDateRange?: ((date: Date) => void) | any;
  showExport?: boolean;
  exportButton?: string;
  handleExport?: any;
  multipleSelect?: boolean;
  selectedIds?: Array<any>;
  setSelectedIds?: ((id: Array<any>) => void) | any;
  deleteMany?: () => void;
}

export default function ListView(props: IListView) {
  const {
    filterOptions,
    setFilParam,
    setSearchParam,
    setSortParam,
    isLoading,
  } = props;
  const [searchText, setSearchText] = useState("");
  return (
    <div className="mt-5 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className=" flex items-center">
          <h1 className="text-3xl font-bold leading-6 text-gray-900">
            {props.listName}
          </h1>
          {isLoading ? (
            <SmallLoader />
          ) : (
            <div className="ml-3 flex h-[32px] w-[32px]  items-center justify-center rounded-[50%] bg-primary-600 p-2 text-white">
              <p>{props?.totalCounts}</p>
            </div>
          )}
          {props.showCreate && (
            <div className=" ml-3">
              <AddButton
                name={props.createButton}
                handleClick={props.onCreate}
              />
            </div>
          )}
          {props.showAddUser && (
            <div className=" ml-3">
              <AddButton
                name={props.addUserButton}
                handleClick={props.onAddUser}
              />
            </div>
          )}
          {props.showUpload && props?.data?.length == 0 && (
            <div className=" ml-3">
              <UploadButton handleClick={props.handleUpload} />
            </div>
          )}
          {props.showExport && (
            <div className=" ml-3">
              <AddButton
                name={props.exportButton}
                handleClick={props.handleExport}
              />
            </div>
          )}
        </div>
        <div className="flex  items-center gap-4">
          {props.showSampleCSV && props?.data?.length == 0 && (
            <CSVLink
              data={props.sampleCsvHeaders}
              filename="Sample-CSV"
              className="ml-auto flex h-8 items-center justify-center gap-2 rounded-md bg-primary-blue px-2.5 text-sm text-white transition duration-300 hover:bg-hover-blue"
            >
              Sample CSV
            </CSVLink>
          )}
          {props.showDeleteAll && props?.data?.length != 0 && (
            <div className=" ml-3">
              <DeleteButton
                handleDelete={props.handleDeleteAll}
                deleteAll={true}
              />
            </div>
          )}
          <div className="w-[600px]">
            <Filter
              filterOptions={filterOptions}
              setFilParams={setFilParam}
              setSearchParams={setSearchParam}
              setSortParams={setSortParam}
              handleFilter={props.handleFilter}
              selectedFilterOptionsCount={props.selectedFilterOptionsCount}
              setSelectedFilterOptionsCount={
                props.setSelectedFilterOptionsCount
              }
              showSearchInput={true}
              searchText={searchText}
              setSearchText={setSearchText}
              showFilter={props.showFilter}
              showDateRangePicker={props.showDateRangePicker}
              dateRange={props.dateRange}
              setDateRange={props.setDateRange}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <ComponentLoader />
      ) : (
        <div className="flow-root overflow-x-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
          <div className="inline-block min-w-full align-middle">
            <div className="relative">
              <Table
                isLoading={filterOptions || setSearchParam || setSortParam}
                data={props.data}
                column={props.column}
                onClick={props.onRowClick}
                multipleSelect={props.multipleSelect}
                selectedIds={props.selectedIds}
                setSelectedIds={props.setSelectedIds}
                deleteMany={props.deleteMany}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
