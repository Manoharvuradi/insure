import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { text } from "stream/consumers";

interface IButtonProps {
  handleDelete: () => void;
  isArchive?: boolean;
  deleteAll?: boolean;
}

const DeleteButton = ({ handleDelete, isArchive, deleteAll }: IButtonProps) => {
  return (
    <span className="cursor-pointer">
      <button
        className="flex h-8 items-center justify-center gap-2 rounded-md border bg-red-500 px-2.5 text-sm text-white"
        type="button"
        onClick={handleDelete}
      >
        <span>{isArchive ? `Unarchive` : "Archive"}</span>
        <RiDeleteBinLine className="h-4 w-4" />
      </button>
    </span>
  );
};

export default DeleteButton;
