import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import Loader from "~/common/loader";
import NoAccessComponent from "~/common/noAccess";
import { ToastContainer, toast } from "react-toastify";
import ErrorComponent from "~/common/errorPage";
import { api } from "~/utils/api";
import { JwtToken } from "@prisma/client";
import { useRouter } from "next/router";
import Button from "~/common/buttons/filledButton";

const Tokens = (props: any) => {
  const { showActivitySection, data } = props;
  const [jwtData, setJwtData] = useState([] as JwtToken[] | undefined);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableGetTokens, setEnableGetTokens] = useState(false);
  const router = useRouter();
  const { isLoading, data: getTokenData }: any = api.tokens.getTokens.useQuery(
    { id: Number(router.query.id) },
    {
      enabled: enableGetTokens,
    }
  );

  const createToken = api.tokens.createToken.useMutation();

  useEffect(() => {
    setJwtData(getTokenData);
  }, [getTokenData]);

  useEffect(() => {
    if (router?.query?.id) {
      setEnableGetTokens(true);
    }
  }, [router?.query?.id]);

  useEffect(() => {
    document.title = "Telkom Admin";
  }, []);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await createToken.mutateAsync({
        id: Number(data?.id),
        name: data?.firstName as string,
        email: data?.email as string,
        roles: data?.roles,
        packageName: data?.packageName.join(", "),
      });
      if (response) {
        jwtData && jwtData.push(response);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        "Error occured while generating token, please try again later"
      );
    }
  };

  const handleCopyClick = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    setCopiedTokenId(id);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  return !props?.accessLevels?.canView ? (
    <>
      <div
        className={`${
          showActivitySection ? "w-[70%]" : "w-0"
        } overflow-hidden transition-all duration-500`}
      >
        <NoAccessComponent />
      </div>
    </>
  ) : !error ? (
    <>
      {isLoading || loading ? (
        <Loader />
      ) : (
        <div
          className={`${
            showActivitySection ? "w-[40%]" : "w-0"
          } overflow-hidden transition-all duration-500`}
        >
          <div className="mx-auto max-w-3xl p-4">
            {props?.accessLevels?.canCreate && (
              <Button text="Generate Token" onClick={handleClick} />
            )}

            <div className="mt-3 overflow-x-auto rounded-lg bg-white shadow">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Token</th>
                  </tr>
                </thead>
                <tbody>
                  {getTokenData?.map((item: JwtToken, key: number) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{key + 1}</td>
                      <td className="border px-4 py-2">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ marginRight: "8px" }}>
                            {item.token.substring(0, 20)}...
                          </div>
                          <FaCopy
                            className="cursor-pointer text-primary-blue"
                            onClick={() =>
                              handleCopyClick(item.token, item.id.toString())
                            }
                          >
                            Copy
                          </FaCopy>

                          {isCopied && item.id.toString() == copiedTokenId && (
                            <div className="ml-2 text-sm text-green-500">
                              Copied to clipboard!
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getTokenData?.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No Token Found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      <ErrorComponent />
    </>
  );
};

export default Tokens;
