import React from "react";
import { AiOutlineUpload } from "react-icons/ai";
interface IButtonProps {
  handleClick: () => void;
}

const UploadButton = ({ handleClick }: IButtonProps) => {
  return (
    <button
      className="rounded-md text-sm text-white transition duration-300 hover:text-hover-blue"
      type="button"
      onClick={handleClick}
    >
      <AiOutlineUpload className="h-6 w-6 text-primary-blue" />
    </button>
  );
};

export default UploadButton;
