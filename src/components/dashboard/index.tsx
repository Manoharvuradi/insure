import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { PackageName, UserRole } from "@prisma/client";
import Verify2fa from "../authentication/enable2fa";
import {
  dashboardFilters,
  dateConversion,
  getMultipleAccessRoles,
  removeUnderScores,
} from "~/utils/helpers";
import { api } from "~/utils/api";
import CountUp from "react-countup";
import { Chart } from "react-google-charts";
import { packageName } from "~/utils/constants";
import { roleValues } from "~/utils/constants/user";
import TabsBar from "~/common/tabs";
import ComponentLoader from "~/common/componentLoader";
import { env } from "~/env.mjs";
import Filter from "~/common/filter";
import Modal from "~/common/Modal";
import Button from "~/common/buttons/filledButton";
import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import Loader from "~/common/loader";
import { toast } from "react-toastify";
interface QueryParams {
  pageSize?: string | undefined;
  offset?: string | undefined;
  filter?: string | undefined;
  search?: string | undefined;
  sort?: string | undefined;
  package?: string | undefined;
  startDate?: Date | undefined;
  filterParams?: string | undefined;
}
import AgentPerformance from "../callcenters/agentPerformance";

const Dashboard = (props: any) => {
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const itemsPerPage = 10;
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [searchParams, setSearchParams] = useState("");
  const {
    isLoading: agentListLoading,
    data: agentListData,
    error: agentListError,
    refetch: dataRefetch = () => {},
  } = api.callCenter.agentList.useQuery({
    id: Number(session.data?.user.id),
    pageSize: itemsPerPage.toString(),
    offset: currentOffeset.toString(),
    search: searchParams,
  });
  const [accessLevels, setAccessLevels] = useState({
    applications: false,
    policies: false,
    claims: false,
  });
  const [selectedPackageName, setSelectedPackageName] =
    useState("Funeral Insurance");
  const [chartData, setChartData] = useState({
    application: [],
    ploicy: [],
    claim: [],
    lead: [],
  } as any);
  const [countData, setCountData] = useState({
    application: 0,
    policy: 0,
    claim: 0,
  } as any);
  const [leadsData, setLeadsData] = useState({
    leads: 0,
  } as any);
  const [currentTab, setCurrentTab] = useState(
    session?.data?.user?.roles?.includes("AGENT") ? "lead" : "application"
  );
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [apidata, setapiData] = useState({} as any);
  const [flag, setFlag] = useState(false);
  const [filterOptions, setFilterOptions] = useState([] as any);
  const [totalCountData, setTotalCountData] = useState({
    application: 0,
    policy: 0,
    claim: 0,
  } as any);
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [filParams, setFilParams] = useState("");
  const [filterParams, setFilterParams] = useState("");
  const filParamsString = session?.data?.user?.packageName
    ? session?.data?.user?.packageName?.join(",")
    : "";
  const [selectedFilterOptionsCount, setSelectedFilterOptionsCount] =
    useState(0);
  const {
    isLoading,
    data: APIdata,
    error,
    refetch,
    isFetching,
  } = api.dashboard.list.useQuery(
    {
      filter: filParams,
      filterParams: filterParams,
      id: parseInt(session?.data?.user?.id || "0"),
      ...(startDate ? { startDate: startDate as any } : {}),
      ...(endDate ? { endDate: endDate as any } : {}),
    },
    {
      enabled:
        (!startDate && !endDate && filParams.length) ||
        (flag && filParams.length)
          ? true
          : false,
    }
  );

  const handleFilters = () => {
    refetch();
  };

  const tabs = [
    {
      name: "application",
      label: "Applications",
      key: "1",
      currentTab: true,
    },
    {
      name: "policy",
      label: "Policies",
      key: "2",
      currentTab: false,
    },
    {
      name: "claim",
      label: "Claims",
      key: "3",
      currentTab: false,
    },
  ];

  const tabs2 = [
    {
      name: "lead",
      label: "Prospects",
      key: "1",
      currentTab: true,
    },
    {
      name: "application",
      label: "Applications",
      key: "2",
      currentTab: false,
    },
    {
      name: "policy",
      label: "Policies",
      key: "3",
      currentTab: false,
    },
    {
      name: "claim",
      label: "Claims",
      key: "4",
      currentTab: false,
    },
  ];

  const dashboardCard = [
    {
      title: "Applications",
      value: "totalApp" as string,
      count: Number(apidata?.totalApp),
      key: "applications",
      description:
        "Just the basics - Everything you need to know when you are creating the application.",
      icon: "/icons/applicationDashboard.svg",
      href: "application/list",
    },
    {
      title: "Policies",
      value: "totalPolicy" as string,
      count: Number(apidata?.totalPolicy),
      key: "policies",
      description:
        "Reading your policy helps you verify that the policy meets your needs and that you understand your and the insurance company’s responsibilities if a loss occurs.",
      icon: "/icons/policyDashboard.svg",
      href: "policy/list",
    },
    {
      title: "Claims",
      value: "totalClaim" as string,
      count: Number(apidata?.totalClaim),
      key: "claims",
      description:
        "A formal request to your insurance provider for reimbursement against losses covered under your insurance policy.",
      icon: "/icons/claimDashboard.svg",
      href: "claim/list",
    },
  ];

  useEffect(() => {
    setAccessLevels({
      applications: currentRoleAccessLevels?.Application?.canView,
      policies: currentRoleAccessLevels?.Policy?.canView,
      claims: currentRoleAccessLevels?.Claim?.canView,
    });

    setFilterOptions(session?.data?.user?.packageName);
  }, [currentRole]);

  useEffect(() => {
    if (!session.data?.user.otp_enabled) {
      setShowEnable2FA(true);
    }
  }, [session.data?.user.otp_enabled]);

  const handleTabChange = (
    tab: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event) {
      event.preventDefault();
    }

    setCurrentTab(tab);
  };

  useEffect(() => {
    setFilParams(filParamsString);
    setFilterParams(filParamsString);
  }, []);

  useEffect(() => {
    if (APIdata) {
      setapiData(APIdata);
      setLoading(false);
      // setFlag(false);
      setCountData({
        application: APIdata?.totalApplicationCount1,
        policy: APIdata?.totalPolicyCount,
        claim: APIdata?.totalClaimCount,
      });

      setLeadsData({
        leads: APIdata?.totalLeadsCount,
      });

      if (currentTab == "application") {
        setChartData({
          application: [
            ["Application", "Dividation"],
            ["APPROVED", APIdata?.totalApprovedApplicationCount],
            ["PENDING", APIdata?.totalPendingApplicationCount],
            ["REJECTED", APIdata?.totalRejectedApplicationCount],
            ["ON HOLD", APIdata?.totalOnHoldApplicationCount],
          ],
        });
      } else if (currentTab == "policy") {
        setChartData({
          policy: [
            ["Policy", "Dividation"],
            ["ACTIVE", APIdata?.totalActivePolicyCount],
            ["CANCELLED", APIdata?.totalCancelledPolicyCount],
          ],
        });
      } else if (currentTab == "claim") {
        setChartData({
          claim: [
            ["Claim", "Dividation"],
            ["OPEN", APIdata?.totalOpenClaimCount],
            ["CLOSED", APIdata?.totalClosedClaimCount],
            ["ACKNOWLEDGED", APIdata?.totalAckClaimCount],
            ["FINALIZED", APIdata?.totalFinalizedClaimCount],
            ["REJECTED", APIdata?.totalRejectedClaimCount],
          ],
        });
      } else {
        setChartData({
          lead: [
            ["Lead", "Dividation"],
            ["DRAFT", APIdata?.leadsDraft],
            ["ACCEPTED", APIdata?.leadsAccepted],
            ["INREVIEW", APIdata?.leadsInreview],
            ["DECLINED", APIdata?.leadsDeclined],
            ["REFUSED", APIdata?.leadsRefused],
          ],
        });
      }
    }
  }, [APIdata]);

  useEffect(() => {
    if (currentTab == "application") {
      setChartData({
        application: [
          ["Application", "Dividation"],
          ["APPROVED", APIdata?.totalApprovedApplicationCount],
          ["PENDING", APIdata?.totalPendingApplicationCount],
          ["REJECTED", APIdata?.totalRejectedApplicationCount],
        ],
      });
    } else if (currentTab == "policy") {
      setChartData({
        policy: [
          ["Policy", "Dividation"],
          ["ACTIVE", APIdata?.totalActivePolicyCount],
          ["CANCELLED", APIdata?.totalCancelledPolicyCount],
        ],
      });
    } else if (currentTab == "claim") {
      setChartData({
        claim: [
          ["Claim", "Dividation"],
          ["OPEN", APIdata?.totalOpenClaimCount],
          ["CLOSED", APIdata?.totalClosedClaimCount],
          ["ACKNOWLEDGED", APIdata?.totalAckClaimCount],
          ["FINALIZED", APIdata?.totalFinalizedClaimCount],
          ["REJECTED", APIdata?.totalRejectedClaimCount],
        ],
      });
    } else {
      setChartData({
        lead: [
          ["Lead", "Dividation"],
          ["DRAFT", APIdata?.leadsDraft],
          ["ACCEPTED", APIdata?.leadsAccepted],
          ["INREVIEW", APIdata?.leadsInreview],
          ["DECLINED", APIdata?.leadsDeclined],
          ["REFUSED", APIdata?.leadsRefused],
        ],
      });
    }
  }, [currentTab]);

  const handlePage = () => {
    dataRefetch();
  };

  const handleFilter = (e: any) => {
    setFilParams(e.target.filterValue);
    setLoading(true);
    handleFilters();
  };

  const handleStartDateChange = (e: any) => {
    const newDate = new Date(e.target.value);
    setStartDate(newDate as any);
  };

  const handleEndDateChange = (e: any) => {
    const newDate = new Date(e.target.value);
    setEndDate(newDate as any);
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      if (startDate <= endDate) {
        setLoading(true);
        setFlag(true);
        handleFilters();
      } else {
        toast.error("End Date cannot be less than Start Date");
      }
    } else if (startDate && !endDate) {
      toast.error("Please select End Date");
    } else if (!startDate && endDate) {
      toast.error("Please select Start Date");
    } else {
      toast.error("Please select Start and End Date");
    }
  };

  return (
    <>
      {env.NEXT_PUBLIC_ENVIRONMENT !== "PRODUCTION" ? (
        <>
          <Head>
            <title>Telkom Insurance CMS</title>
            <meta name="description" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className="bg-[background: #F5F8FB] flex min-h-[100vh] pl-[35px] pt-[10px] 2xl:justify-center 2xl:pl-0   ">
            <div className="flex flex-col items-center gap-[20px]">
              <h1 className="text-dark text-2xl font-bold">
                Welcome to Telkom Insurance
              </h1>
              <>
                {" "}
                <div className="flex gap-[34px]">
                  {dashboardCard.map(
                    (card) =>
                      accessLevels[card.key as keyof typeof accessLevels] && (
                        <Link href={card.href} key={card.title}>
                          <div className="flex min-h-[90px] w-[300px] flex-col gap-6 rounded-[20px] bg-white p-6 shadow-[4px_4px_10px_0px_rgba(0,94,155,0.15)] hover:bg-[#f5f8fb]">
                            <div className="flex items-center gap-6">
                              <div className="relative h-[57px] w-[45px]">
                                <Image src={card.icon} alt={card.title} fill />
                              </div>
                              <h3 className="tetx-xl font-semibold text-secondary-blue">
                                {card.title}
                                <div>
                                  {loading ? (
                                    <div
                                      className="mt-2"
                                      style={{ height: "20px", width: "30px" }}
                                    >
                                      <ComponentLoader />
                                    </div>
                                  ) : (
                                    <>
                                      <CountUp end={card?.count} duration={4} />
                                    </>
                                  )}
                                </div>
                              </h3>
                              <div>
                                <Image
                                  src="/icons/rightArrow.svg"
                                  alt=""
                                  width={16}
                                  height={11}
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                  )}
                </div>
                <div className="max-h-fit">
                  <div className="flex gap-[34px]">
                    <div className=" flex min-h-[50px] w-[1030px]  flex-col items-center gap-6 rounded-[20px] bg-white p-2 shadow-[4px_4px_10px_0px_rgba(0,94,155,0.15)] hover:bg-[#f5f8fb]">
                      <div className="ml-auto mr-3 mt-2 flex items-center gap-3">
                        <div className="group relative">
                          <p className="text-xl">
                            <CalendarDaysIcon
                              className="h-7 w-7 cursor-pointer text-primary-500"
                              aria-hidden="true"
                            />
                          </p>
                          <div className="absolute right-[20%] hidden rounded-xl bg-white p-2 shadow-md group-hover:block">
                            <div className="ml-auto mr-3 mt-2 flex flex-col items-center gap-3">
                              <label className="mt-3 flex font-bold">
                                Start Date :
                              </label>
                              <input
                                className="border-1 w-full appearance-none rounded px-3 py-2 leading-tight"
                                type="date"
                                id="birthday"
                                name="birthday"
                                onChange={handleStartDateChange}
                              ></input>
                              <label className="mt-3 flex font-bold">
                                End Date :
                              </label>
                              <input
                                className="border-1 w-full appearance-none rounded px-3 py-2 leading-tight"
                                type="date"
                                id="birthday"
                                name="birthday"
                                onChange={handleEndDateChange}
                              ></input>
                              <Button onClick={handleDateFilter} text="Filter">
                                Filter
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Filter
                          filterOptions={dashboardFilters(
                            session?.data?.user?.packageName as any[]
                          )}
                          setFilParams={setFilParams}
                          handleFilter={handleFilter}
                          selectedFilterOptionsCount={
                            selectedFilterOptionsCount
                          }
                          setSelectedFilterOptionsCount={
                            setSelectedFilterOptionsCount
                          }
                          showFilter={true}
                          fromDashBoard={true}
                        />
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <TabsBar
                          tabs={
                            session?.data?.user?.roles?.includes(
                              roleValues.agent as UserRole
                            ) ||
                            session?.data?.user?.roles?.includes(
                              roleValues.superAdmin as UserRole
                            )
                              ? tabs2
                              : tabs
                          }
                          activeTab={currentTab}
                          setActiveTab={setCurrentTab}
                          handleTabChange={handleTabChange}
                        />

                        {loading ? (
                          <>
                            <div
                              className="mr-15 mt-10"
                              style={{ height: "100px", width: "100px" }}
                            >
                              <ComponentLoader />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mt-3 flex font-bold">
                              {(session?.data?.user?.roles?.includes(
                                roleValues.agent as UserRole
                              ) ||
                                session?.data?.user?.roles?.includes(
                                  roleValues.superAdmin as UserRole
                                )) && (
                                <>
                                  <CountUp
                                    className="mr-11"
                                    duration={4}
                                    end={leadsData?.leads}
                                  />
                                </>
                              )}
                              <>
                                <CountUp
                                  className="mr-11"
                                  duration={4}
                                  end={countData.application}
                                />
                              </>

                              <>
                                <CountUp
                                  className="mr-6"
                                  duration={4}
                                  end={countData.policy}
                                />
                              </>

                              <>
                                <CountUp
                                  className="ml-6"
                                  duration={4}
                                  end={countData.claim}
                                />
                              </>
                            </div>
                          </>
                        )}
                      </div>

                      {loading || !chartData ? (
                        <></>
                      ) : (
                        <>
                          <div>
                            {currentTab === "application" &&
                              (countData.application > 0 ? (
                                <>
                                  <Chart
                                    chartType="PieChart"
                                    data={chartData.application}
                                    options={{
                                      title: "Applications",
                                      is3D: true,
                                      slices: {
                                        0: { color: "green" },
                                        1: { color: "#FFC300" },
                                        2: { color: "red" },
                                        3: { color: "#FF5733" },
                                      },
                                    }}
                                    width="100%"
                                    height="200px"
                                  />
                                </>
                              ) : (
                                <h1>No Data</h1>
                              ))}

                            {currentTab === "policy" &&
                              (countData.policy > 0 ? (
                                <Chart
                                  chartType="PieChart"
                                  data={chartData.policy}
                                  options={{
                                    title: "Policies",
                                    is3D: true,
                                    slices: {
                                      0: { color: "#22DD22" },
                                      1: { color: "#FF3333" },
                                    },
                                  }}
                                  width="100%"
                                  height="200px"
                                />
                              ) : (
                                <h1>No Data</h1>
                              ))}
                            {currentTab === "claim" &&
                              (countData.claim > 0 ? (
                                <Chart
                                  chartType="PieChart"
                                  data={chartData.claim}
                                  options={{
                                    title: "Claims",
                                    is3D: true,
                                    slices: {
                                      3: { color: "#22DD22" },
                                      4: { color: "#FF3333" },
                                    },
                                  }}
                                  width="100%"
                                  height="200px"
                                />
                              ) : (
                                <h1>No Data</h1>
                              ))}

                            {currentTab === "lead" &&
                              (leadsData?.leads > 0 ? (
                                <Chart
                                  chartType="PieChart"
                                  data={chartData.lead}
                                  options={{
                                    title: "Prospects",
                                    is3D: true,
                                    slices: {
                                      3: { color: "red" },
                                      1: { color: "green" },
                                    },
                                  }}
                                  width="100%"
                                  height="200px"
                                />
                              ) : (
                                <h1>No Data</h1>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {session?.data?.user?.roles?.includes(
                  roleValues.agent as UserRole
                ) &&
                  session?.data?.user?.roles?.length == 1 && (
                    <>
                      {props.userType == "MANAGER" && (
                        <div>
                          <AgentPerformance
                            setSearchParams={setSearchParams}
                            isLoading={setSearchParams}
                            data={agentListData?.agentPerformance}
                            itemsPerPage={itemsPerPage}
                            setCurrentOffset={setCurrentOffset}
                            loader={isLoading}
                            totalCount={
                              Math.ceil(Number(agentListData?.totalCount)) / 10
                            }
                            handlePage={handlePage}
                            allowOnClick={false}
                          />
                        </div>
                      )}
                    </>
                  )}
                {session?.data?.user?.roles?.includes(
                  roleValues.superAdmin as UserRole
                ) && <>{/* show all call centers analytics here  */}</>}
              </>
            </div>
            {showEnable2FA && (
              <Verify2fa
                user_id={Number(session.data?.user?.id)}
                closeModel={() => {
                  setShowEnable2FA(!showEnable2FA);
                }}
              />
            )}
          </main>
        </>
      ) : (
        <>
          <Head>
            <title>Telkom Insurance CMS</title>
            <meta name="description" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className="bg-[background: #F5F8FB] flex min-h-[100vh] pl-[35px] pt-[110px] 2xl:justify-center 2xl:pl-0">
            <div className="flex flex-col items-center gap-[38px]">
              <h1 className="text-dark text-5xl font-bold">
                Welcome to Telkom Insurance
              </h1>
              <div className="flex gap-[34px]">
                {dashboardCard.map(
                  (card) =>
                    accessLevels[card.key as keyof typeof accessLevels] && (
                      <Link href={card.href} key={card.title}>
                        <div className="flex min-h-[293px] w-[340px] flex-col gap-6 rounded-[20px] bg-white p-6 shadow-[4px_4px_10px_0px_rgba(0,94,155,0.15)] hover:bg-[#f5f8fb]">
                          <div className="flex items-center gap-6">
                            <div className="relative h-[57px] w-[45px]">
                              <Image src={card.icon} alt={card.title} fill />
                            </div>
                            <h3 className="tetx-xl font-semibold text-secondary-blue">
                              {card.title}
                            </h3>
                            <div>
                              <Image
                                src="/icons/rightArrow.svg"
                                alt=""
                                width={16}
                                height={11}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-dark text-base font-normal leading-7">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                )}
              </div>
            </div>
            {showEnable2FA && (
              <Verify2fa
                user_id={Number(session.data?.user?.id)}
                closeModel={() => {
                  setShowEnable2FA(!showEnable2FA);
                }}
              />
            )}
          </main>
        </>
      )}
    </>
  );
};

export default Dashboard;
