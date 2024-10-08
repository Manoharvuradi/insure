import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { classNames } from "~/utils/helpers";

interface IOption {
  id: any;
  name: string;
  disabled?: boolean;
}

interface ISelectProps {
  input: any;
  handleChange: any;
  selected: any;
}

export default function SelectInput({
  input,
  handleChange,
  selected,
}: ISelectProps) {
  const { label, name, options, disabled } = input;

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          {label && (
            <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
              {label}
            </Listbox.Label>
          )}
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected?.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options?.map((option: IOption) => (
                  <Listbox.Option
                    key={option.id + option.name}
                    disabled={option.disabled}
                    className={({ active }) =>
                      classNames(
                        active
                          ? "white bg-blue-600 text-white"
                          : "text-gray-900",
                        "relative cursor-pointer select-none py-2 pl-8 pr-4"
                      )
                    }
                    value={option}
                  >
                    <>
                      <span
                        className={classNames(
                          selected.id == option.id
                            ? "font-semibold"
                            : "font-normal",
                          "block truncate pl-2"
                        )}
                      >
                        {option.name}
                      </span>
                      {selected.id == option.id && (
                        <span
                          className={classNames(
                            selected.id == option.id
                              ? "text-blue-600"
                              : "text-white",
                            "absolute inset-y-0 left-0 flex items-center px-4"
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
