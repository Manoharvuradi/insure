import React, { useState } from "react";
import { tabs2 } from "~/utils/constants";
import TabsBar from "../tabs";
import { dateConversion } from "~/utils/helpers";
import Activity from "../activity";

function ShowNotesAndActivity(props: any) {
  const [activeTab, setActiveTab] = useState("activity");

  const { notes, activity, showActivitySection } = props;

  function convertStringToTitleCase(input: string): string {
    if (typeof input !== "string" || !input.trim()) {
      return ""; // Return an empty string if input is not a valid string
    }
    let words = input?.toLowerCase().split(" ");
    const capitalizedWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1);
      return firstLetter + restOfWord;
    });
    return capitalizedWords.join(" ");
  }
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };
  return (
    <div
      className={`${
        showActivitySection ? "w-[30%]" : "w-0"
      } overflow-hidden transition-all duration-500`}
    >
      <div className="relative flex justify-start border-b">
        <TabsBar
          tabs={tabs2}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleTabChange={handleTabChange}
        />
      </div>
      <div className="h-[calc(100vh-65px)] overflow-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
        {activeTab === "Activity" && activity?.length === 0 && (
          <div className="mt-10 flex items-center justify-center font-semibold text-gray-500">
            No activities available
          </div>
        )}
        {activeTab === "activity" && activity?.length > 0 && (
          <Activity activity={activity} />
        )}
        {activeTab === "Notes" && notes?.length === 0 && (
          <div className="mt-10 flex items-center justify-center font-semibold text-gray-500">
            No notes available
          </div>
        )}
        {activeTab === "notes" &&
          notes?.length > 0 &&
          notes.map((item: any, index: number) => {
            return (
              <div
                className="mx-auto my-2 w-[90%] rounded-md border border-gray-300 px-3 py-4 shadow-lg"
                key={index}
              >
                <p className="text-right text-xs font-semibold">CreatedAt</p>
                <p className="text-right text-[10px]">
                  <span> {dateConversion(item.createdAt)} </span>
                  {item.createdAt.toLocaleTimeString()}
                </p>
                <h3 className="mb-1.5 text-sm font-semibold">
                  {convertStringToTitleCase(item.title)}
                </h3>
                {/* <p className="text-sm text-gray-900">{item.description}</p> */}
                <p className="text-sm text-gray-900">{item.description}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default ShowNotesAndActivity;
