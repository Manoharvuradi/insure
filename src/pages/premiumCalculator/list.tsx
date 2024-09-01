import React from "react";
import ListView from "~/common/listView";
import DefaultLayout from "~/components/defaultLayout";
import { useRouter } from "next/router";
import withAuth from "../api/auth/withAuth";

function PremiumCalculator() {
  const router = useRouter();
  interface column {
    key: string;
    label: string;
  }
  //Column that will be in Table where "label" => Column Heading & key = property name of the data that will be shown in the column
  const column: column[] = [
    { key: "claimDate", label: "Claim Date" },
    { key: "status", label: "Status" },
    { key: "policy", label: "Policy" },
    { key: "policyholder", label: "Policyholder" },
    { key: "spouse", label: "Spouse" },
    { key: "children", label: "Children" },
  ];

  //options that will be in Action Dropdown
  const dropDownOptions = [
    {
      label: "Show",
      href: "#",
    },
    {
      label: "Edit",
      href: "#",
    },
    {
      label: "Delete",
      href: "#",
    },
  ];

  // Table data coming from API
  const data = [
    {
      claimDate: "17/04/2023",
      status: "active",
      policy: "t4554yhfgg4d",
      policyholder: "Dev",
      spouse: "Juile",
      children: 4,
    },
  ];
  const handleCreate = () => {
    router.push("/premiumCalculator/create");
  };
  return (
    <>
      <ListView
        data={data}
        column={column}
        onCreate={handleCreate}
        listName={"PremiumCalculator"}
        showCreate={false}
        onRowClick={undefined}
        filterOptions={undefined}
        setFilParam={undefined}
        handleFilter={undefined}
        setSearchParam={undefined}
        setSortParam={undefined}
        itemsPerPage={undefined}
        setCurrentOffset={undefined}
        isLoading={undefined}
        totalCounts={undefined}
        handlePage={undefined}
      />
    </>
  );
}

export default withAuth(DefaultLayout(PremiumCalculator));
