import React from "react";
import ShowKeyValue from "~/common/showDetails/showKeyValue";
import { IRetailFormValuesDevices } from "~/interfaces/policy";
import { correctedLabels } from "~/utils/constants";

interface IQuoteReviewProps {
  formValues: IRetailFormValuesDevices;
}
function RetailDeviceQuoteReview({ formValues }: IQuoteReviewProps) {
  return (
    <div>
      <div className="my-2 rounded shadow-xl">
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
            {formValues.creditLifeOpt && (
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
              {formValues.creditLifeOpt && (
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
                {formValues.creditLifeOpt && (
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
        </div>
        <div className="px-10">
          <div className=" border-b-2 p-4"></div>
        </div>
        <div className="grid grid-cols-2 px-10 pt-6">
          <ShowKeyValue
            name="Package"
            value={formValues.applicationData.deviceData.packageName.replaceAll(
              "_",
              " "
            )}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Device Cost"
            value={"R " + formValues?.applicationData.deviceData.devicePrice}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Device"
            value={formValues.applicationData.deviceData.deviceType}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Monthly premium"
            value={"R " + formValues.applicationData.deviceData.totalPremium}
            justify="justify-start"
          />
          <ShowKeyValue
            name="Sum assured"
            value={"R " + formValues?.applicationData.deviceData.devicePrice}
            justify="justify-start"
          />
        </div>
        {formValues.applicationData.creditLifeData !== undefined && (
          <>
            <div className="px-10">
              <div className=" border-b-2 p-4"></div>
            </div>
            <div className="grid grid-cols-2 px-10 pt-6">
              <ShowKeyValue
                name="Package"
                value={correctedLabels[
                  formValues.applicationData.creditLifeData.packageName
                ].replaceAll("_", " ")}
                justify="justify-start"
              />
              <ShowKeyValue
                name="Device financed by"
                value={
                  formValues.applicationData.creditLifeData.deviceFinancedBy
                }
                justify="justify-start"
              />
              <ShowKeyValue
                name="Additional percentage insured"
                value={
                  formValues.applicationData.creditLifeData
                    .additionalPercentageInsured
                }
                justify="justify-start"
              />
              <ShowKeyValue
                name="Outstanding settlement balance"
                value={
                  "R " +
                  formValues.applicationData.creditLifeData
                    .outstandingSettlementBalance
                }
                justify="justify-start"
              />
              <ShowKeyValue
                name="Sum assured"
                value={
                  "R " +
                  formValues.applicationData.creditLifeData
                    .outstandingSettlementBalance
                }
                justify="justify-start"
              />
              <ShowKeyValue
                name="Monthly premium"
                value={
                  "R " + formValues.applicationData.creditLifeData.totalPremium
                }
                justify="justify-start"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RetailDeviceQuoteReview;
