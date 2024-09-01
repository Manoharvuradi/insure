import { UserRole } from "@prisma/client";

type Feature =
  | "Admin"
  | "Leads"
  | "Application"
  | "Policy"
  | "Claim"
  | "Complaints"
  | "Payments";

export interface AccessLevelsInput {
  role?: UserRole;
  canView?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export interface TransformedAccessLevel {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface TransformedAccessLevelObject {
  [role: string]: {
    [feature in Feature]: TransformedAccessLevel;
  };
}
