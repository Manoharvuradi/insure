import React from "react";
import BeneficiaryCard from "~/common/showDetails/beneficiaryCard";
import ShowKeyValue from "~/common/showDetails/showKeyValue";
import {
  ICreditLifeBenficiary,
  IRetailFormValuesDevices,
} from "~/interfaces/policy";
import { correctedLabels } from "~/utils/constants";

interface IRetailInfo {
  formValues: IRetailFormValuesDevices;
}
function RetailDeviceAppReviewForm({ formValues }: IRetailInfo) {
  return (
    <div>
      <div className="my-2 rounded-md shadow-xl">
        <div className="flex rounded-t bg-review-blue px-8 py-5">
          <div className=" p-2 ">
            <h1 className="font-nomral pb-2 pr-4 text-sm font-medium leading-7 text-gray-900">
              Device premium:{" "}
              <p className="pb-2 text-2xl font-semibold leading-7 text-gray-900">
                {"R " +
                  (+formValues.applicationData.deviceData.totalPremium).toFixed(
                    2
                  )}
              </p>
            </h1>
            {formValues.creditLifeOpt && formValues.confirmCreditLife && (
              <h1 className="pb-2 pr-4 text-sm font-medium leading-7 text-gray-900">
                Credit life premium:{" "}
                <p className="pb-2 text-2xl font-semibold leading-7 text-gray-900">
                  {"R " +
                    (+formValues.applicationData.creditLifeData
                      .totalPremium).toFixed(2)}
                </p>
              </h1>
            )}
          </div>
          <div className="mt-3 w-5 border-r-2  border-review-border"></div>
          <div className="col-span-2 ml-5 p-2 pl-4">
            <div className="">
              <p className="p-2 text-sm font-medium ">
                Device insurance sum assured:{" "}
                <span className="text-xl font-bold">
                  {"R " + formValues.applicationData.deviceData.sumAssured}
                </span>
              </p>
              {formValues.creditLifeOpt && formValues.confirmCreditLife && (
                <p className="p-2 text-sm  font-medium">
                  Device Credit life sum assured:{" "}
                  <span className="text-xl font-bold">
                    {"R " +
                      formValues.applicationData.creditLifeData.sumAssured}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center pb-2 text-base font-semibold  text-gray-900">
              <span className="p-2 text-sm font-medium">Insurance Type:</span>
              <span className="text-xl font-bold">
                {formValues.applicationData.deviceData.packageName.replaceAll(
                  "_",
                  " "
                )}
                {formValues.creditLifeOpt && formValues.confirmCreditLife && (
                  <>
                    ,{" "}
                    {correctedLabels[
                      formValues.applicationData.creditLifeData.packageName
                    ].replaceAll("_", " ")}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 px-10 pt-6">
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
            value={formValues.applicationData.deviceData.deviceType}
            justify="justify-start"
          />
        </div>
        <div className="px-10">
          <h2 className="py-2 text-base font-bold leading-7 text-gray-900">
            Main member
          </h2>
          <div className="grid grid-cols-2">
            <ShowKeyValue
              name={"First name"}
              value={formValues?.policyholder?.firstName}
            />
            <ShowKeyValue
              name={"Last name"}
              value={formValues?.policyholder?.lastName}
            />
            <ShowKeyValue
              name={"Email"}
              value={formValues?.policyholder?.email}
            />
          </div>
        </div>

        <div className="border-t-2 px-8 py-4">
          <h2 className="py-2 text-base font-bold leading-7 text-gray-900">
            Device details
          </h2>
          <div className="grid grid-cols-2">
            <ShowKeyValue
              name={"Device Type"}
              value={formValues?.applicationData?.deviceData.deviceType}
            />
            <ShowKeyValue
              name={"Device Brand"}
              value={formValues?.applicationData?.deviceData.deviceBrand}
            />
            <ShowKeyValue
              name={"Device Model"}
              value={formValues?.applicationData?.deviceData.deviceModel}
            />
            <ShowKeyValue
              name={"Device Color"}
              value={formValues?.applicationData?.deviceData.deviceModelColor}
            />
            <ShowKeyValue
              name={"Device Price"}
              value={"R " + formValues?.applicationData?.deviceData.devicePrice}
            />
            <ShowKeyValue
              name={"Device Unique Number"}
              value={formValues?.applicationData?.deviceData.deviceUniqueNumber}
            />
          </div>
        </div>
        {formValues.creditLifeOpt && formValues.confirmCreditLife && (
          <>
            <div className="border-t-2 px-8 py-4">
              <h2 className="py-2 text-base font-bold leading-7 text-gray-900">
                Credit life details
              </h2>
              <div className="grid grid-cols-2">
                <ShowKeyValue
                  name={"Additional percentage insured"}
                  value={
                    formValues?.applicationData?.creditLifeData
                      .additionalPercentageInsured + "%"
                  }
                />
                <ShowKeyValue
                  name={"Device financed by"}
                  value={
                    formValues?.applicationData?.creditLifeData.deviceFinancedBy
                  }
                />
                <ShowKeyValue
                  name={"Outstanding settlement balance"}
                  value={
                    "R " +
                    formValues?.applicationData?.creditLifeData
                      .outstandingSettlementBalance
                  }
                />
              </div>
            </div>
            <div className="px-8 py-4">
              <h2 className="flex justify-between p-2 text-base font-bold leading-7 text-gray-900">
                <span>Beneficiaries</span>
              </h2>
              {formValues.creditLifeOpt &&
                formValues.creditLifeBeneficiaries.map(
                  (beneficiary: ICreditLifeBenficiary, index: number) => (
                    <div key={index} className="px-2">
                      <h2 className="pt-2 text-base font-semibold leading-7 text-gray-900">
                        Beneficiary {index + 1}
                      </h2>
                      <BeneficiaryCard beneficiary={beneficiary} />
                    </div>
                  )
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RetailDeviceAppReviewForm;
