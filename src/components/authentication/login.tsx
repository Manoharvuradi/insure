import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Loader from "~/common/loader";
import { alertprops } from "~/interfaces/common";
import "react-toastify/dist/ReactToastify.css"; // import Toastify CSS
import Link from "next/link";
import Button from "~/common/buttons/filledButton";
import { api } from "~/utils/api";
import {
  generatePassword,
  smsEnabledString,
  twoFAEnabledString,
  validateEmail,
  wrongPasswordString,
} from "~/utils/constants";
import { sendEmail } from "~/utils/helpers/sendEmail";
import { Email } from "aws-sdk/clients/codecommit";
import { BiShow, BiHide } from "react-icons/bi";
import SecondaryButton from "~/common/buttons/secondaryButton";
import ComponentLoader from "~/common/componentLoader";
import axios from "axios";
import { env } from "process";
import Verify2fa from "./enable2fa";
import CustomOtpInput from "~/common/form/otpInput";

export default function Login({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [email, setEmail] = useState<Email>("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [showforgotPassword, setShowforgotPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [show2FA, setShow2FA] = useState(false);
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [resendTime, setResendTime] = useState(30);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isButtonDisabled) {
      timer = setInterval(() => {
        setResendTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isButtonDisabled]);
  const VerificationOtpResponse = api.smsOtp.resendOtp.useMutation();

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoader(true);
    setButtonDisabled(true);
    setResendTime(30);
    try {
      const checkForUser = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      const currentUser = checkForUser;
      if (currentUser?.error === twoFAEnabledString) {
        setShowLogin(false);
        setShow2FA(true);
      } else if (currentUser?.error === smsEnabledString) {
        setShowLogin(false);
        setShowOTPVerify(true);
      } else if (currentUser?.error === wrongPasswordString) {
        toast.error("Invalid Credentials");
      } else if (currentUser?.error) {
        toast.error("Something went wrong");
      } else {
        toast.success("Login Successful");
      }
    } catch (error) {
      toast.error("Cannot find current user");
    } finally {
      setLoader(false);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 30000);
    }
  };
  const handleResendOtp = async () => {
    setButtonDisabled(true);
    setResendTime(30);

    setFailedAttempts(failedAttempts + 1);
    if (failedAttempts >= 5) {
      toast.error("Too many failed attempts. Please try again later");
    } else {
      try {
        const response = await VerificationOtpResponse.mutateAsync({
          user: email,
        });
        if (response) {
          toast.success("Sms sent successfully");
        } else {
          toast.error("Failed to sent sms");
        }
      } catch (err) {
        toast.error("Unable to process your request. Please try again later");
      }
    }
    setTimeout(() => {
      setButtonDisabled(false);
    }, 30000);
  };
  const handleLogin = async (token: string, type: string) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        token,
        type,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (result && !result.ok) {
        setError(true);
        setIsLoading(false);
        router.push("/");
        toast.error("Incorrect 2FA code or one-time password (OTP) ", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.success("Login successful");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Unable to process your request. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = () => {
    setEmail("");
    setShowLogin(false);
    setShowforgotPassword(true);
  };

  const handleForgotPassword = async () => {
    if (email && email.trim()) {
      setIsLoading(true);
      const checkMail = `/api/user/forgotpassword?email=${email}`;
      try {
        const emailExist = await axios({
          method: "get",
          url: checkMail,
        });
        if (emailExist) {
          toast.success("Password sent to mail successfully");
        } else {
          toast.error("Mail not found");
        }
      } catch (error) {
        toast.error("Try again later");
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <>
      <div className="flex h-screen bg-gray-200">
        <div className="flex w-1/2 items-center justify-center">
          <div>
            <Image
              src="/icons/telkomLogo.svg"
              height={100}
              width={100}
              alt="Your Brand"
              className="h-auto w-full max-w-sm"
            />
            <h2 className="mb-4 text-center text-2xl font-bold">
              Welcome to Telkom Insurance
            </h2>
            <p className="mb-8 text-center text-lg">
              Sign in to your account to continue
            </p>
          </div>
        </div>
        <div className="flex w-1/2 items-center justify-center">
          {isLoading || loader ? (
            <ComponentLoader />
          ) : (
            <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md ">
              <div>
                {showLogin && (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold">Login</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="mb-2 block font-bold text-gray-700"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={handleEmailChange}
                          className="w-full rounded-md border border-gray-400 p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="password"
                          className="mb-2 block font-bold text-gray-700"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="bi bi-show w-full rounded-md border border-gray-400 p-2"
                            required
                          />
                          <button
                            type="button"
                            onClick={toggleShowPassword}
                            className="absolute right-2 top-1/2 -translate-y-1/2 transform  focus:outline-none"
                          >
                            {showPassword ? <BiHide /> : <BiShow />}
                          </button>
                        </div>
                      </div>

                      <div className="flex  items-center justify-between">
                        <Button
                          type="submit"
                          className="mt-2 w-full rounded-md bg-blue-500 px-14 py-2 text-white"
                          text={"Login"}
                        />
                      </div>
                    </form>
                    <div className="float-right mb-4 mt-5">
                      <a
                        className="text-blue-600 underline"
                        onClick={handleForgot}
                      >
                        Forgot password
                      </a>
                    </div>
                  </div>
                )}
                {showforgotPassword && (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold">Forgot password</h2>
                    <div>
                      <div className="">
                        <label className="mb-2 block font-bold text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          placeholder="Please enter valid email ID"
                          onChange={(e) => {
                            setEmail(e.target.value);
                          }}
                          className="w-full rounded-md border border-gray-400 p-2"
                          required
                        />
                        <div className="mt-4 flex justify-between gap-2">
                          <SecondaryButton
                            text="Back"
                            onClick={() => {
                              setShowLogin(true);
                              setShowforgotPassword(false);
                              setShow2FA(false);
                            }}
                          />
                          <Button
                            onClick={handleForgotPassword}
                            disabled={!email || !validateEmail(email)}
                            text="Verify"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {showOTPVerify && (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold">
                      SMS Verification
                    </h2>
                    <CustomOtpInput
                      numberOfDigits={6}
                      onSubmit={handleLogin}
                      isAuthType={"smsOptVerification"}
                      handleBack={() => {
                        setShowOTPVerify(!showOTPVerify);
                        setShowLogin(!showLogin);
                      }}
                    />
                    <div className="float-right mb-2 mt-5">
                      {isButtonDisabled ? (
                        `Resend OTP in ${resendTime} seconds`
                      ) : (
                        <a
                          className={`text-blue-600 underline ${
                            failedAttempts >= 3
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          onClick={handleResendOtp}
                        >
                          Resend OTP
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {show2FA && (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold">
                      Two Factor Authentication
                    </h2>
                    <CustomOtpInput
                      numberOfDigits={6}
                      onSubmit={handleLogin}
                      isAuthType={"2FAVerification"}
                      handleBack={() => {
                        setShow2FA(!show2FA);
                        setShowLogin(!showLogin);
                      }}
                    />
                    <div className="float-right mb-2 mt-5">
                      <a
                        className={`text-blue-600 underline ${
                          failedAttempts >= 3
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                        onClick={() => {
                          handleResendOtp();
                          setShow2FA(!show2FA);
                          setShowOTPVerify(true);
                        }}
                      >
                        Send otp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
