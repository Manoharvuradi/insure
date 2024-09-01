import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Loader from "~/common/loader";

// eslint-disable-next-line react/display-name
const withUserAuth = (Component: any) => (props: any) => {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.status == "authenticated") {
      router.push("/dashboard");
    }
  }, [session]);

  return (
    session.status == "unauthenticated" && (
      <>
        <Component {...props} />
      </>
    )
  );
};

export default withUserAuth;
