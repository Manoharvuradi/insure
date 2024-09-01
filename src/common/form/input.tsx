import {
  isValidPhoneNumber,
  validatePhoneNumberLength,
} from "libphonenumber-js";
import { useRouter } from "next/router";
import { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { IEvent, IInput, IOption } from "~/interfaces/common/form";
import { merge, packageName } from "~/utils/constants";
import { classNames } from "~/utils/helpers";
import {
  validateEmail,
  validatePhoneNum,
  validateSAIDNum,
} from "~/utils/helpers/validations";

export interface IInputProps {
  input: IInput;
  handleChange: (e: IEvent, index?: number) => void;
  handlePhoneChange?: (
    name: string,
    value: string,
    index?: number
  ) => void | undefined;
  formValues?: { [key: string]: any };
  index?: number;
  formErrors?: { [key: string]: any };
  setFormErrors?: any;
  validation?: any;
  disabled?: boolean;
  tailwindClass?: string;
  handleMultipleSelect?: (e: string, name: string, index?: number) => void;
  checked?: boolean;
  packageName?: any;
  // disablePreviousDates?:boolean;
}

const InputField = ({
  input,
  handleMultipleSelect = () => {},
  handleChange,
  handlePhoneChange = () => {},
  formValues,
  index,
  formErrors,
  setFormErrors,
  validation,
  disabled,
  tailwindClass,
  checked,
  packageName,
}: // disablePreviousDates,
IInputProps) => {
  const router = useRouter();
  const { label, type, name, required, options } = input;
  const [multipleOptions, setMultipleOptions] = useState(input.multipleOptions);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [dropDownOptions, setDropDownOptions] = useState<IOption[]>([]);

  if (type === "select") {
    return (
      <div key={name} className="mb-2">
        <label
          className="block text-sm font-normal leading-6 text-gray-900"
          htmlFor={name}
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select
          className={`${
            disabled && "cursor-not-allowed"
          }  border-1 w-full rounded px-3 py-2 leading-tight ${
            formErrors?.[name]
              ? "border-red-500"
              : "border-gray-300 focus:border-primary-blue"
          } focus:outline-none`}
          id={name}
          name={name}
          required={required}
          value={formValues?.[name] || ""}
          disabled={disabled ? disabled : false}
          onChange={(e) => handleChange(e, index ?? 0)}
        >
          {options?.map((option) => (
            <option
              className={option.value === "" ? "cursor-not-allowed" : ""}
              key={option.value}
              value={option.value}
              disabled={option.value === "" ? true : false}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(formErrors?.[name] ?? false) && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {formErrors?.[name]}
          </p>
        )}
      </div>
    );
  }
  if (type === "email") {
    const isEmailValid = validateEmail(formValues?.[name]);
    return (
      <div key={name} className="mb-2">
        <label
          className="block text-sm font-normal leading-6 text-gray-900"
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <input
          className={`${
            input.disabled && "cursor-not-allowed"
          } border-1 w-full appearance-none rounded px-3 py-2 leading-tight text-gray-700 ${
            formErrors?.[name]
              ? `border-red-500 focus:border-2`
              : `border-gray-300 focus:border-primary-blue`
          } focus:outline-none `}
          id={name}
          type={type}
          name={name}
          value={formValues?.[name]}
          onChange={(e) => {
            e.target.value = e.target.value.startsWith(" ")
              ? e.target.value.trim()
              : e.target.value;
            handleChange(e, index ?? 0);
          }}
          required={required && !formValues?.[name]}
          disabled={input.disabled ? input.disabled : false}
        />
        {(formErrors?.[name] || !isEmailValid) && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            Please Enter a Valid Email
          </p>
        )}
      </div>
    );
  }
  if (type == "checkbox") {
    return (
      <div className="mb-2 ml-3 block self-center text-sm font-normal leading-6  text-gray-900">
        <input
          type={type}
          id={name}
          name={name}
          className="form-checkbox h-4 w-4 rounded-sm border-2 border-border-grey text-primary-blue focus:ring-0"
          checked={checked ? checked : formValues?.[name] || false}
          onChange={(e) => handleChange(e, index ?? 0)}
          disabled={disabled ? disabled : false}
        />
        {label && (
          <label
            htmlFor={name}
            className="ml-2 text-gray-800"
            style={{ pointerEvents: "none" }}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
  if (type === "textarea") {
    let textareaValue = formValues?.[name] || "";
    const isTextareaValid = textareaValue.length >= 50;
    const showTextareaError = textareaValue.length > 0 && !isTextareaValid;
    return (
      <div className="" key={name}>
        <label
          className="block text-sm font-normal leading-6 text-gray-900"
          htmlFor={name}
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          rows={3}
          className={`${
            disabled && "cursor-not-allowed"
          }  w-full appearance-none rounded border-2 px-3 py-2 leading-tight text-gray-700 ${
            formErrors?.[name]
              ? "border-red-500"
              : "border-gray-300 focus:border-primary-blue"
          } focus:outline-none`}
          id={name}
          name={name}
          value={formValues?.[name] || ""}
          required={required}
          onChange={(e) => {
            e.target.value = e.target.value.startsWith(" ")
              ? e.target.value.trim()
              : e.target.value;
            handleChange(e, index ?? 0);
          }}
          disabled={disabled ? disabled : false}
        />
        {(formErrors?.[name] || false) && (
          <p className="mt-2 text-sm text-red-600">{formErrors[name]}</p>
        )}
      </div>
    );
  }
  if (type == "said") {
    const isvalidsaid = validateSAIDNum(formValues?.[name]);
    return (
      <div key={name} className="mb-2">
        <label
          className="block text-sm font-normal leading-6 text-gray-900"
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <input
          className={`${
            disabled && "cursor-not-allowed"
          }  w-full appearance-none rounded border-2 px-3 py-2 leading-tight  text-gray-700  ${
            isvalidsaid || formErrors?.[name]
              ? `border-gray-300 focus:border-primary-blue`
              : `border-red-500 focus:border-2`
          } focus:outline-none `}
          id={name}
          type="text"
          name={name}
          value={formValues?.[name] || ""}
          onChange={(e) => handleChange(e, index ?? 0)}
          required={required}
          disabled={disabled ? disabled : false}
        />
        {(formErrors?.[name] || !isvalidsaid) && (
          <p className="mt-2 text-sm text-red-600">
            {formErrors?.[name] ? formErrors?.[name] : "Invalid SAID"}
          </p>
        )}
      </div>
    );
  }
  if (type == "phone") {
    let isValidPhone = validatePhoneNum(formValues?.[name]);
    return (
      <div key={name} className="mb-2">
        <label
          className="block text-sm font-normal leading-6 text-gray-900"
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <PhoneInput
          inputProps={{
            name: "",
            required: required,
            style: {
              fontSize: "14px",
              lineHeight: " 22px",
              height: "40px",
              width: "100%",
              borderRadius: "6px",
            },
          }}
          // country={"za"}
          preferredCountries={["za", "in"]}
          placeholder="Enter phone number"
          value={formValues?.[name] || ""}
          onChange={(value, country: any, e, formattedValue) => {
            handlePhoneChange(name, formattedValue, index);
            isValidPhone = isValidPhoneNumber(
              formattedValue,
              country.countryCode?.toUpperCase()
            );
          }}
        />
        {(formErrors?.[name] || !isValidPhone) && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {formErrors?.[name] ? formErrors?.[name] : "Invalid phone number"}
          </p>
        )}
      </div>
    );
  }
  if (type === "multi-select") {
    return (
      <div className={`${input?.disabled && "cursor-not-allowed"} w-full`}>
        <label
          className="block text-sm font-normal leading-6 text-gray-900 "
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {showOptions && (
          <div
            className={`max-h-40 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-sm scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md`}
          >
            {multipleOptions?.map((checkbox, i) => (
              <div
                key={i + "userOption"}
                className={`${
                  input?.disabled && "cursor-not-allowed"
                } flex items-center px-4 py-2 hover:bg-gray-100 `}
              >
                <input
                  type="checkbox"
                  className={`${
                    input?.disabled ? "cursor-not-allowed" : "cursor-pointer"
                  } form-checkbox mr-2  text-primary-blue focus:ring-0`}
                  value={checkbox.name}
                  id={checkbox.label}
                  checked={formValues?.[name]?.includes(checkbox.name)}
                  onChange={(e) =>
                    handleMultipleSelect(e.target.value, label, i)
                  }
                />
                <label
                  htmlFor={checkbox.label}
                  className={`${
                    input?.disabled ? "cursor-not-allowed" : "cursor-pointer"
                  } text-table-h text-sm font-semibold`}
                >
                  {checkbox.label}
                </label>
              </div>
            ))}
            {noResultsFound && (
              <p className="text-table-h cursor-pointer px-4 py-2 text-sm font-semibold">
                No Results
              </p>
            )}
          </div>
        )}
        {(formErrors?.[name] || false) && (
          <p className="mt-2 text-sm text-red-600">{formErrors[name]}</p>
        )}
      </div>
    );
  }
  if (type === "password") {
    const [password, setPassword] = useState({
      showPassword: false,
      showOldPassword: false,
      showConfirmPassword: false,
    });
    return (
      <div
        key={name}
        className={classNames(
          tailwindClass ? tailwindClass : "",
          "relative mb-2"
        )}
      >
        <label
          className="block text-sm font-normal leading-6"
          htmlFor={name}
          style={{ pointerEvents: "none" }}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          className={`${
            disabled && "cursor-not-allowed"
          }  border-1 w-full appearance-none rounded px-3 py-2 leading-tight ${
            formErrors?.[name]
              ? "border-red-500"
              : "border-gray-300 focus:border-primary-blue"
          } relative focus:outline-none`}
          id={name}
          type={password.showOldPassword ? "text" : "password"}
          name={name}
          value={formValues?.[name] || ""}
          required={required && !formValues?.[name]}
          onChange={(e) => {
            e.target.value = e.target.value.startsWith(" ")
              ? e.target.value.trim()
              : e.target.value;
            handleChange(e, index ?? 0);
          }}
          disabled={disabled ? disabled : false}
        />
        {formValues?.oldPassword && (
          <button
            type="button"
            onClick={() => {
              setPassword((prevState) => ({
                ...prevState,
                showOldPassword: !prevState.showOldPassword,
              }));
            }}
            className="absolute right-4 top-8"
          >
            {formValues?.oldPassword &&
              (password.showOldPassword ? <BiHide /> : <BiShow />)}
          </button>
        )}

        {formValues?.newPassword && (
          <button
            type="button"
            onClick={() => {
              setPassword((prevState) => ({
                ...prevState,
                showPassword: !prevState.showPassword,
              }));
            }}
          >
            {formValues?.showPassword &&
              (password.showPassword ? <BiHide /> : <BiShow />)}
          </button>
        )}
        {formValues?.newPassword && (
          <button
            type="button"
            onClick={() => {
              setPassword((prevState) => ({
                ...prevState,
                showConfirmPassword: !prevState.showConfirmPassword,
              }));
            }}
          >
            {formValues?.showConfirmPassword &&
              (password.showConfirmPassword ? <BiHide /> : <BiShow />)}
          </button>
        )}
        {(formErrors?.[name] || false) && (
          <p className="mt-2 text-sm text-red-600">{formErrors[name]}</p>
        )}
      </div>
    );
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let disableDate = tomorrow.toISOString().split("T")[0];
  const disablePreviousDates =
    router.pathname.includes("create") &&
    router.pathname.includes("retailDevice");
  return (
    <div
      key={name}
      className={classNames(tailwindClass ? tailwindClass : "", "mb-2")}
    >
      <label
        className="block text-sm font-normal leading-6"
        htmlFor={name}
        style={{ pointerEvents: "none" }}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`${
          disabled && "cursor-not-allowed"
        }  border-1 w-full appearance-none rounded px-3 py-2 leading-tight ${
          formErrors?.[name]
            ? "border-red-500"
            : "border-gray-300 focus:border-primary-blue"
        } focus:outline-none `}
        id={name}
        type={type}
        name={name}
        value={formValues?.[name] == "0" ? "0" : formValues?.[name]}
        min={disablePreviousDates ? disableDate : undefined}
        required={required && !formValues?.[name]}
        onChange={(e) => {
          e.target.value = e.target.value.startsWith(" ")
            ? e.target.value.trim()
            : e.target.value;
          handleChange(e, index ?? 0);
        }}
        disabled={disabled ? disabled : false}
      />
      {(formErrors?.[name] || false) && (
        <p className="mt-2 text-sm text-red-600">{formErrors[name]}</p>
      )}
    </div>
  );
};

export default InputField;
