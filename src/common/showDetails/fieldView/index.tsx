import React, { useEffect, useState } from "react";
import { dateConversion } from "~/utils/helpers";
import { capitalizedConvertion } from "~/utils/helpers";
export interface IFieldProps {
  title: string;
  value: any;
  resource?: string;
}
const ListTable = (props: IFieldProps) => {
  const [value, setValue] = useState<string>("");

  function convertStringToTitleCase(title: string, input: string): string {
    if (typeof input !== "string" || !input.trim()) {
      return "";
    }

    let words = [];
    if (
      title == "packageName" ||
      title == "role" ||
      title == "relation" ||
      title == "bank" ||
      title == "approvalStatus" ||
      title == "options" ||
      title == "paymentMethodType" ||
      title == "claimType" ||
      title == "cause"
    ) {
      words = input?.toLowerCase().split("_");
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
    } else if (title == "policyNumber") {
      return input;
    } else {
      words = input?.toLowerCase().split(" ");
      const capitalizedWords = words.map((word, index) => {
        if (index == 0) {
          const firstLetter = word.charAt(0).toUpperCase();
          const restOfWord = word.slice(1);
          return firstLetter + restOfWord;
        } else {
          const restOfWord = word.toLowerCase();
          return restOfWord;
        }
      });

      return capitalizedWords.join(" ");
    }
  }

  const exludeFormating: String[] = [
    "deviceUniqueNumber",
    "vinNumber",
    "prospectNumber",
  ];

  useEffect(() => {
    if (
      props?.title !== "dateOfBirth" &&
      props?.title !== "endDate" &&
      props?.title !== "claimDate" &&
      props?.title !== "createdAt" &&
      props?.title !== "updatedAt" &&
      props?.title !== "startDate" &&
      props?.title !== "claimNumber" &&
      props?.title !== "email" &&
      props?.title !== "policyId" &&
      props?.title !== "complainantEmail"
    ) {
      const newvalue = exludeFormating.includes(props.title)
        ? props.value
        : convertStringToTitleCase(props?.title, props?.value);
      setValue(newvalue);
    }
  }, [props]);
  return (
    <div className="grid w-full grid-cols-2">
      <p className="text-sm font-semibold leading-6 text-gray-900">
        {props?.title == "said" ? "SA ID" : capitalizedConvertion(props?.title)}
        :
      </p>
      {props?.title == "dateOfBirth" ||
      props?.title == "endDate" ||
      props?.title == "claimDate" ||
      props?.title == "createdAt" ||
      props?.title == "updatedAt" ||
      props?.title == "startDate" ||
      props?.title == "assignedAt" ||
      props?.title == "deceasedIndividualCreatedAt" ? (
        <p className=" text-sm leading-6 text-dark-grey">
          {dateConversion(props.value?.toString())}
        </p>
      ) : props?.title == "email" ||
        props?.title == "policyId" ||
        props?.title == "claimNumber" ||
        props?.title == "complainantEmail" ||
        props?.title == "complaintNumber" ||
        typeof props?.value === "number" ? (
        <p className=" whitespace-normal break-all text-sm leading-6 text-dark-grey">
          {props.title === "sumAssured" ||
          props.title === "basePremium" ||
          props.title === "totalPremium"
            ? "R " + props.value?.toString().replace(/_/g, " ")
            : props.value?.toString().replace(/_/g, " ")}
        </p>
      ) : (
        <p className=" whitespace-normal break-all text-sm leading-6 text-dark-grey">
          {props?.value == true ? "Yes" : props?.value == false ? "No" : value}
        </p>
      )}
    </div>
  );
};
export default ListTable;
