import { Menu } from "@headlessui/react";
import { classNames } from "~/utils/helpers";

interface IMenuItem {
  name: string;
  handleClick: (() => void) | undefined;
}
const MenuItem = ({ name, handleClick }: IMenuItem) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={classNames(
            active ? "text-gray-700" : "text-black group-hover:text-white",
            "hover:pointer flex w-full  cursor-pointer justify-start px-4 py-1.5 text-sm transition duration-300 hover:bg-[#F0F9FF] hover:text-primary-blue"
          )}
          onClick={handleClick}
        >
          {name}
        </button>
      )}
    </Menu.Item>
  );
};

export default MenuItem;
