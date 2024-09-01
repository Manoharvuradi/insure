import Link from "next/link";
import React from "react";
import DefaultLayout from "~/components/defaultLayout";
import FuneralPolicy from "~/components/policy/funeralPolicy";
import { FaArrowLeft } from "react-icons/fa";
import withAuth from "~/pages/api/auth/withAuth";
import Image from "next/image";

function CreateFuneralPolicy(props: any) {
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
          <p className="p-2 text-3xl font-normal">Telkom Funeral Policy</p>
        </div>
        <FuneralPolicy accessLevels={props.accessLevels} />
      </div>
    </div>
  );
}
export default withAuth(DefaultLayout(CreateFuneralPolicy));
