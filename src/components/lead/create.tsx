import { useRouter } from "next/router";
import React, { useState } from "react";
import Button from "~/common/buttons/filledButton";
import SelectInput from "~/common/form/selectInput";
import { packageNames } from "~/utils/constants";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Capitalize } from "~/utils/helpers";

export default function CreateLead(props: any) {
  const [scheme, setScheme] = useState({
    id: "",
    name: "SELECT",
  });

  const router = useRouter();

  const session = useSession();
  //   const packageNames = session?.data?.user?.packageName ?? [];
  const packageNames = [
    {
      id: "DEVICE_INSURANCE",
      name: "Device Insurance",
    },
  ];
  const handleCreatePolicy = () => {
    switch (scheme.id) {
      case "FUNERAL_INSURANCE":
        // router.push("/lead/create/retail");
        break;
      case "DEVICE_INSURANCE":
        router.push("/lead/create/retailDevice");
        break;
      default:
        break;
    }
  };
  return (
    <div className="m-8 mx-auto flex w-full justify-center">
      <div className="w-[50vw]">
        <h1 className="pb-2 text-2xl font-normal leading-7 text-gray-900">
          Add a Prospect
        </h1>
        <div className="w-full ">
          <SelectInput
            handleChange={setScheme}
            input={{
              options: [
                { id: "Select", name: "Select", disabled: true },
                ...(packageNames?.map((data: any) => ({
                  id: data?.id,
                  name: data?.name,
                })) || []),
                ,
              ],
            }}
            selected={scheme}
          />

          <p className="tetx-sm text-yellow-600">
            Select a scheme to which you want to create Lead
          </p>
        </div>
        <div className="mt-4">
          <Button text="Next" onClick={() => handleCreatePolicy()} />
        </div>
      </div>
    </div>
  );
}
