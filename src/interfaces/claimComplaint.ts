export interface IClaimant {}

export interface IClaimantFormValues {
  firstName: string;
  lastName: string;
  email: string;
  relation: string;
  phone: string;
  disable?: boolean;
}

export interface IComplaintFormValues {
  complainantFirstName: string;
  complainantLastName: string;
  complainantEmail: string;
  complainantMobileNumber: string;
  reason: string;
}

const resources = "claim" || "complaint";

export interface IClaimComplaintStepComponentProps {
  claimantFormValues: IClaimantFormValues;
  complaintFormValues: IComplaintFormValues;

  claimantFormErrors: IClaimantFormValues;
  complaintFormErrors: IComplaintFormValues;

  setClaimFormErrors: (value: any) => void;
  setComplaintFormErrors: (value: any) => void;

  setClaimFormValues: (value: any) => void;
  setComplaintFormValues: (value: any) => void;

  handleFormInputChange: (value: any) => void;
  handlePhoneNumber: (value: any) => void;
  handlePhoneNumberChange: (value: any) => void;
  index: number;
  onClickStep: (value: number) => void;
  resource: typeof resources;
  disable: boolean;
  setDisable: (value: any) => void;
}

export interface IDeceased {
  deceasedIndividual: string | "";
  firstName?: string | "";
  lastName?: string | "";
  said?: string | "";
}

export interface IIncident {
  claimCreatedDate?: Date;
  dateOfDeath?: Date;
  funeralClaimType?: string;
  cause?: string;
  policeCaseNumber?: string;
  reportingPoliceStation?: string;
  referenceNumber?: string;
  incidentDescription?: string;
}

export interface IDoctors {
  doctorName?: string;
  doctorContactNumber?: string;
  doctoreAddress?: string;
}
