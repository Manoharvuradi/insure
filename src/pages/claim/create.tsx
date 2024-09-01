import React from "react";
import DefaultLayout from "~/components/defaultLayout";
import CreateClaimComponent from "~/components/claim/create";
import withAuth from "../api/auth/withAuth";

function ClaimComponent(props: any) {
  return (
    <div>
      <div className="m-4">
        <h1 className="p-2 text-4xl">Create New Claim</h1>
        <CreateClaimComponent accessLevels={props.accessLevels} />
      </div>
    </div>
  );
}
export default withAuth(DefaultLayout(ClaimComponent));
