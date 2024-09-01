import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import NoAccessComponent from "~/common/noAccess";
import DefaultLayout from "~/components/defaultLayout";
import CreatePolicy from "~/components/policy/create";
import withAuth from "~/pages/api/auth/withAuth";
import { getMultipleAccessRoles } from "~/utils/helpers";

function createPolicy(props: any) {
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  return currentRoleAccessLevels?.Policy?.canCreate ||
    currentRoleAccessLevels?.Application?.canCreate ? (
    <div>
      <div className="m-4">
        <h1 className="p-2 text-4xl">Create New Policy</h1>
        <CreatePolicy accessLevels={props.accessLevels} />
      </div>
    </div>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}
export default withAuth(DefaultLayout(createPolicy));
