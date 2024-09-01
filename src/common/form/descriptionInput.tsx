import { IInputProps } from "./input";

export default function DescriptionInput({
  input,
  formValues,
  handleChange,
  index,
}: IInputProps) {
  const { label, type, name } = input;
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <textarea
          rows={4}
          name={name}
          id={name}
          className="w-full appearance-none rounded border-2 px-3 py-2 leading-tight text-gray-700 focus:border-blue-600 focus:outline-none"
          value={formValues?.name ? formValues?.name : ""}
          onChange={(e) => handleChange(e, index ?? 0)}
        />
      </div>
    </div>
  );
}
