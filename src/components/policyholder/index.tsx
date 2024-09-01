import React, { useEffect, useState } from "react";
import DescriptionList from "~/common/showDetails/tableView";
import DefaultLayout from "../defaultLayout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import TabsBar from "~/common/tabs";
import { policyholderTabs, tabs } from "~/utils/constants";
import Loader from "~/common/loader";
import { ToastContainer, toast } from "react-toastify";
import { IApplication, IPaymentMethod, IPolicy } from "~/interfaces/common";
import Image from "next/image";
import ListTable from "~/common/showDetails/fieldView";

const PolicyholderView = () => {
  const [activeTab, setActiveTab] = useState("Policyholder");
  const [showDetails, setShowDetails] = useState({ payments: false });
  const router = useRouter();
  let policyholderId = router.query.id as string;
  const { isLoading, data, error }: any =
    api.policyholder.show.useQuery(policyholderId);
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch data.", {
        toastId: "fetchError",
        autoClose: 2000,
      });
    }
  }, [error]);
  useEffect(() => {
    const selectedTab: any = document.getElementById(`${activeTab}`);
    selectedTab?.scrollIntoView({
      block: "center",
      behavior: "smooth",
      inline: "center",
    });
  }, [activeTab]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between border-b">
            <TabsBar
              tabs={policyholderTabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleTabChange={handleTabChange}
            />
          </div>
          <div className="flex h-[calc(100vh-65px)] flex-col gap-5 overflow-auto bg-[#f3f7fa] p-4 scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
            <div className=" rounded-[10px] bg-white p-4">
              <div
                className="flex items-center justify-between"
                id="Policyholder"
              >
                <h3 className="text-xl font-bold leading-9 text-dark-grey">
                  Policyholder
                </h3>
              </div>
              {data ? (
                <DescriptionList data={data} />
              ) : (
                <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                  No data
                </p>
              )}
            </div>
            <div className=" rounded-[10px] bg-white p-4">
              <div
                className="flex items-center justify-between"
                id="Applications"
              >
                <h3 className="text-xl font-bold leading-9 text-dark-grey">
                  Applications
                </h3>
              </div>
              {data?.applications && data?.applications?.length > 0 ? (
                data.applications.map((item: IApplication, i: number) => {
                  return (
                    <div className="flex gap-3">
                      <span className="font-semibold">{i + 1}.</span>
                      <div
                        className=" text-sm leading-6  text-primary-blue underline hover:cursor-pointer"
                        onClick={() => {
                          router.push(`/application/${item.id}/show`);
                        }}
                      >
                        {item.id}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                  No data
                </p>
              )}
            </div>
            <div className=" rounded-[10px] bg-white p-4">
              <div className="flex items-center justify-between" id="Policies">
                <h3 className="text-xl font-bold leading-9 text-dark-grey">
                  Policies
                </h3>
              </div>
              {data?.policies && data?.policies?.length > 0 ? (
                data.policies.map((item: IPolicy, i: number) => {
                  return (
                    <div className="flex gap-3">
                      <span className="font-semibold">{i + 1}.</span>
                      <div
                        className=" text-sm leading-6  text-primary-blue underline hover:cursor-pointer"
                        onClick={() => {
                          router.push(`/policy/${item.id}/show`);
                        }}
                      >
                        {item.policyNumber}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                  No data
                </p>
              )}
            </div>

            <div className=" rounded-[10px] bg-white p-4">
              <div
                className="flex items-center justify-between"
                id="PaymentMethods"
              >
                <div className="flex w-full justify-between">
                  <h3 className="text-xl font-bold leading-9 text-dark-grey">
                    Payment Methods
                  </h3>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setShowDetails({
                        ...showDetails,
                        payments: !showDetails.payments,
                      })
                    }
                  >
                    <Image
                      src="/icons/DropdownIcon.svg"
                      height={24}
                      width={24}
                      alt="drop down"
                      className={`mr-4 ${
                        showDetails.payments ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              {showDetails.payments ? (
                <div>
                  {data?.paymentMethods && data?.paymentMethods?.length > 0 ? (
                    data.paymentMethods.map((item: any, i: number) => {
                      const listObject = item;
                      if (listObject?.policyId) {
                        listObject.PolicyId = listObject.policyId;
                        delete listObject.policyId;
                      }
                      return (
                        <div
                          className="mt-2 flex flex-col gap-3 border-b border-gray-300 py-2"
                          key={i}
                        >
                          <span className="font-semibold">
                            Payment method {i + 1}:
                          </span>
                          <DescriptionList data={listObject} />
                        </div>
                      );
                    })
                  ) : (
                    <p className="flex justify-center whitespace-nowrap py-4 text-sm text-gray-500">
                      No data
                    </p>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DefaultLayout(PolicyholderView);
