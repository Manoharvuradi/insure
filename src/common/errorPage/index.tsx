import Image from "next/image";
import React from "react";

const ErrorComponent = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Image
          src="/images/error.jpg"
          alt="Error Occurred"
          className="w-100 h-100 mx-auto mb-4"
          width={300}
          height={100}
        />
        <h2 className="mb-2 text-xl font-bold">Oops! Something went wrong.</h2>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    </div>
  );
};

export default ErrorComponent;
