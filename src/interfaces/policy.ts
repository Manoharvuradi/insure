import { DeviceCatalog, PackageName } from "@prisma/client";
import { IApplication } from "./common";

export interface IPolicyMember {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  citizenshipId: string;
}

export interface IBillingDetails {
  id: string;
  nextBillingDate: any;
  nextBillingAmount: number;
  balance: number;
}

export type policyStepType = {
  name: string;
  description: string;
  href: string;
  needId: boolean;
  fieldsFilled: boolean;
  fields: string[];
  status: string;
  component: any;
};

export interface IFormValues {
  package: string;
  coverageOption: string;
  age: Date;
  includeSpouse: boolean;
  includeChildren: boolean;
  includeExtendedFamily: boolean;
  policyholder: IPolicyHolder;
  mainMember: IMember;
  spouse: IMember[];
  children: IMember[];
  beneficiaries: IBeneficiary[];
  extendedFamily: IMember[];
  paymentMethod: IPaymentMethod[];
  policyholderExist: boolean;
  billingFrequency: string;
  startDate: any;
  sumAssured: number;
  monthlyPremium: number;
  billingDay: string;
  application: IApplication;
  category: string;
  withFreeBenefit: boolean;
  prevSAID: string;
}

export interface IPolicyHolder {
  id: any;
  citizenshipId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone: string;
  phoneOther: string;
  streetAddress1: string;
  streetAddress2?: string;
  suburb?: string;
  city: string;
  country: string;
  areaCode: string;
  salaryRefNumber: string;
  gender: string;
  dateOfBirth?: Date;
  paymentMethods: IPaymentMethod[];
}

export interface IMember {
  firstName?: string;
  lastName?: string;
  age?: number;
  dateOfBirth?: Date;
  email?: string;
  citizenshipId?: string;
  said?: string;
  enableIsStudying?: boolean;
  enableIsDisabled?: boolean;
  enableStillBorn?: boolean;
  isStudying?: boolean;
  isDisabled?: boolean;
  isStillBorn?: boolean;
  naturalDeathAmount?: number;
  accidentalDeathAmount?: number;
  telkomFreeBenefitAmount?: number;
  premiumAmount?: number;
  relation?: string;
  coverageOption?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBeneficiary {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  percentage: string;
  relation: string;
  identificationCountry?: string;
  said?: string;
  passportNumber?: string;
  gender: string;
  dateOfBirth: Date;
  phone: string;
  trustNumber?: string;
}

export interface IPaymentMethod {
  isPrimary: boolean;
  accountNumber: string;
  accountHolder: string;
  bank: string;
  accountType: string;
  paymentMethodType: string;
}
export interface IStepComponentProps {
  setFormValues: (value: any) => void;
  formValues: IFormValues;
  handleFormInputChange: (value: any) => void;
  formErrors: IFormValues;
  index?: number | any;
  setFormErrors: (value: any) => void;
  onClickStep?: (value: number) => void;
  contactData?: any;
}

export interface Identification {
  type: string;
  country: string;
  number: string;
}

export interface IQusurecollectionData {
  RecordId: number;
  branchCode: string;
  accountNumber: string;
  amount: number;
  accountName: string;
  userReference: string;
  actionDate: string;
  bankAccountType: number;
}

export interface ITelkomCollectionData {
  amount?: number;
  freeBenefit?: number;
  balance?: number;
  policyNumber: string;
  actionDate?: string;
  salaryReference?: string;
  packageName?: PackageName;
  startDate?: string;
  createdDate?: string;
}

export interface IFormValuesDevices {
  applicationData: IDeviceApplicationData;
  startDate: string;
  billingFrequency: string;
  billingDay: string;
  deviceType: string;
  devicePrice: number;
  isRecentPurchase: boolean;
  monthlyPremium: number;
  sumAssured: number;
  mainMember: any;
  package: string;
  policyholder: IPolicyHolder;
  beneficiaries: IBeneficiary[];
  paymentMethod: IPaymentMethod[];
  policyholderExist: boolean;
  application: IApplication;
  deviceCatalog: DeviceCatalog[];
}

export interface IDeviceStepComponentProps {
  formValues: IFormValuesDevices;
  setFormValues: (value: any) => void;
  handleFormInputChange: (value: any) => void;
  formErrors: IFormValuesDevices;
  index?: number | any;
  setFormErrors: (value: any) => void;
  onClickStep?: (value: number) => void;
}

export interface IDeviceApplicationData {
  devicePremium: number;
  devicePrice: number;
  deviceType: string;
  isRecentPurchase: boolean;
  packageName: any;
  deviceUniqueNumber: string;
  deviceBrand: string;
  deviceModel?: string;
  deviceStorage: string;
  deviceModelColor?: string;
}

export interface IRetailDeviceStepComponentProps {
  formValues: IRetailFormValuesDevices;
  setFormValues: (value: any) => void;
  handleFormInputChange: (value: any) => void;
  formErrors: IRetailFormValuesDevices;
  index?: number | any;
  setFormErrors: (value: any) => void;
  onClickStep?: (value: number) => void;
  userType?: any;
  contactData?: any;
}

export interface IRetailFormValuesDevices {
  phone: any;
  deviceUniqueNumber: string;
  deviceFinancedBy: string;
  outstandingSettlementBalance: number;
  additionalPercentageInsured: string;
  applicationData: IRetailDeviceApplicationData;
  startDate: string;
  billingFrequency: string;
  billingDay: string;
  deviceType: string;
  devicePrice: number;
  isRecentPurchase: boolean;
  monthlyPremium: number;
  totalPremium: number;
  sumAssured: number;
  mainMember: any;
  package: string;
  policyholder: IPolicyHolder;
  beneficiaries: IBeneficiary[];
  creditLifeBeneficiaries: ICreditLifeBenficiary[];
  paymentMethod: IPaymentMethod[];
  policyholderExist: boolean;
  application: IApplication;
  deviceCatalog: DeviceCatalog[];
  deviceApplicationId: string;
  creditLifeApplicationId: string;
  creditLifeOpt: boolean;
  confirmCreditLife: boolean;
  category: string;
  policyHolderFirstName: string;
  policyHolderLastName: string;
  imeiNumber: string;
  dateOfPurchase: string;
  typeOfDevice: string;
  model: string;
}

export interface IRetailDeviceApplicationData {
  creditLifeData: {
    packageName: any;
    deviceUniqueNumber: string;
    deviceFinancedBy: string;
    additionalPercentageInsured: string;
    outstandingSettlementBalance: number;
    totalPremium: string;
    sumAssured: number;
  };
  deviceData: {
    devicePremium: number;
    devicePrice: number;
    deviceType: string;
    isRecentPurchase: boolean;
    packageName: any;
    deviceUniqueNumber: string;
    deviceBrand: string;
    deviceModel?: string;
    deviceStorage: string;
    deviceModelColor?: string;
    totalPremium: number;
    sumAssured: number;
    deviceDetails: string;
  };
  totalPremium: number;
}

export interface ICreditLifeBenficiary {
  length: number;
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  percentage: string;
  relation: string;
  identificationCountry?: string;
  said?: string;
  passportNumber?: string;
  gender: string;
  dateOfBirth: Date;
  phone: string;
  trustNumber?: string;
}
