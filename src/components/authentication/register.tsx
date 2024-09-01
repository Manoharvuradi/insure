import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { ToastContainer, toast } from "react-toastify";
import { registerFormInputs } from "~/utils/constants";
import InputField from "~/common/form/input";
import Button from "~/common/buttons/filledButton";
import Loader from "~/common/loader";
import { IEvent } from "~/interfaces/common/form";

interface initialValues {
  firstName: string;
  lastName: string;
  role:
    | "AGENT"
    | "CLAIM_ASSESSOR"
    | "CLAIM_SUPERVISOR"
    | "DEVELOPER"
    | "POLICY_ADMINISTRATOR"
    | "SUPER_ADMIN";
  email: string;
  password: string;
  confirmPassword: string;
}
const RegisterPage = () => {
  const [user, setUser] = useState({} as initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const registeredUser = api.credentialUser.create.useMutation();

  const handleFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!user.email || !user.password) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await registeredUser.mutateAsync({
        firstName: user.firstName,
        lastName: user.lastName,
        // roles: user.role,
        email: user.email,
        password: user.password,
      });

      if (result) {
        setIsLoading(false);
        router.push("/api/auth/signin");
      } else {
        setIsLoading(false);
        toast.error("Invalid details", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: false,
        });
      }
    } catch (e) {
      toast.error("Invalid details", {
        position: toast.POSITION.TOP_RIGHT,
        // autoClose: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
              <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Register your account
                </h2>
              </div>
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {registerFormInputs.map((input, index) => (
                    <InputField
                      key={"employee" + index}
                      input={input}
                      handleChange={handleFormInputChange}
                      formValues={user}
                      formErrors={{}}
                    />
                  ))}
                </div>
                <div className="my-2">
                  <Button text={"Submit"} type="submit" />
                </div>
              </form>
              <div className="mt-4 text-center text-sm">
                <span className="mr-4">already registered?</span>

                <Button text="Login" onClick={() => void signIn()} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default RegisterPage;
