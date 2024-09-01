import { isValidPhoneNumber } from "libphonenumber-js";
import { dateConversion } from ".";

export function validateEmail(email: string) {
  if (!email) return true;
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}

export function validateSAIDNumber(idNumber: string): boolean {
  // Check if the ID number is a string and has a length of 13
  if (typeof idNumber !== "string" || idNumber.length !== 13) {
    return false;
  }

  // Check if the ID number consists only of digits
  if (!/^\d+$/.test(idNumber)) {
    return false;
  }

  // Check the first two digits of the ID number (YY) to ensure they represent a valid year
  const yearDigits = idNumber.substring(0, 2);
  const currentYear = new Date().getFullYear() % 100; // get the last two digits of the current year
  const yearPrefix = currentYear - 10; // subtract 10 to get the prefix of valid years
  if (+yearDigits < yearPrefix || +yearDigits > currentYear) {
    return false;
  }

  // Check the third and fourth digits of the ID number (MM) to ensure they represent a valid month
  const monthDigits = idNumber.substring(2, 4);
  if (+monthDigits < 1 || +monthDigits > 12) {
    return false;
  }

  // Check the fifth and sixth digits of the ID number (DD) to ensure they represent a valid day
  const dayDigits = idNumber.substring(4, 6);
  if (+dayDigits < 1 || +dayDigits > 31) {
    return false;
  }

  // Check the seventh to ninth digits of the ID number (SSS) to ensure they represent a valid sequence number
  const seqDigits = idNumber.substring(6, 9);
  if (+seqDigits === 0) {
    return false;
  }

  // Check the tenth digit of the ID number (C) to ensure it represents a valid citizenship status
  const citDigit = idNumber.substring(9, 10);
  if (+citDigit !== 0 && +citDigit !== 1) {
    return false;
  }

  // Check the eleventh digit of the ID number (G) to ensure it represents a valid gender
  const genderDigit = idNumber.substring(10, 11);
  if (+genderDigit < 0 || +genderDigit > 8) {
    return false;
  }

  // Check the twelfth and thirteenth digits of the ID number (P) to ensure they represent a valid checksum
  const checksumDigits = idNumber.substring(0, 12);
  const checksum = +idNumber.substring(12, 13);
  const weightedChecksum = checksumDigits
    .split("")
    .reduce((acc, digit, index) => {
      const weight = [1, 2][index % 2] as number; // alternate weighting of digits
      const weightedDigit = Number(digit) * weight;
      return acc + (weightedDigit > 9 ? weightedDigit - 9 : weightedDigit);
    }, 0);
  const calculatedChecksum = (10 - (weightedChecksum % 10)) % 10;
  if (checksum !== calculatedChecksum) {
    return false;
  }

  return true;
}

export function dateSAIDvalidation(dob: string) {
  const currentDate = new Date();
  const currYear = currentDate.getFullYear() % 100;
  let dobYear = parseInt(dob.substring(0, 2));
  if (parseInt(dob.substring(0, 2)) <= currYear) {
    dobYear = parseInt("20" + dob.substring(0, 2));
  }
  const birthDate = new Date(
    dobYear,
    parseInt(dob.substring(2, 4)) - 1,
    parseInt(dob.substring(4, 6))
  );
  const dateOfBirth = dateConversion(birthDate);
  return dateOfBirth;
}

export function validateSAIDNum(number: string) {
  if (number) {
    if (number.length == 13) {
      const digits = Array.from(String(number), Number);
      let sum = 0;
      let alternate = false;

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit: any = digits[i];
        if (alternate) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
        alternate = !alternate;
      }

      return sum % 10 === 0;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

export function dateOfBirthValidation(date: Date) {
  const inputDate = new Date(date);
  const currentDate = new Date();
  if (inputDate < currentDate || !date) {
    return true;
  } else {
    return false;
  }
}

/**
 *
 * @param num validate phone number
 * @returns
 */
export function validatePhoneNum(num: string) {
  if (!num || num.length === 0) {
    return true;
  }

  // If num starts with '+27', remove spaces and hyphens and validate with validateSAPhone
  if (num.startsWith("+27")) {
    let number = num.replace(/[\s-]/g, "");
    return validateSAPhone(number);
  }

  if (!num.startsWith("+27")) {
    return isValidPhoneNumber(num);
  }
}

export const validateSAPhone = (input: string): boolean => {
  const regexPattern = /^(\+27|0)[0-9]{9}$/;
  return regexPattern.test(input);
};

export function validateAge(dob: any) {
  let today = new Date();
  let birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  // Adjust age if birth month hasn't occurred yet this year, or if it's this month but the day hasn't happened yet
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  // Validate age
  return age;
}

export const validateFrom = (formValues: any, inputs: any) => {
  const errors: any = {};
  inputs.forEach((input: any) => {
    const { name, required } = input;
    const value = formValues[name];
    if (value === "") {
      if (!required) {
        errors[name] = false;
      } else {
        errors[name] = true;
      }
    } else {
      errors[name] = false;
    }
  });
  return errors;
};
