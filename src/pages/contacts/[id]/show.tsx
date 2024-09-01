import ContactsView from "~/components/contacts";
import withAuth from "~/pages/api/auth/withAuth";
export default withAuth(ContactsView);
