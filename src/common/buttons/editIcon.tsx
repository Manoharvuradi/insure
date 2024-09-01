import React from "react";
import { AiOutlineEdit } from "react-icons/ai";
interface IButtonProps {
  handleClick: () => void;
  className?: string;
}

const EditIcon = ({ handleClick, className }: IButtonProps) => {
  return (
    <button
      className={`rounded-md text-sm text-white transition duration-300 hover:text-hover-blue ${
        className || ""
      }`}
      type="button"
      onClick={handleClick}
    >
      <AiOutlineEdit className="h-6 w-6 text-primary-blue" />
    </button>
  );
};

export default EditIcon;
