import React from "react";
import CreateCallcenterForm from "~/components/callcenters/create";
import DefaultLayout from "~/components/defaultLayout";
import withAuth from "~/pages/api/auth/withAuth";

function createCallCenter(props: any) {
  return (
    <div>
      <div className="m-4">
        <CreateCallcenterForm />
      </div>
    </div>
  );
}
export default withAuth(DefaultLayout(createCallCenter));
