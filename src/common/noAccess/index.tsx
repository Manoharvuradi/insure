import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

const NoAccessComponent = () => {
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
      <div className="text-center">
        <Image
          src="/images/noAccess.jpg"
          alt="Error Occurred"
          className="w-100 h-100 mx-auto mb-4"
          width={400}
          height={100}
        />
        <h2 className="mb-2 text-xl font-bold">Access Denied</h2>
        <p className="text-gray-500">
          <a onClick={() => router.push("/dashboard")}>back to dashboard</a>
        </p>
      </div>
    </div>
  );
};

export default NoAccessComponent;
