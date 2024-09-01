import { IBeneficiary } from "../policy";

export interface ISession {
  id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface IToken {
  id: string;
  token: string;
  expiry: string;
}

export interface IColumn {
  key: string | string[] | any;
  label: string;
}
export const extendedFamilyMemberLimit = 14;

enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum PolicyStatus {
  ACTIVE = "ACTIVE",
}

enum ClaimStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  FINALIZED = "FINALIZED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
}

enum ClaimApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REPUDIATED = "REPUDIATED",
}

enum CoverageOptions {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
}

enum ExtendedFamilyMembers {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  SISTER = "SISTER",
  BROTHER = "BROTHER",
}

enum PremiumFrequency {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

enum Type {
  INDIVIDUAL = "INDIVIDUAL",
}

enum PackageName {
  EMPLOYEE_FUNERAL_INSURANCE = "EMPLOYEE_FUNERAL_INSURANCE",
}

enum SchemeType {
  INDIVIDUAL = "INDIVIDUAL",
  GROUP = "GROUP",
}

enum IdentificationType {
  ID = "ID",
  PASSPORT = "PASSPORT",
}
export type Status = "success" | "error" | "warning";

export interface alertprops {
  status: string;
  message: string;
  open: boolean;
  setOpen: any;
}
export interface IAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  user?: IUser;
  credentialsUser?: ICredentialsUser;
  cUserId?: string;
}

export interface IUserSession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user?: IUser;
  credentialsUser?: ICredentialsUser;
  cUserId?: string;
}

export interface IUser {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  accounts?: IAccount[];
  sessions?: IUserSession[];
}

export interface ICredentialsUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  accounts?: IAccount[];
  sessions?: IUserSession[];
}

export interface VerificationToken {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
}

export interface IJwtToken {
  id: string;
  token: string;
  expiry?: string;
}

export interface IQuoteMember {
  firstName?: string;
  lastName?: string;
  email?: string;
  citizenshipId?: string;
  age: number;
  naturalDeathAmount?: number;
  accidentalDeathAmount?: number;
  premiumAmount?: number;
  relation?: string;
}

export interface IClaimant {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
}

export interface IComplainant {
  complainantFirstName?: string;
  complainantLastName?: string;
  complainantEmail: string;
  reason?: string;
  complainantMobileNumber?: string;
}

export interface IMember {
  minAge: number;
  maxAge: number;
  coverageAmount: string;
  premiumAmount: string;
  premiumFrequency: string;
}

export interface Identification {
  type?: string;
  country?: string;
  number?: string;
}

export interface IPaymentMethod {
  isPrimary?: boolean;
  collectionType: string;
  accountHolder: string;
  bank: string;
  branchCode: string;
  accountNumber: BigInt;
  accountType: string;
  externalReference?: string;
}

export interface IPolicyholder {
  id: string;
  type?: string;
  firstName?: string;
  initial?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: string;
  email: string;
  phone?: string;
  phoneOther?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  suburb?: string;
  city?: string;
  country?: string;
  areaCode?: string;
  appData?: Record<string, unknown>;
  identification: Identification[];
  paymentMethods: IPaymentMethod[];
  citizenshipId: string;
  salaryReferenceNo?: string;
  isArchived?: boolean;
  applications: IApplication[];
  policies: IPolicy[];
  claims: IClaim[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IApplication {
  id: string;
  policyholder: IPolicyholder;
  beneficiaries: IBeneficiary[];
  applicationData: any;
  members: IMember[];
  coverageOption: string;
  packageName: string;
  schemeType: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPolicy {
  id: string;
  policyholder: IPolicyholder;
  members: IQuoteMember[];
  premiumAmount: number;
  premiumFrequency: string;
  coverageAmount: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  policyNumber?: number;
}

export interface IClaim {
  id: string;
  policy: IPolicy;
  claimant: IClaimant;
  beneficiaries: IBeneficiary[];
  claimedAmount: number;
  status: string;
  approvalStatus: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IComplaint {
  id: string;
  policy: IPolicy;
  claimant: IComplainant;
  status: string;
  approvalStatus: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStep {
  name: string;
  description: string;
  href: string;
  status: string;
  component: any;
}

export interface ISafeParseResult {
  data?: any;
  success?: boolean;
  error?: any;
}

export interface IUploadFile {
  name: string;
  type: string;
  fileUrl: string;
  size: number;
}

export interface IFile {
  applicationIds?: null;
  createdAt?: string;
  id?: string;
  fileUrl?: string;
  isArchived?: boolean;
  policyIds?: string;
  updatedAt?: string;
}

export interface IFilter {
  id: string;
  name: string;
  options: IOptions[];
}

export interface IOptions {
  value: string;
  label: string;
}

export interface IUserColumn {
  key: string;
  label: string;
}

export interface IEmployeeDataColumn {
  key: string;
  label: string;
}
export interface IVehicleDataColumn {
  key: string;
  label: string;
}

export type ApiUrl =
  | "user"
  | "policyholder"
  | "application"
  | "policy"
  | "claim"
  | "complaint"
  | "payment"
  | "upload"
  | "reports";
export type funeralAPIUrl = "quotation" | "twoFA";
export type APIMethod = "GET" | "POST" | "DELETE" | "PUT";
export interface IApiUrls {
  user: string;
  policyholder: string;
  application: string;
  policy: string;
  claim: string;
  complaint: string;
  payments: string;
  upload: string;
}

export interface ISearchParams {
  pageSize: number;
  offset: number;
  filter: string;
  search: [];
  sort: string;
  packageName?: string;
  companyId?: number;
}
export interface IQueryOptions {
  take: number;
  skip: number;
  where?: any;
  orderBy?: any;
  include?: any;
}
export interface ISearchKeys {
  filter?: string;
  packageName?: string;
  search?: string[];
}

export interface packageNameoptions {
  label: string;
  value: string;
}

export interface IShowDetails {
  spouse: boolean;
  children: boolean;
  extendedFamily: boolean;
  beneficiaries: boolean;
  claimant: boolean;
  deceasedDetails: boolean;
  incidentDetails: boolean;
  doctorDetails: boolean;
  checkList: boolean;
  documents: boolean;
  deviceIncidentDetails?: boolean | any;
  deviceLostDetails: boolean | any;
  creditLifeMotorDetails: boolean | any;
  creditLifeDeviceIncidentDetails?: boolean | any;
}
