import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Button from "~/common/buttons/filledButton";
import SelectInput from "~/common/form/selectInput";
import { Capitalize } from "~/utils/helpers";

function QucikQuoteComponent(props: any) {
  const [scheme, setScheme] = useState({
    id: "",
    name: "SELECT",
  });

  const router = useRouter();

  const session = useSession();
  const packageNames = session?.data?.user?.packageName ?? [];

  const handleCreatePolicy = () => {
    switch (scheme.id) {
      case "EMPLOYEE_FUNERAL_INSURANCE":
        router.push("/quickQuote/funeral");
        break;
      case "EMPLOYEE_DEVICE_INSURANCE":
        router.push("/quickQuote/device");
        break;
      default:
        break;
    }
  };
  return (
    <>
      <h1 className="p-2 text-4xl">Get Quote</h1>
      <div className="m-8 mx-auto flex w-full justify-center">
        <div className="w-[50vw]">
          <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
            Add a policy
          </h1>
          <div className="w-full ">
            <SelectInput
              handleChange={setScheme}
              input={{
                options: [
                  { id: "Select", name: "Select", disabled: true },
                  ...(packageNames?.map((data: any) => ({
                    id: data,
                    name: Capitalize(data),
                  })) || []),
                  ,
                ],
              }}
              selected={scheme}
            />

            <p className="tetx-sm text-yellow-600">
              Select a scheme to which you want to add policy
            </p>
          </div>
          <div className="mt-4">
            <Button text="Next" onClick={() => handleCreatePolicy()} />
          </div>
        </div>
      </div>
    </>
  );
}

export default QucikQuoteComponent;
