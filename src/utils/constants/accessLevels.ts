import { AccessLevels } from "@prisma/client";

type TransformedAccessLevel = {
  [role: string]: {
    [features: string]: {
      canView: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };
  };
};

export function transformArrayToObject(
  array: AccessLevels[]
): TransformedAccessLevel {
  const transformedObject: any = {};

  for (const item of array) {
    const { role, features, canView, canCreate, canUpdate, canDelete } = item;

    transformedObject[role] ??= {};
    transformedObject[role][features] = {
      canView,
      canCreate,
      canUpdate,
      canDelete,
    };
  }

  return transformedObject;
}
