import React from "react";
import ListTable from "~/common/showDetails/fieldView";
import { correctedLabels, currencyLabels } from "~/utils/constants";
import { valueChecker } from "~/utils/helpers";

export interface IDescriptionListProps {
  data: any;
}
const DescriptionList = (input: any) => {
  const inputData = Object.keys(input.data);
  const filteredInputData =
    inputData &&
    inputData.filter(
      (item: any) =>
        item !== "fileIds" &&
        item !== "id" &&
        item !== "isPrimary" &&
        item !== "createdById" &&
        item !== "updatedById" &&
        item !== "paymentMethods" &&
        item !== "policyholder" &&
        item !== "beneficiaries" &&
        item !== "claimant" &&
        item !== "isArchived" &&
        item !== "password" &&
        item !== "callCenterId" &&
        item !== "policyScheduleKey" &&
        item !== "policyId" &&
        item !== "packageId" &&
        item !== "claimId" &&
        item !== "policyholderId" &&
        item !== "leadsId"
    );
  return (
    <div className="grid w-full grid-cols-2 items-center justify-between justify-items-center gap-x-[40px] gap-y-1.5">
      {filteredInputData.map((item: any, index: number) => {
        const checkStringExists = valueChecker(input.data[item]);
        if (
          item == "createdAt" ||
          item == "updatedAt" ||
          item == "dateOfBirth" ||
          item == "endDate" ||
          item == "startDate" ||
          item == "claimDate" ||
          item == "claimCreatedDate" ||
          item == "dateOfDeath" ||
          item == "deceasedIndividualCreatedAt" ||
          item == "incidentDate" ||
          item == "assignedAt" ||
          typeof input.data[item] !== "object"
        ) {
          return (
            input.data[item] !== null &&
            input.data[item] !== "" && (
              <div className="w-full" key={index}>
                {checkStringExists == true && (
                  <>
                    <ListTable
                      title={item}
                      value={
                        currencyLabels.includes(item)
                          ? `R ${input.data[item]}`
                          : correctedLabels[input.data[item]] ||
                            input.data[item]
                      }
                    />
                  </>
                )}
              </div>
            )
          );
        }
      })}
    </div>
  );
};

export default DescriptionList;
