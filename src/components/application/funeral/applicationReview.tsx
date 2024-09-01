import Image from "next/image";
import React, { useState } from "react";
import BeneficiaryCard from "~/common/showDetails/beneficiaryCard";
import MemberCard from "~/common/showDetails/memberCard";
import ShowKeyValue from "~/common/showDetails/showKeyValue";
import { IBeneficiary, IFormValues, IMember } from "~/interfaces/policy";
interface IQuoteReviewProps {
  formValues: IFormValues;
  setFormValues: (value: IFormValues) => void;
}

export default function ApplicationReview({ formValues }: IQuoteReviewProps) {
  const [showDetails, setShowDetails] = useState({
    spouse: false,
    children: false,
    extendedFamily: false,
    beneficiaries: false,
  });
  return (
    <div>
      <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
        Application Review
      </h1>
      <div className="my-2 rounded shadow-xl">
        <div className="flex rounded-t bg-review-blue px-8 py-5">
          <div className=" p-2 ">
            <p className="pb-2 pr-2 text-base font-normal leading-7 text-gray-900">
              Monthly premium
            </p>
            <h1 className="pb-2 text-4xl font-semibold leading-7 text-gray-900">
              {"R " + formValues?.monthlyPremium}
            </h1>
          </div>
          <div className="mt-3 h-16 w-5 border-r-2  border-review-border"></div>

          <div className="col-span-2 ml-5 p-2 pl-4">
            <h2 className="flex items-center pb-2 text-base leading-7 text-gray-900">
              <span className="pr-2 text-sm font-medium">Sum assured: </span>
              <span className="text-xl font-bold">
                {"R " + formValues?.sumAssured}
              </span>
            </h2>
            <h2 className="flex items-center pb-2 text-base font-semibold leading-7 text-gray-900">
              <span className="pr-2 text-sm font-medium">Package name:</span>
              <span className="text-xl font-bold">
                {formValues?.package?.replaceAll("_", " ")}
              </span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 px-10">
          <ShowKeyValue
            name={"Policyholder"}
            value={formValues?.policyholder?.id}
          />
          <ShowKeyValue
            name={"Salary reference number"}
            value={formValues?.policyholder?.salaryRefNumber}
          />
          <ShowKeyValue
            name={"Type"}
            value={formValues?.package?.replaceAll("_", " ")}
          />
          <ShowKeyValue
            name={"Principle premium"}
            value={"R " + formValues?.monthlyPremium}
          />
          <ShowKeyValue
            name={"Spouse included"}
            value={formValues?.includeSpouse ? "Yes" : "No"}
          />
          <ShowKeyValue
            name={"Children included"}
            value={formValues?.includeChildren ? "Yes" : "No"}
          />
          <ShowKeyValue
            name={"Extended family included"}
            value={formValues?.includeExtendedFamily ? "Yes" : "No"}
          />
          <ShowKeyValue
            name={"Coverage option"}
            value={"Option" + " " + formValues?.coverageOption}
          />
        </div>
        <div className="px-10">
          <h2 className="py-2 text-base font-bold leading-7 text-gray-900">
            Main member
          </h2>
          <div className="grid grid-cols-2">
            <ShowKeyValue
              name={"Coverage option"}
              value={"Option" + " " + formValues?.coverageOption}
            />
            <ShowKeyValue
              name={"First name"}
              value={formValues?.policyholder?.firstName}
            />
            <ShowKeyValue
              name={"Last name"}
              value={formValues?.policyholder?.lastName}
            />
            <ShowKeyValue name={"Age"} value={formValues?.mainMember?.age} />
            <ShowKeyValue
              name={"Email"}
              value={formValues?.policyholder?.email}
            />
            <ShowKeyValue
              name={"Natural death amount"}
              value={"R " + formValues?.mainMember?.naturalDeathAmount}
            />
            <ShowKeyValue
              name={"Accidental death amount"}
              value={"R " + formValues?.mainMember?.accidentalDeathAmount}
            />
          </div>
        </div>
        {formValues.includeSpouse && (
          <div className="border-t-2 px-8 py-4">
            <h2 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
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
                  <h2 className="pt-2 text-base font-semibold leading-7 text-gray-900">
                    spouse {index + 1}
                  </h2>
                  <MemberCard member={spouse} />
                </div>
              ))}
          </div>
        )}
        {formValues.includeChildren && (
          <div className="border-t-2 px-8 py-4">
            <h2 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
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
                  <h2 className="pt-2 text-base font-semibold leading-7 text-gray-900">
                    Child {index + 1}
                  </h2>
                  <MemberCard member={child} />
                </div>
              ))}
          </div>
        )}
        {formValues.includeExtendedFamily && (
          <div className="border-t-2 px-8 py-4">
            <h2 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
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
                    <h2 className="pt-2 text-base font-semibold leading-7 text-gray-900">
                      Member {index + 1}
                    </h2>
                    <MemberCard member={member} />
                  </div>
                )
              )}
          </div>
        )}
        <div className="border-t-2 px-8 py-4">
          <h2 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
            <span>Beneficiaries</span>
            <div
              className="cursor-pointer"
              onClick={() =>
                setShowDetails({
                  ...showDetails,
                  beneficiaries: !showDetails.beneficiaries,
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
          {showDetails.beneficiaries &&
            formValues.beneficiaries.map(
              (beneficiary: IBeneficiary, index: number) => (
                <div key={index} className="px-2">
                  <h2 className="pt-2 text-base font-semibold leading-7 text-gray-900">
                    Beneficiary {index + 1}
                  </h2>
                  <BeneficiaryCard beneficiary={beneficiary} />
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
}
