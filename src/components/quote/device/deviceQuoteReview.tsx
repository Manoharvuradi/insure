// import Image from "next/image";
import React, { useState } from "react";
// import MemberCard from "~/common/showDetails/memberCard";
import ShowKeyValue from "~/common/showDetails/showKeyValue";
import { IFormValuesDevices } from "~/interfaces/policy";

interface IQuoteReviewProps {
  setFormValues: (value: any) => void;
  formValues: IFormValuesDevices;
}

export default function DeviceQuoteReview({ formValues }: IQuoteReviewProps) {
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
            name="Device Cost"
            value={"R " + formValues?.applicationData.devicePrice}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Start Date"
            value={formValues.startDate}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Billing Frequency"
            value={formValues.billingFrequency}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Billing Day"
            value={formValues.billingDay}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Device"
            value={formValues.applicationData.deviceType}
            justify="justify-start"
          />
        </div>
        <div className="px-10">
          <div className=" border-b-2 p-4"></div>
        </div>
      </div>
    </div>
  );
}
