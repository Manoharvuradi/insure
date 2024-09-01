import React, { useEffect, useState } from "react";
import SidebarNavigation from "./sidebarNavigation";
import { signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { ToastContainer, toast } from "react-toastify";
import Loader from "~/common/loader";
import ErrorComponent from "~/common/errorPage";
const DefaultLayout = (Component: any) => {
  function Layout(props: any) {
    const session = useSession();
    const currentUser = session?.data?.user;
    let currentUserDetails;
    const { isLoading, data, error } = api.accessLevels.getAll.useQuery();
    let userType;
    if (currentUser && currentUser.id) {
      const { error, data } = api.credentialUser.show.useQuery(
        currentUser.id.toString()
      );
      if (data) {
        userType = data.agentRoletype;
        currentUserDetails = data;
      }
      if (error) {
        signOut();
      }
    }
    return (
      <>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorComponent />
        ) : (
          <>
            <SidebarNavigation accessLevels={data} userType={userType} />
            <div className="relative left-[85px] h-screen w-[calc(100vw-85px)]  overflow-y-auto scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
              <Component
                {...props}
                accessLevels={data}
                userType={userType}
                currentUserDetails={currentUserDetails}
              />
            </div>
          </>
        )}
      </>
    );
  }
  return Layout;
};
export default DefaultLayout;
