import withAuth from "../api/auth/withAuth";
import DefaultLayout from "~/components/defaultLayout";
import Dashboard from "~/components/dashboard";

const dashboard = (props: any) => {
  return (
    <>
      <Dashboard accessLevels={props.accessLevels} userType={props.userType} />
    </>
  );
};

export default withAuth(DefaultLayout(dashboard));
