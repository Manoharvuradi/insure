import React from "react";
import ListView from "~/common/listView";
import DefaultLayout from "~/components/defaultLayout";
import { useRouter } from "next/router";
import withAuth from "../api/auth/withAuth";

function Quotation() {
  const router = useRouter();
  interface column {
    key: string;
    label: string;
  }
  //Column that will be in Table where "label" => Column Heading & key = property name of the data that will be shown in the column
  const column: column[] = [
    { key: "mainMemberFirstName", label: "Main Member First Name" },
    { key: "mainMemberPremium", label: "Main Member Premium" },
    { key: "extendedFamilyPremium", label: "Extended Family Premium" },
    { key: "totalPremium", label: "Total Premium" },
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
  const quotations = [
    {
      mainMemberFirstName: "XYZ",
      mainMemberPremium: "25",
      extendedFamilyPremium: "30",
      totalPremium: "1255",
    },
  ];
  const handleCreate = () => {
    router.push("/quotation/create");
  };
  return (
    <>
      <ListView
        data={quotations}
        column={column}
        onCreate={handleCreate}
        listName={"Quotations"}
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

export default withAuth(DefaultLayout(Quotation));
