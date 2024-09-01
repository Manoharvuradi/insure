import { object, string, TypeOf } from "zod";
import { useEffect, useState } from "react";
// import { useForm, SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { LoadingButton } from "../components/LoadingButton";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
// import { authApi } from "../api/authApi";
import QRCode from "qrcode";
import { api } from "~/utils/api";
import ComponentLoader from "~/common/componentLoader";
import { IEvent } from "~/interfaces/common/form";
import Button from "~/common/buttons/filledButton";
import Modal from "~/common/Modal";
import SecondaryButton from "~/common/buttons/secondaryButton";
import { signOut, useSession } from "next-auth/react";
import Loader from "~/common/loader";

const Verify2fa = ({
  user_id,
  closeModel,
}: {
  user_id: number;
  closeModel: any;
}) => {
  const enable2FA = api.twofa.enable2FA.useMutation();
  const verify2FA = api.twofa.verify2FA.useMutation();

  const [secret, setSecret] = useState({
    base32: "",
    otpauth_url: "",
  });
  const [qrcodeUrl, setqrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  const generateQrCode = async () => {
    try {
      setIsLoading(true);
      const response: any = await enable2FA.mutateAsync({
        id: user_id,
      });

      if (response?.base32) {
        setSecret({
          base32: response.base32,
          otpauth_url: response.otpauth_url,
        });
      } else {
        toast.error("Cannot Generate QR code");
      }
    } catch (error: any) {
      toast.error("Cannot Generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const verify2fa = async (token: string) => {
    try {
      setLoader(true);
      const response: any = await verify2FA.mutateAsync({
        token: token,
        id: user_id,
        base32: secret.base32,
      });
      if (response.otp_verified) {
        toast.success("2FA verified successfully, signing out");
        closeModel();
        setTimeout(() => {
          signOut();
        }, 2000);
      } else {
        toast.error("2FA verification failed");
      }
    } catch (error: any) {
      toast.error("Cannot verify Token");
    } finally {
      setLoader(false);
    }
  };

  const handleToken = (e: IEvent) => {
    const { name, value } = e.target;
    setToken(value);
  };
  useEffect(() => {
    generateQrCode();
  }, []);

  useEffect(() => {
    if (secret.otpauth_url) {
      QRCode.toDataURL(secret.otpauth_url).then(setqrCodeUrl);
    }
  }, [secret?.otpauth_url]);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <Modal
          onCloseClick={closeModel}
          showButtons={true}
          onSaveClick={() => {
            verify2fa(token);
          }}
          okButtonTitle="Verify & Activate"
          title="Enable 2FA"
        >
          <div className="relative left-1/2 h-full w-full max-w-xl -translate-x-1/2 p-4 md:h-auto">
            <div className="relative bg-white">
              <h3>Two-Factor Authentication (2FA)</h3>
              <div className="space-y-4 p-6">
                <h4>Configuring Google Authenticator or Authy</h4>
                <div>
                  <li>
                    Install Google Authenticator (IOS - Android) or Authy (IOS -
                    Android).
                  </li>
                  <li>In the authenticator app, select "+" icon.</li>
                  <li>
                    Select "Scan a barcode (or QR code)" and use the phone's
                    camera to scan this barcode.
                  </li>
                </div>
                <div>
                  <h4>Scan QR Code</h4>
                  <div className="flex justify-center">
                    {isLoading ? (
                      <ComponentLoader />
                    ) : (
                      <img
                        className="block h-64 w-64 object-contain"
                        src={qrcodeUrl}
                        alt="qrcode url"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <h4>Or Enter Code Into Your App</h4>
                  <p className="text-sm">
                    SecretKey: {secret?.base32} (Base32 encoded)
                  </p>
                </div>
                <div>
                  <h4>Verify Code</h4>
                  <p className="text-sm">
                    For changing the setting, please verify the authentication
                    code:
                  </p>
                </div>
                <input
                  required
                  name="Token"
                  type="text"
                  placeholder="Authentication Code"
                  onChange={handleToken}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Verify2fa;
