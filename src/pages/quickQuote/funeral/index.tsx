import React, { useState } from "react";
import DefaultLayout from "~/components/defaultLayout";
import DevicePolicy from "~/components/policy/devicePolicy";
import withAuth from "~/pages/api/auth/withAuth";
import Image from "next/image";
import Link from "next/link";
import FuneralPolicy from "~/components/policy/funeralPolicy";
import QuoteForm from "~/components/quote/funeral/quoteForm";
import { IEvent } from "~/interfaces/common/form";

function FuneralQuote(props: any) {
  const [formValues, setFormValues] = useState<any>({
    package: "EMPLOYEE_FUNERAL_INSURANCE",
    children: [{ isDisabled: false, isStudying: false, isStillBorn: false }],
    extendedFamily: [{}],
    beneficiaries: [{}],
    spouse: [{}],
    paymentMethod: null,
    next: false,
  });

  const [formErrors, setFormErrors] = useState<any>({
    package: "",
    mainMember: {},
    spouse: [{}],
    children: [{}],
    extendedFamily: [{}],
    beneficiaries: [{}],
    paymentMethod: {},
  });

  const handleFormInputChange = (event: IEvent, index?: number) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <div>
      <div className="m-4 ">
        <div className="flex">
          <Link
            href={"/quickQuote"}
            className="flex p-2 text-base font-bold text-primary-600"
          >
            <Image
              src="/icons/Backbutton.svg"
              height={40}
              width={40}
              alt="back"
              className="ml-3"
            />
          </Link>
          <p className="p-2 text-3xl font-normal">Telkom Funeral Policy</p>
        </div>
        <QuoteForm
          formValues={formValues}
          setFormValues={setFormValues}
          formErrors={formErrors}
          handleFormInputChange={handleFormInputChange}
          setFormErrors={setFormErrors}
        />
      </div>
    </div>
  );
}

export default withAuth(DefaultLayout(FuneralQuote));
