import React from "react";
import CreateUserComponent from "~/components/admin/create";
import DefaultLayout from "~/components/defaultLayout";
import withAuth from "~/pages/api/auth/withAuth";

function CreateNewUser(props: any) {
  return (
    <div>
      <div className="m-4">
        <h1 className="p-2 text-4xl">Create New User</h1>
        <CreateUserComponent accessLevels={props.accessLevels} />
      </div>
    </div>
  );
}

export default withAuth(DefaultLayout(CreateNewUser));
