import React from "react";
import PaymentsForm from "~/components/employee/funeral/payments";
import { claimPaymentInputs } from "~/utils/constants/payments";

export default function PolicyPayment() {
  return (
    <div>
      <div className="mx-4 my-8">
        <h1 className="p-2 text-4xl">Create new payment</h1>
        <PaymentsForm inputs={claimPaymentInputs} />
      </div>
    </div>
  );
}
