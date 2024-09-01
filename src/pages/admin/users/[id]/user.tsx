import UsersView from "~/components/admin";
import withAuth from "~/pages/api/auth/withAuth";
export default withAuth(UsersView);
