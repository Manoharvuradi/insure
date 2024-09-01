import EmployeeDataView from "~/components/employeeData/index";
import withAuth from "~/pages/api/auth/withAuth";
export default withAuth(EmployeeDataView);
