import React from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import ActionButtons from "~/common/actionButtons";

const obj: any = {
  name: "John Doe",
  "phone Number": "1234567895",
  test2: "John Doe",
  age: "65",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
  test6: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    test7: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
    },
  },
  test7: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
};

function extendedPremiumView() {
  return (
    <div>
      <div className="flex justify-between p-5">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Extended Premium Calculations
        </h3>
        <ActionButtons />
      </div>
      <div className="m-2 border">
        <DescriptionList data={obj} />
      </div>
    </div>
  );
}

export default DefaultLayout(extendedPremiumView);
