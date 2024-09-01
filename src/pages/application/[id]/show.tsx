import ApplicationView from "~/components/application";
import withAuth from "~/pages/api/auth/withAuth";
export default withAuth(ApplicationView);
