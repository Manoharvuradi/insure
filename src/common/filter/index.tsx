import React, { useEffect } from "react";
import Image from "next/image";
import { Fragment, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { IEvent } from "~/interfaces/common/form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CheckboxProps {
  handleFilter: any;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Checkbox = ({
  label,
  checked,
  onChange,
  handleFilter,
}: CheckboxProps) => {
  return (
    <div className="flex items-center">
      <input
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-blue focus:ring-0"
        type="checkbox"
        id={label}
        checked={checked}
        onClick={handleFilter}
        onChange={onChange}
      />
      <label
        htmlFor={label}
        className="ml-2 flex justify-between whitespace-nowrap pr-6 text-sm font-medium text-gray-900"
      >
        {label}
      </label>
    </div>
  );
};

const Filter = ({
  filterOptions,
  setFilParams,
  setSearchParams,
  setSortParams,
  handleFilter,
  setSelectedFilterOptionsCount,
  selectedFilterOptionsCount,
  showSearchInput,
  searchText,
  setSearchText,
  showFilter,
  fromDashBoard,
  showDateRangePicker,
  dateRange,
  setDateRange,
}: any) => {
  const [inputCheckBoxes, setInputCheckBoxes] = useState(
    filterOptions?.options
  );

  useEffect(() => {
    setInputCheckBoxes(filterOptions?.options);
  }, []);

  useEffect(() => {
    if (searchText) {
      const delayDebounceFn = setTimeout(() => {
        setSearchParams(searchText);
      }, 500);
      return () => {
        clearTimeout(delayDebounceFn);
      };
    } else if (showSearchInput) {
      setSearchParams("");
    }
  }, [searchText]);

  const handleSearchTextChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
  };

  const handleCheckboxChange = (index: number) => {
    const newCheckboxes = [...inputCheckBoxes];
    newCheckboxes[index].checked = !newCheckboxes[index].checked;
    setInputCheckBoxes(newCheckboxes);

    let filterParameters = "";
    let sortParameters = "";
    let hasFilters = false;

    let filterValues: any[] = [];
    inputCheckBoxes.forEach((checkbox: any) => {
      if (checkbox.checked) {
        if (checkbox.filterValue) {
          filterValues.push(checkbox.filterValue);
          hasFilters = true;
        } else if (checkbox.sortValue && !fromDashBoard) {
          sortParameters += `${checkbox.sortValue}`;
          hasFilters = true;
        }
      } else {
        if (
          checkbox.filterValue ||
          filterParameters.includes(`${checkbox.filterValue}`)
        ) {
          filterParameters = filterParameters.replace(
            `${checkbox.filterValue}`,
            ""
          );
          hasFilters = true;
        }
        if (
          (checkbox.sortValue ||
            sortParameters.includes(`${checkbox.sortValue}`)) &&
          !fromDashBoard
        ) {
          sortParameters = sortParameters.replace(`${checkbox.sortValue}`, "");
          hasFilters = true;
        }
      }
    });
    setSelectedFilterOptionsCount(filterValues.length);
    filterParameters = filterValues.join(",");
    if (hasFilters) {
      setFilParams(filterParameters);
      if (!fromDashBoard) {
        setSortParams(sortParameters);
      }
    }
  };

  const handleDateRange = (value: any) => {
    setDateRange({ startDate: value[0], endDate: value[1] });
  };

  return (
    <div className="relative z-20 flex w-full items-center justify-between">
      {showSearchInput && (
        <div className="flex w-full items-center rounded-md bg-[#d7edfc] pl-6 ">
          <Image
            src="/icons/search-icon.svg"
            width={20}
            height={20}
            alt="search input icon"
          />
          <input
            type="text"
            value={searchText}
            onChange={handleSearchTextChange}
            className="w-[calc(100%-45px)] border-none bg-[#d7edfc] font-gordita text-[15px] font-medium text-black focus:ring-0"
            placeholder="Search"
          />
        </div>
      )}
      {showDateRangePicker && (
        <DatePicker
          id="dateStartEnd"
          selectsRange={true}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateRange}
          dateFormat="yyyy MMM dd"
          className="ml-[20px] w-[230px] rounded-md border-none bg-[#d7edfc] font-gordita text-[15px] font-medium text-black focus:ring-0"
          placeholderText="Select date range"
          showDisabledMonthNavigation
          isClearable={true}
        />
      )}
      {showFilter && (
        <div className="relative ml-4">
          <div className="mx-auto border-none text-center ">
            <section aria-labelledby="filter-heading">
              <Popover.Group>
                <Popover
                  as="div"
                  key={filterOptions?.name}
                  id={`desktop-menu-${filterOptions?.id}`}
                  className="relative inline-block border-none text-left"
                >
                  <div>
                    <Popover.Button>
                      <div className="relative h-6 w-6">
                        <Image
                          src="/icons/filter-symbol.svg"
                          fill
                          alt="Filter Icon"
                        />
                      </div>
                    </Popover.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="space-y-4">
                        {inputCheckBoxes?.map(
                          (checkbox: any, index: number) => (
                            <div
                              key={checkbox.filterValue + "filter"}
                              className="flex items-center"
                            >
                              <Checkbox
                                handleFilter={handleFilter}
                                key={index}
                                label={checkbox.label}
                                checked={checkbox.checked}
                                onChange={() => handleCheckboxChange(index)}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              </Popover.Group>
            </section>
          </div>
          {
            <div
              className={`absolute right-0 top-0 flex h-5 w-5 -translate-y-1/2 translate-x-1/4 items-center justify-center rounded-[50%] bg-[#008FE0] text-xs text-white ${
                selectedFilterOptionsCount ? "block" : "hidden"
              }`}
            >
              {selectedFilterOptionsCount}
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default Filter;
