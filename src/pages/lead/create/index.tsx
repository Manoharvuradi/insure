import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import NoAccessComponent from "~/common/noAccess";
import DefaultLayout from "~/components/defaultLayout";
import CreateLead from "~/components/lead/create";
import CreatePolicy from "~/components/policy/create";
import withAuth from "~/pages/api/auth/withAuth";
import { getMultipleAccessRoles } from "~/utils/helpers";

function createLead(props: any) {
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  return currentRoleAccessLevels?.Leads?.canCreate ||
    currentRoleAccessLevels?.Leads?.canCreate ? (
    <div>
      <div className="m-4">
        <h1 className="p-2 text-4xl">Create New Prospects</h1>
        <CreateLead
          accessLevels={props?.accessLevels}
          userType={props?.userType}
        />
      </div>
    </div>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}
export default withAuth(DefaultLayout(createLead));
