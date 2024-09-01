import Image from "next/image";
import React from "react";
function Search() {
  return (
    <div>
      <div className="my-4 flex rounded-[15px] border p-3">
        <Image
          src="/icons/searchIcon.svg"
          width={20}
          height={20}
          alt="search input icon"
        />
        <input
          className="non-italic flex-1 border-none px-[25px] font-gordita text-base font-medium text-black focus:border-0 focus:outline-none"
          placeholder="Search"
        />
      </div>
    </div>
  );
}

export default Search;
