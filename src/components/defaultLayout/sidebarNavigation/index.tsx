import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import { AccessLevelsDefinition } from "~/utils/constants";
import { UserRole } from "@prisma/client";
import { getMultipleAccessRoles } from "~/utils/helpers";
// import ArrowTopRightOnSquareIcon

function SidebarNavigation(props: any) {
  const session = useSession();
  const router = useRouter();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const [accessLevels, setAccessLevels] = useState({
    application: false,
    policies: false,
    complaint: false,
    claims: false,
    payments: false,
    admin: false,
    leads: false,
    contacts: false,
  });
  useEffect(() => {
    setAccessLevels({
      application: currentRoleAccessLevels?.Application?.canView,
      policies: currentRoleAccessLevels?.Policy?.canView,
      complaint: currentRoleAccessLevels?.Complaints?.canView,
      claims: currentRoleAccessLevels?.Claim?.canView,
      payments: currentRoleAccessLevels?.Payments?.canView,
      admin: currentRoleAccessLevels?.Admin?.canView,
      leads: currentRoleAccessLevels?.Leads?.canView,
      contacts: currentRoleAccessLevels?.Contacts?.canView,
    });
  }, [currentRole]);

  const navigation = [
    {
      name: "Admin",
      path: "admin",
      href: "",
      icon: "/icons/admin.svg",
      show: accessLevels.admin,
      children: [
        {
          name: "Users",
          path: "users",
          href: "/admin/users",
        },
        {
          name: "Call centers",
          path: "callCenter",
          href: "/callcenters/list",
        },
      ],
    },
    {
      name: "Contacts",
      path: "contacts",
      href: "/contacts/list",
      icon: "/icons/contacts.svg",
      show: accessLevels.contacts,
    },
    {
      name: "Prospects",
      path: "lead",
      href: "/lead/list",
      icon: "/icons/leads.svg",
      show: accessLevels.leads,
    },
    {
      name: "Applications",
      path: "application",
      href: "/application/list",
      icon: "/icons/application.svg",
      show: accessLevels.application,
    },
    {
      name: "Policies",
      href: "/policy/list",
      path: "policy",
      icon: "/icons/policy.svg",
      show: accessLevels.policies,
    },
    {
      name: "Claims",
      path: "claim",
      href: "/claim/list",
      icon: "/icons/claim.svg",
      show: accessLevels.claims,
    },
    {
      name: "Complaints",
      path: "complaint",
      href: "/complaint/list",
      icon: "/icons/complaint.svg",
      show: accessLevels.complaint,
    },
    {
      name: "Payments",
      path: "payment",
      href: "",
      icon: "/icons/payment.svg",
      show: accessLevels.payments,
      children: [
        {
          name: "Policy",
          path: "policyPremium",
          href: "/payments/list",
        },
        {
          name: "Claim",
          path: "claimPayOut",
          href: "/payments/list",
        },
      ],
    },
    // {
    //   name: "Get Quote",
    //   path: "getQuote",
    //   href: "/quickQuote",
    //   icon: "/icons/getQuote.svg",
    //   show: true,
    // },

    // {
    //   name: "Reports",
    //   path: "reports",
    //   href: "",
    //   icon: "/icons/reports.svg",
    //   show: accessLevels.admin,
    //   children: [
    //     {
    //       name: "Telkom",
    //       path: "telkom",
    //       href: "/reports/list",
    //     },
    //     {
    //       name: "Qsure",
    //       path: "qsure",
    //       href: "/reports/list",
    //     },
    //   ],
    // },
  ];

  const { data: sessionData } = useSession();
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleProfileClick = () => {
    router.push("/users/profiles");
  };

  const profileDropdownOption = [
    { label: "Profile", handleClick: handleProfileClick },
    { label: "Logout", handleClick: handleSignOut },
  ];
  return (
    <div className="fixed inset-0 z-10 flex h-screen w-[85px] flex-col bg-primary-blue">
      <div className="flex h-[60px] shrink-0 items-center justify-center ">
        <Link href={"/"}>
          <Image
            src="/icons/logo.svg"
            width={73}
            height={20}
            alt="Telkom logo"
          />
        </Link>
      </div>
      <nav className="flex h-full flex-1 flex-col items-center">
        {currentRole && (
          <div className="flex w-full flex-1  flex-col ">
            {navigation.map((item: any) => {
              if (item.show) {
                if (item.children) {
                  return (
                    <Menu as="div" className="relative w-full" key={item.name}>
                      {({ open }) => (
                        <>
                          <Menu.Button
                            className={`group flex w-full flex-col items-center justify-center gap-1.5 p-3 hover:bg-[#0076BD] ${
                              open ? "bg-[#0076BD]" : ""
                            } ${
                              item.current == true ||
                              router.pathname.includes(item.path.toLowerCase())
                                ? "bg-secondary-blue"
                                : "hover:bg-[#0076BD]"
                            }`}
                          >
                            <Image
                              src={item.icon}
                              width={20}
                              height={20}
                              alt={item.name}
                            />
                            <span className="text-[11px] font-medium tracking-[0.25px] text-white group-hover:text-grey-1">
                              {item.name}
                            </span>
                          </Menu.Button>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                          >
                            <Menu.Items className="absolute left-[85px] top-0 flex w-[200px] flex-col bg-[#CDE1F0]">
                              {item.children.map((childItem: any) => (
                                <Menu.Item key={item.name}>
                                  <Link
                                    href={`${childItem.href}?name=${childItem.path}`}
                                    className=" px-6 py-4 text-[15px] font-medium text-dark-blue hover:bg-[#ADCFE8]"
                                  >
                                    {childItem.name}
                                  </Link>
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Transition>
                        </>
                      )}
                    </Menu>
                  );
                } else {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex  flex-col items-center justify-center p-2  ${
                        item.current == true ||
                        router.pathname.includes(item.path.toLowerCase())
                          ? "bg-secondary-blue"
                          : "hover:bg-[#0076BD]"
                      }`}
                    >
                      <Image
                        src={item.icon}
                        width={20}
                        height={20}
                        alt={item.name}
                      />
                      <span className="text-[11px] font-medium tracking-[0.25px] text-white group-hover:text-grey-1">
                        {item.name}
                      </span>
                    </Link>
                  );
                }
              }
            })}
          </div>
        )}

        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                as="div"
                className={`flex w-full cursor-pointer items-center justify-center py-6 hover:bg-[#0076BD] ${
                  open ? "bg-[#0076BD]" : ""
                }`}
              >
                <div className=" flex h-[50px] w-[50px] items-center justify-center rounded-[40px]  bg-white">
                  <span className="text-xl text-primary-blue">
                    {" "}
                    {sessionData?.user?.firstName
                      ? sessionData?.user.firstName?.slice(0, 1).toUpperCase()
                      : sessionData?.user.lastName
                      ? sessionData?.user.lastName?.slice(0, 1).toUpperCase()
                      : "?"}
                  </span>
                </div>
              </Menu.Button>
              <Menu.Items>
                <div className="absolute bottom-0 left-[85px] w-[200px] min-w-max  bg-[#CDE1F0]">
                  {sessionData && (
                    <>
                      <Menu.Item
                        as="div"
                        className="flex items-center gap-[18px] bg-[#0076BD] px-6 py-3"
                      >
                        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[40px]  bg-white">
                          <span className="text-xl text-primary-blue">
                            {" "}
                            {sessionData?.user?.firstName
                              ? sessionData?.user.firstName
                                  ?.slice(0, 1)
                                  .toUpperCase()
                              : sessionData?.user.lastName
                              ? sessionData?.user.lastName
                                  ?.slice(0, 1)
                                  .toUpperCase()
                              : "?"}
                          </span>
                        </div>
                        <div className="text-[15px] font-medium text-white">{`${sessionData?.user?.firstName} ${sessionData?.user.lastName}`}</div>
                      </Menu.Item>
                      {profileDropdownOption.map((option) => (
                        <Menu.Item key={option.label}>
                          <div
                            onClick={option.handleClick}
                            className=" cursor-pointer px-6 py-4 text-[15px] font-medium text-dark-blue hover:bg-[#ADCFE8]"
                          >
                            {option.label}
                          </div>
                        </Menu.Item>
                      ))}
                    </>
                  )}
                </div>
              </Menu.Items>
            </>
          )}
        </Menu>
      </nav>
    </div>
  );
}

export default SidebarNavigation;
