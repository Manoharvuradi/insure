import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
import { alertprops } from "~/interfaces/common";

const Alert = (props: alertprops) => {
  return (
    <>
      {props.status == "error" && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There were 2 errors with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  <li>Your password must be at least 8 characters</li>
                  <li>
                    Your password must include at least one pro wrestling
                    finishing move
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {props.status == "success" && (
        <div className="h-[40px] w-[500px] rounded-md bg-green-50 p-4 text-center">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {props.message}
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;
