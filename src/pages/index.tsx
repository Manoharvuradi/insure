import Login from "~/components/authentication/login";
import withUserAuth from "./api/auth/withUserAuth";

export default withUserAuth(Login);
