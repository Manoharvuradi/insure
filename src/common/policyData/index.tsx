import React, { useState } from "react";
import DescriptionList from "../showDetails/tableView";
import MemberCard from "../showDetails/memberCard";
import Image from "next/image";
import { object } from "zod";
import { capitalizedConvertion } from "~/utils/helpers";

const PolicyDataComponent = (policy: any) => {
  delete policy.policyData?.packageName;
  const policyDataKeys = Object?.keys(policy.policyData);
  const policyData = policy?.policyData[policyDataKeys[0] as string];
  const [showDetails, setShowDetails] = useState({} as any);
  const {
    sumAssured,
    freeCoverPremium,
    totalPremium,
    additionalPremium,
    devicePrice,
    premiumAmount,
    packageName,
    ...rest
  } = policyData;

  const toggleSection = (section: any) => {
    setShowDetails({
      ...showDetails,
      [section]: !showDetails[section],
    });
  };

  const header = policy.title ? "Prospect Data" : "Policy Data";
  const renderSections = (sections: [string, any][]) => {
    return sections.map(([sectionName, sectionData]) => {
      if (typeof sectionData === "object" && sectionData !== null) {
        return (
          <div key={sectionName}>
            <h1 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
              {capitalizedConvertion(sectionName)}
            </h1>
            <MemberCard member={sectionData} />
          </div>
        );
      }
      return null;
    });
  };

  const renderArrays = (arrays: [string, any][]) => {
    return arrays.map(([sectionName, sectionData]) => {
      if (Array.isArray(sectionData)) {
        return (
          <div key={sectionName} className="border-t-2 px-8 py-4">
            <h2 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
              <span>{capitalizedConvertion(sectionName)}</span>
              <div
                className="cursor-pointer"
                onClick={() => toggleSection(sectionName)}
              >
                <Image
                  src="/icons/DropdownIcon.svg"
                  height={24}
                  width={24}
                  alt="drop down"
                  className="mr-4"
                />
              </div>
            </h2>
            {showDetails[sectionName] &&
              sectionData.map((item: any, index: any) => (
                <div key={index} className="px-2">
                  <h2 className="pt-2 text-base font-semibold leading-7 text-gray-900">
                    {sectionName} {index + 1}
                  </h2>
                  <MemberCard member={item} />
                </div>
              ))}
          </div>
        );
      }
      return null;
    });
  };

  const objectSections = Object.entries(policyData).filter(
    ([, sectionData]) =>
      !Array.isArray(sectionData) &&
      typeof sectionData === "object" &&
      sectionData !== null
  );
  const arraySections = Object.entries(policyData).filter(
    ([, sectionData]) => Array.isArray(sectionData) && sectionData.length > 0
  );

  return (
    <div className="py-2">
      <h1 className="py-2 text-xl font-semibold text-dark-grey">{header}</h1>
      <div className="rounded-[10px] px-4 py-2 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
        {renderSections(objectSections)}
        {renderArrays(arraySections)}
        <DescriptionList data={rest} />
      </div>
    </div>
  );
};

export default PolicyDataComponent;
