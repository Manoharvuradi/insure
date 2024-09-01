import React, { useState, ChangeEvent } from "react";
import Button from "../buttons/filledButton";
import SecondaryButton from "../buttons/secondaryButton";

interface CustomOtpInputProps {
  numberOfDigits: number;
  onSubmit: any;
  handleBack?: any;
  isAuthType?: string;
}

const CustomOtpInput: React.FC<CustomOtpInputProps> = ({
  numberOfDigits,
  handleBack,
  onSubmit,
  isAuthType,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(numberOfDigits).fill(""));

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus on the next input field, if available
      if (index < numberOfDigits - 1 && value.length === 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleSubmit = () => {
    // Combine the OTP digits into a single code
    const otpCode = otp.join("");

    // Call the custom onSubmit function with the OTP code
    onSubmit(otpCode, isAuthType);

    // Reset the OTP input fields
    setOtp(new Array(numberOfDigits).fill(""));
  };

  return (
    <div>
      <div className="flex space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            id={`otp-input-${index}`}
            className="h-12 w-12 rounded border border-gray-300 text-center"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <SecondaryButton className="mt-4" text={"Back"} onClick={handleBack} />
        <Button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleSubmit}
          text={"Verify"}
        />
      </div>
    </div>
  );
};

export default CustomOtpInput;
