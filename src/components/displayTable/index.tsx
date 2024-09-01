// Table.tsx
import React from "react";
import { capitalizedConvertion } from "~/utils/helpers";

interface TableProps {
  headings: string[];
  data: { [key: string]: any }[];
  className?: string;
}

const DisplayTable: React.FC<TableProps> = ({ headings, data, className }) => {
  return (
    <div
      className={`overflow-x-auto rounded-md scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md  ${
        className || ""
      } `}
    >
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {headings.map((heading, index) => (
              <th
                key={index}
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                {capitalizedConvertion(heading)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headings.map((heading, colIndex) => {
                return (
                  <td
                    key={colIndex}
                    className="whitespace-nowrap border-b border-gray-300 p-4"
                  >
                    {row[heading]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisplayTable;
