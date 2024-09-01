import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Loader from "~/common/loader";

// eslint-disable-next-line react/display-name
const withAuth = (Component: any) => (props: any) => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);
  return status == "authenticated" ? (
    <>
      <Component {...props} />
    </>
  ) : (
    status === "loading" && <Loader />
  );
};

export default withAuth;
