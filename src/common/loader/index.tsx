import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <img
        className="h-100 w-200 bg-color=#000 filter"
        src="/images/loader2.svg"
        alt=""
      />
    </div>
  );
};

export default Loader;
