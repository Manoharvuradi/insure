import React from "react";
import { IBeneficiary } from "~/interfaces/policy";
import ShowKeyValue from "./showKeyValue";
interface IMemberCardProps {
  beneficiary: IBeneficiary;
}

export default function BeneficiaryCard({ beneficiary }: IMemberCardProps) {
  return (
    <div>
      <div className="grid grid-cols-2">
        {beneficiary.firstName && beneficiary.lastName && (
          <>
            <ShowKeyValue name={"First name"} value={beneficiary.firstName} />
            <ShowKeyValue name={"Last name"} value={beneficiary.lastName} />
          </>
        )}
        {beneficiary.email && (
          <ShowKeyValue name={"Email"} value={beneficiary.email} />
        )}
        {beneficiary.percentage && (
          <ShowKeyValue
            name={"Percentage"}
            value={beneficiary.percentage + "%"}
          />
        )}

        {beneficiary.said && (
          <ShowKeyValue name={"SAID"} value={beneficiary.said} />
        )}
        {beneficiary.passportNumber && (
          <ShowKeyValue
            name={"Passport number"}
            value={beneficiary.passportNumber}
          />
        )}
      </div>
    </div>
  );
}
