import React from "react";
import DefaultLayout from "~/components/defaultLayout";
import withAuth from "../api/auth/withAuth";
import QucikQuoteComponent from "~/components/quickQuoteComponent";
import { getMultipleAccessRoles } from "~/utils/helpers";
import { UserRole } from "@prisma/client";
import NoAccessComponent from "~/common/noAccess";
import { useSession } from "next-auth/react";

function QuickQuote(props: any) {
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  return currentRoleAccessLevels?.Policy?.canCreate ||
    currentRoleAccessLevels?.Application?.canCreate ? (
    <div>
      <div className="m-4">
        <QucikQuoteComponent accessLevels={props.accessLevels} />
      </div>
    </div>
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
}

export default withAuth(DefaultLayout(QuickQuote));
