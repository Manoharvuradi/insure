import React from "react";
import DefaultLayout from "~/components/defaultLayout";
import CreateComplaintComponent from "~/components/complaint/create";
import withAuth from "../api/auth/withAuth";

function ComplaintComponent(props: any) {
  return (
    <div>
      <div className="m-4">
        <h1 className="p-2 text-4xl">Enter complaint details</h1>
        <CreateComplaintComponent accessLevels={props.accessLevels} />
      </div>
    </div>
  );
}
export default withAuth(DefaultLayout(ComplaintComponent));
