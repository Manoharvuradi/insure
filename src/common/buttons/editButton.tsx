import React from "react";
import { AiOutlineEdit } from "react-icons/ai";
interface IButtonProps {
  handleClick: () => void;
  className?: string;
}

const EditButton = ({ handleClick, className }: IButtonProps) => {
  return (
    <button
      className={`flex h-8 items-center justify-center gap-2 rounded-md rounded-md border bg-primary-blue px-2.5 text-sm text-sm text-white transition duration-300 hover:text-hover-blue ${
        className || ""
      }`}
      type="button"
      onClick={handleClick}
    >
      <span>Edit</span>
      <AiOutlineEdit className="h-6 w-6 text-white" />
    </button>
  );
};

export default EditButton;
