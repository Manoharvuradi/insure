import { UserRole } from "@prisma/client";
import { packageName } from "~/utils/constants";

export interface IUserFormValues {
  newUser: INewUser;
}

export interface INewUser {
  roles: UserRole[];
  lastName: string | undefined;
  firstName: string | undefined;
  email: any;
  confirmPassword: any;
  phone: string;
  password: any;
  packageName: any;
  company: number;
}

const resources = "user";
export interface IUserStepComponentForm {
  setFormValues: (value: any) => void;
  formValues: IUserFormValues;
  handleFormInputChange: (value: any) => void;
  handlePhoneChange: (value: string) => void;
  formErrors: IUserFormValues;
  index: number;
  setFormErrors: (value: any) => void;
  onClickStep: (value: number) => void;
  resource: typeof resources;
  disable: boolean;
}

interface IPackageNames {
  label: string;
  type: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}
