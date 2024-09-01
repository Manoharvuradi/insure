import React from "react";
import { contactStatus } from "~/utils/constants";
import { ApplicationStatusValues } from "~/utils/constants/application";
import {
  claimApprovalStatusValues,
  claimStatusValues,
} from "~/utils/constants/claims";
import { ComplaintsStatusValues } from "~/utils/constants/complaints";
import {
  LeadStatusValues,
  PolicyStatusValues,
  contactStatusValues,
} from "~/utils/constants/policy";

interface IStatus {
  status: string;
  page: string;
  paymentMethod?: Array<Object>;
  applicationOnHold?: boolean;
  applicationRejected?: boolean;
  claimOnHold?: boolean;
  claimRejected?: boolean;
}
const Status = ({
  status,
  page,
  paymentMethod,
  applicationOnHold,
  applicationRejected,
  claimOnHold,
  claimRejected,
}: IStatus) => {
  return (
    <>
      {page == "Lead" && (
        <>
          {status == LeadStatusValues.draft && (
            <span className=" place-self-center rounded-lg  border-orange-500 bg-orange-500 px-3 py-1.5 text-sm text-white">
              DRAFT
            </span>
          )}
          {status === LeadStatusValues.declined && (
            <span className=" place-self-center rounded-lg  border-red-500 bg-red-500 px-3 py-1.5 text-sm text-white">
              DECLINED
            </span>
          )}
          {status === LeadStatusValues.inreview && (
            <span className=" place-self-center rounded-lg  border-yellow-500 bg-yellow-500 px-3 py-1.5 text-sm text-white">
              IN-REVIEW
            </span>
          )}
          {status === LeadStatusValues.accepted && (
            <span className=" place-self-center rounded-lg  border-green-500 bg-green-500 px-3 py-1.5 text-sm text-white">
              ACCEPTED
            </span>
          )}
          {status === LeadStatusValues.refused && (
            <span className=" place-self-center rounded-lg  border-red-500 bg-red-500 px-3 py-1.5 text-sm text-white">
              REFUSED
            </span>
          )}
          {applicationOnHold && (
            <span className=" place-self-center rounded-lg  border-orange-500 bg-orange-500 px-3 py-1.5 text-sm text-white">
              Application on-hold
            </span>
          )}
          {applicationRejected && (
            <span className=" place-self-center rounded-lg  border-red-500 bg-red-500 px-3 py-1.5 text-sm text-white">
              Application Rejected
            </span>
          )}
          {claimOnHold && (
            <span className=" place-self-center rounded-lg  border-orange-500 bg-orange-500 px-3 py-1.5 text-sm text-white">
              Claim on-hold
            </span>
          )}
          {claimRejected && (
            <span className=" place-self-center rounded-lg  border-red-500 bg-red-500 px-3 py-1.5 text-sm text-white">
              Claim Rejected
            </span>
          )}
        </>
      )}
      {page == "Policy" && (
        <>
          {status == PolicyStatusValues.active && (
            <span className=" place-self-center rounded-lg  border-green-500 bg-green-500 px-3 py-1.5 text-sm text-white">
              ACTIVE
            </span>
          )}
          {status === PolicyStatusValues.cancelled && (
            <span className=" place-self-center rounded-lg  border-red-500 bg-red-500 px-3 py-1.5 text-sm text-white">
              CANCELLED
            </span>
          )}
        </>
      )}
      {page == "Application" && (
        <>
          {status === "onHold" && (
            <>
              <span className="place-self-center rounded-md border-orange-500 bg-orange-500 px-3 py-1 text-xs text-white">
                ON HOLD
              </span>
            </>
          )}
          {status === ApplicationStatusValues.approved ? (
            <span className="place-self-center rounded-md border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              APPROVED
            </span>
          ) : status === ApplicationStatusValues.pending ? (
            paymentMethod?.length != 0 ? (
              <span className="place-self-center rounded-md border-orange-500 bg-orange-500 px-3 py-1 text-xs text-white">
                PENDING
              </span>
            ) : (
              <div className="flex items-center">
                <span
                  className="place-self-center rounded-md border-orange-500 bg-orange-500 px-3 py-1 text-xs text-white"
                  style={{ marginRight: "0.5rem" }}
                >
                  PENDING
                </span>
                <svg
                  className="mr-1 h-4 w-4 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-6a1 1 0 012 0v1a1 1 0 01-2 0v-1zm1-9a1 1 0 00-1 1v5a1 1 0 002 0V4a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <small className="color place-self-center font-bold text-red-500">
                  Add payment method to Issue policy
                </small>
              </div>
            )
          ) : status === ApplicationStatusValues.rejected ? (
            <span className="place-self-center rounded-full border-red-500 bg-red-500 px-3 py-1 text-xs text-white">
              Rejected
            </span>
          ) : (
            <></>
          )}
        </>
      )}
      {page == "Complaint" && (
        <>
          {status == ComplaintsStatusValues.open && (
            <span className="place-self-center rounded-lg  border-green-500 bg-green-500 px-3 py-1.5 text-sm text-white">
              OPEN
            </span>
          )}
          {status === ComplaintsStatusValues.closed && (
            <span className=" place-self-center rounded-lg  border-red-500 bg-red-500 px-3 py-1.5 text-sm text-white">
              CLOSED
            </span>
          )}
        </>
      )}
      {page == "Claim" && (
        <>
          {status == claimStatusValues.open && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimStatusValues.close && (
            <span className=" place-self-center rounded-full  border-red-500 bg-red-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimStatusValues.acknowledged && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimStatusValues.finalized && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimStatusValues.reject && (
            <span className=" place-self-center rounded-full  border-red-500 bg-red-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimApprovalStatusValues.pending && (
            <span className=" place-self-center rounded-full  border-orange-500 bg-orange-400 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimApprovalStatusValues.approved && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimApprovalStatusValues.payoutProcessed && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimApprovalStatusValues.repudated && (
            <span className=" place-self-center rounded-full  border-red-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === claimApprovalStatusValues.payoutBlocked && (
            <span className=" place-self-center rounded-full  border-red-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
        </>
      )}
      {page == "Contacts" && (
        <>
          {status === contactStatusValues.open && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === contactStatusValues.interested && (
            <span className=" place-self-center rounded-full  border-green-500 bg-green-800 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === contactStatusValues.notInterested && (
            <span className=" place-self-center rounded-full  border-red-500 bg-red-900 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === contactStatusValues.callScheduled && (
            <span className=" place-self-center rounded-full  border-orange-500 bg-orange-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {status === contactStatusValues.expired && (
            <span className=" place-self-center rounded-full  border-red-500 bg-red-500 px-3 py-1 text-xs text-white">
              {status.replace(/_/g, " ")}
            </span>
          )}
        </>
      )}
    </>
  );
};

export default Status;
