import React from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  // icon?: any;
  text?: React.ReactNode;
  onClick?: any;
  disabled?: boolean;
  className?: string;
}
export default function Button(props: ButtonProps) {
  const { text, onClick, type, disabled, className } = props;
  return (
    <button
      className={`flex h-8 items-center justify-center gap-2 rounded-md bg-primary-blue px-2.5 text-sm text-white transition duration-300 hover:bg-hover-blue ${
        className || ""
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      disabled={disabled}
      type={type ? type : "button"}
      onClick={onClick ? () => onClick() : () => {}}
    >
      {text}
    </button>
  );
}
