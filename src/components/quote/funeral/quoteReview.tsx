import Image from "next/image";
import React, { useState } from "react";
import MemberCard from "~/common/showDetails/memberCard";
import ShowKeyValue from "~/common/showDetails/showKeyValue";
import { IFormValues, IMember } from "~/interfaces/policy";

interface IQuoteReviewProps {
  formValues: IFormValues;
  setFormValues: (value: any) => void;
}

export default function QuoteReview({ formValues }: IQuoteReviewProps) {
  const [showDetails, setShowDetails] = useState({
    spouse: false,
    children: false,
    extendedFamily: false,
  });

  return (
    <div>
      <div className="my-2 rounded shadow-xl">
        <div className="flex rounded-t bg-review-blue px-8 py-5">
          <div className=" p-2 ">
            <p className="pb-2 pr-2 text-base font-normal leading-7 text-gray-900">
              Monthly premium
            </p>
            <h1 className="pb-2 text-4xl font-semibold leading-7 text-gray-900">
              {"R " + formValues.monthlyPremium}
            </h1>
          </div>
          <div className="mt-3 h-16 w-5 border-r-2  border-review-border"></div>
          <div className="col-span-2 ml-5 p-2 pl-4">
            <div className="flex items-center pb-2 text-base text-gray-900 ">
              <span className="pr-2 text-sm font-medium  ">Sum assured: </span>
              <span className="text-xl font-bold">
                {"R " + formValues.sumAssured}
              </span>
            </div>
            <div className="flex items-center pb-2 text-base font-semibold  text-gray-900">
              <span className="pr-2 text-sm font-medium">Package Name:</span>
              <span className="text-xl font-bold">
                {formValues.package.replaceAll("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 px-10 pt-6">
          <ShowKeyValue
            name="Principle premium"
            value={"R " + formValues.monthlyPremium}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Spouse included"
            value={formValues.includeSpouse ? "Yes" : "No"}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Children included"
            value={formValues.includeChildren ? "Yes" : "No"}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Extended family included"
            value={formValues.includeExtendedFamily ? "Yes" : "No"}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Start date"
            value={formValues.startDate}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Type"
            value={formValues.package.replaceAll("_", " ")}
            justify="justify-start"
          />
        </div>
        <div className="px-10">
          <div className=" border-b-2 p-4"></div>
        </div>
        <div className="px-10 pt-6">
          <h2 className="py-2 text-base font-bold leading-7 text-gray-900">
            Main member
          </h2>
          <div className="grid grid-cols-2">
            <div className="pr-10">
              <ShowKeyValue
                name="Coverage option"
                value={formValues.coverageOption}
              />
            </div>

            <div className="pr-5">
              <ShowKeyValue name="Age" value={formValues.mainMember?.age} />
            </div>

            <div className="pr-10">
              <ShowKeyValue
                name="Natural death amount"
                value={"R " + formValues.mainMember?.naturalDeathAmount}
              />
            </div>
            <div className="pr-5">
              <ShowKeyValue
                name="Accidental death amount"
                value={"R " + formValues.mainMember?.accidentalDeathAmount}
              />
            </div>
            <div className="pr-5">
              <ShowKeyValue
                name="Telkom free benefit amount"
                value={"R " + formValues.mainMember?.telkomFreeBenefitAmount}
              />
            </div>
          </div>
        </div>
        {formValues.includeSpouse && (
          <div className=" p-3 px-8">
            <div className=" border-b-2 p-4"></div>

            <h2 className="flex justify-between p-2 pt-4 text-base font-bold leading-7 text-gray-900">
              <span className="">Spouse</span>
              <div
                className="cursor-pointer"
                onClick={() =>
                  setShowDetails({
                    ...showDetails,
                    spouse: !showDetails.spouse,
                  })
                }
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
            {showDetails.spouse &&
              formValues.spouse.map((spouse: IMember, index: number) => (
                <div key={index} className="px-2">
                  <h2 className="py-2 text-base font-semibold leading-7 text-gray-900">
                    spouse {index + 1}
                  </h2>
                  <MemberCard member={spouse} />
                </div>
              ))}
          </div>
        )}
        {formValues.includeChildren && (
          <>
            <div className=" px-8 pb-4">
              <div className="border-b-2"></div>

              <h2 className="flex justify-between p-2 pt-4 text-base font-bold leading-7 text-gray-900">
                <span className="">Children</span>

                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setShowDetails({
                      ...showDetails,
                      children: !showDetails.children,
                    })
                  }
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
              {showDetails.children &&
                formValues.children.map((child: IMember, index: number) => (
                  <div key={index} className="px-2">
                    <h2 className="py-2 text-base font-semibold leading-7 text-gray-900">
                      Child {index + 1}
                    </h2>
                    <MemberCard member={child} />
                  </div>
                ))}
            </div>
          </>
        )}
        {formValues.includeExtendedFamily && (
          <div className="px-8 pb-4">
            <div className="border-b-2"></div>

            <h2 className="flex justify-between p-2 pt-4 text-base font-bold leading-7 text-gray-900">
              <span>Extended family </span>

              <div
                className="cursor-pointer"
                onClick={() =>
                  setShowDetails({
                    ...showDetails,
                    extendedFamily: !showDetails.extendedFamily,
                  })
                }
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
            {showDetails.extendedFamily &&
              formValues.extendedFamily.map(
                (member: IMember, index: number) => (
                  <div key={index} className="px-2">
                    <h2 className="py-2 text-base font-semibold leading-7 text-gray-900">
                      Member {index + 1}
                    </h2>
                    <MemberCard member={member} />
                  </div>
                )
              )}
          </div>
        )}
      </div>
    </div>
  );
}
