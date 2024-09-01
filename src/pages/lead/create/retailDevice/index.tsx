import Link from "next/link";
import React from "react";
import DefaultLayout from "~/components/defaultLayout";
import withAuth from "~/pages/api/auth/withAuth";
import Image from "next/image";
import RetailDevicePolicy from "~/components/retailDevice";
import { useRouter } from "next/router";

function CreateDeviceRetailPolicy(props: any) {
  const router = useRouter();
  return (
    <div>
      <div className="m-4 ">
        <div className="flex">
          <Link
            href={"/lead/create"}
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
          <p className="p-2 text-3xl font-normal">Telkom Device Prospect</p>
        </div>
        <RetailDevicePolicy
          accessLevels={props.accessLevels}
          userType={props.userType}
        />
      </div>
    </div>
  );
}
export default withAuth(DefaultLayout(CreateDeviceRetailPolicy));
