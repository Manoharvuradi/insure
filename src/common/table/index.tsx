import { useLayoutEffect, useRef, useState } from "react";
import { correctedLabels, statusColorCoding } from "~/utils/constants";
import { classNames, dateConversion } from "~/utils/helpers";

const Table = ({
  isLoading,
  data,
  column,
  onClick,
  multipleSelect,
  smallTable,
  selectedIds,
  setSelectedIds,
}: any) => {
  const checkbox = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  // const [selectedIds, setSelecteddata] = useState([] as any);
  useLayoutEffect(() => {
    const isIndeterminate =
      selectedIds?.length > 0 && selectedIds?.length <= data?.length;

    setChecked(selectedIds?.length === data?.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) {
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedIds]);

  function toggleAll() {
    setSelectedIds(checked || indeterminate ? [] : data);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }
  const handleOnClick = (item: any) => {
    onClick ? onClick(item) : undefined;
  };

  const getValue = (obj: any, key: any, bool: boolean): any => {
    const keys = key.split(".");
    const value = obj[keys[0]];
    if (value === null || value === undefined || value === "-") {
      return "-";
    }
    // alert( ": " + value)
    if (keys.length === 1) {
      const finalValue = convertStringToTitleCase(keys[0], String(value), bool);
      return finalValue || "";
    } else {
      return getValue(value, keys.slice(1).join("."), true);
    }
  };
  function convertStringToTitleCase(
    title: string,
    input: string,
    bool: boolean
  ): string {
    if (typeof input !== "string" || !input.trim()) {
      return ""; // Return an empty string if input is not a valid string
    }

    if (title == "lastName" && bool == true) {
      let words = input?.toLowerCase().split(" ");
      const capitalizedWords = words.map((word) => {
        const restOfWord = word.slice(0);
        return restOfWord;
      });
      return capitalizedWords.join(" ");
    } else if (
      title == "packageName" ||
      title == "policyNumber" ||
      title == "leadNumber" ||
      title == "email" ||
      title == "complaintNumber" ||
      title == "claimNumber"
    ) {
      if (title == "packageName" && correctedLabels[input] != undefined)
        return correctedLabels[input];
      return input;
    } else if (
      title == "status" ||
      title == "claimStatus" ||
      title == "approvalStatus"
    ) {
      return input.replace(/_/g, " ");
    } else if (title == "role") {
      let words = input?.toLowerCase().split("_");
      let finalLine = "";
      words?.map((word, index) => {
        let firstWord = "";
        if (index == 0) {
          const firstLetter = word.charAt(0).toUpperCase();
          const restOfWord = word.slice(1);
          firstWord = firstLetter + restOfWord;
          finalLine = finalLine + firstWord;
        } else {
          finalLine = finalLine + " " + word;
        }
      });
      return finalLine;
    } else {
      let words = input?.toLowerCase().split(" ");
      const capitalizedWords = words.map((word, index) => {
        if (index == 0) {
          const firstLetter = word.charAt(0).toUpperCase();
          const restOfWord = word.slice(1);
          return firstLetter + restOfWord;
        } else {
          const restOfWord = word.slice(0);
          return restOfWord;
        }
      });
      return capitalizedWords.join(" ");
    }
  }

  const concatenateValues = (obj: any, itemKey: any): any => {
    let result = "";
    itemKey.forEach((value: any, index: any) => {
      if (value.includes(".") || value == "complainantFirstName") {
        result += getValue(obj, value, true);
      } else {
        result += obj[value];
      }
      if (index !== itemKey.length - 1) {
        result += " ";
      }
    });
    if (result === null || result === undefined) {
      return "-";
    }
    result = result.replace(/-/g, "");
    if (result === " ") result = "-";
    return result;
  };
  return (
    <div
      className={classNames(
        smallTable
          ? "overflow-x-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md"
          : " overflow-x-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md"
      )}
    >
      <table className="min-w-full table-fixed divide-y divide-gray-300 overflow-x-scroll">
        <thead className="bg-[#E0E9EF]">
          <tr className="">
            {multipleSelect && (
              <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-0"
                  ref={checkbox}
                  checked={checked}
                  onChange={toggleAll}
                />
              </th>
            )}
            {column?.map(
              (columnItem: { key: string; label: string }, index: number) => {
                return (
                  <th
                    key={index}
                    scope="col"
                    className="px-3 py-2 text-left text-sm font-bold text-gray-900 "
                  >
                    {columnItem.label}
                  </th>
                );
              }
            )}
          </tr>
        </thead>

        <tbody className="cursor-pointer divide-y divide-gray-200 bg-white">
          {data?.length > 0 ? (
            data.map((item: any, index: number) => (
              <tr
                key={index}
                className={`
                  ${
                    selectedIds?.includes(item) ? "bg-gray-50 " : ""
                  } text-left hover:bg-gray-100`}
              >
                {multipleSelect && (
                  <td className="relative px-7 sm:w-12 sm:px-6 ">
                    <button>
                      {selectedIds.includes(item) && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-primary-600" />
                      )}
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-0"
                        value={item.email}
                        checked={selectedIds.includes(item)}
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked
                              ? [...selectedIds, item]
                              : selectedIds.filter((p: any) => p !== item)
                          )
                        }
                      />
                    </button>
                  </td>
                )}
                {}
                {column?.map((columnItem: any, index: number) => (
                  <td
                    key={index}
                    className={`whitespace-nowrap px-3 py-2 text-left text-sm text-gray-800 ${
                      columnItem.key === "status" ||
                      columnItem.key === "claimStatus" ||
                      columnItem.key === "approvalStatus"
                        ? statusColorCoding(item[columnItem.key])
                        : ""
                    } ${
                      columnItem.key === "dateOfPurchase"
                        ? dateConversion(item[columnItem.key])
                        : ""
                    }`}
                    onClick={() => {
                      handleOnClick(item);
                    }}
                  >
                    {Array.isArray(columnItem.key) ? (
                      <>
                        {concatenateValues(item, columnItem.key)?.replace(
                          /_/g,
                          " "
                        )}
                      </>
                    ) : (
                      <>
                        {columnItem.key.includes(".") ? (
                          <>
                            {getValue(item, columnItem.key, true)?.replace(
                              /_/g,
                              " "
                            )}
                          </>
                        ) : (
                          // <>{item[columnItem.key] || "-"}</>
                          <>
                            {columnItem.key === "status" &&
                            item.Leads?.applicationOnHold &&
                            item.Leads?.status !== "DECLINED" &&
                            item.status == "PENDING" ? (
                              <>ON HOLD</>
                            ) : (
                              <>{getValue(item, columnItem.key, false)}</>
                            )}
                          </>
                          // <> {getValue(item, columnItem.key, false)}</>
                        )}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="w-[100vw] whitespace-nowrap px-3 py-2 text-center text-sm font-bold text-gray-800"
                colSpan={column?.length + 1}
              >
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
