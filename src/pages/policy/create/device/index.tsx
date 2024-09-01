import Link from "next/link";
import React, { useEffect, useState } from "react";
import DefaultLayout from "~/components/defaultLayout";
import FuneralPolicy from "~/components/policy/funeralPolicy";
import { FaArrowLeft } from "react-icons/fa";
import withAuth from "~/pages/api/auth/withAuth";
import Image from "next/image";
import DevicePolicy from "~/components/policy/devicePolicy";
import { DeviceCatalog } from "@prisma/client";
import { api } from "~/utils/api";

function CreateDevicePolicy(props: any) {
  return (
    <div>
      <div className="m-4 ">
        <div className="flex">
          <Link
            href={"/policy/create"}
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
        <DevicePolicy accessLevels={props.accessLevels} />
      </div>
    </div>
  );
}
export default withAuth(DefaultLayout(CreateDevicePolicy));
