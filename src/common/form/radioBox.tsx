import React from "react";

interface IRadioBoxProps {
  options: any;
  selectedOptions: any;
  handleChange: (e: any) => void;
  tailwindClass?: string;
}

const RadioBox = ({
  options,
  selectedOptions,
  handleChange,
  tailwindClass,
}: IRadioBoxProps) => {
  return (
    <div className={`${tailwindClass}`}>
      {options.map((option: any) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={option.value}
            id={option.label}
            checked={selectedOptions.includes(option.value)}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 border-gray-300 text-primary-blue focus:ring-0"
          />
          <label
            htmlFor={option.label}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {option.label}
          </label>
        </label>
      ))}
    </div>
  );
};

export default RadioBox;
