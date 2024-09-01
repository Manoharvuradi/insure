import React, { useState } from "react";
import DefaultLayout from "~/components/defaultLayout";
import DevicePolicy from "~/components/policy/devicePolicy";
import withAuth from "~/pages/api/auth/withAuth";
import Image from "next/image";
import Link from "next/link";
import DeviceQuoteForm from "~/components/quote/device/deviceQuoteForm";
import { packageNames } from "~/utils/constants";
import { IFormValuesDevices } from "~/interfaces/policy";
import { IEvent } from "~/interfaces/common/form";

function DeviceQuote(props: any) {
  const [formValues, setFormValues] = useState({
    package: packageNames.device,
    beneficiaries: [{}],
    paymentMethod: [{}],
    deviceCatalog: props.deviceCatalog,
  } as IFormValuesDevices);
  const [formErrors, setFormErrors] = useState<any>({
    package: "",
    mainMember: {},
    beneficiaries: [],
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
          <p className="p-2 text-3xl font-normal">Telkom Device Policy</p>
        </div>
        <DeviceQuoteForm
          formValues={formValues}
          setFormValues={setFormValues}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          handleFormInputChange={handleFormInputChange}
        />
      </div>
    </div>
  );
}

export default withAuth(DefaultLayout(DeviceQuote));
