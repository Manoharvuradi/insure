import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { editUserDetailsModal, rolesList } from "~/utils/constants/user";
import Loader from "~/common/loader";
import { api } from "~/utils/api";
import { UserRole } from "@prisma/client";
import { AccessLevelsDefinition } from "~/utils/constants";
import Table from "~/common/table";
import { IUserColumn } from "~/interfaces/common";
import NotificationTable from "~/common/notificationTable";
import { AccessLevels } from "@prisma/client";
import InputField from "~/common/form/input";
import SelectInput from "~/common/form/selectInput";
import { toast } from "react-toastify";
import ComponentLoader from "~/common/componentLoader";
import { Router, useRouter } from "next/router";
export const userColumn: IUserColumn[] = [
  { key: "features", label: "Features" },
  { key: "canView", label: "View" },
  { key: "canCreate", label: "Create" },
  { key: "canUpdate", label: "Update" },
  { key: "canDelete", label: "Archive" },
];
const input = {};
export const ApiAccessLevel = () => {
  const session = useSession();
  const [role, setRole] = useState<UserRole>("SUPER_ADMIN");
  const accessLevelUpdate = api.accessLevels.update.useMutation();
  const handleOptionChange = (e: any, index: number = 0) => {
    setRole(e.target.value);
  };
  const currentRole = session.data?.user.roles as UserRole[];
  const router = useRouter();
  const {
    data,
    isLoading,
    refetch: accessLevelRefetch,
  } = currentRole.includes("SUPER_ADMIN")
    ? api.accessLevels.list.useQuery({
        role: role,
      })
    : {
        isLoading: false,
        data: null,
        refetch: () => {
          return null;
        },
      };
  const [isRefetching, setIsRefetching] = useState(false);
  const handleButton = async (
    item: any,
    isAllowed: boolean,
    accessLevelType: string
  ) => {
    setIsRefetching(true);
    const queryOptions: any = {
      id: item.id,
      body: {
        [`${accessLevelType}`]: isAllowed,
      },
    };
    try {
      const res = await accessLevelUpdate.mutateAsync(queryOptions);
      if (res) {
        toast.success("Updated successfully");
        router.reload();
      }
    } catch (error) {
      toast.error("Try again later");
    } finally {
      setIsRefetching(false);
      accessLevelRefetch();
    }
  };
  data?.sort((a: any, b: any) => a.features.localeCompare(b.features));
  return (
    <>
      <div className="my-2 px-8">
        <div className="">
          <div className="w-[210px]">
            <InputField
              input={rolesList}
              handleChange={handleOptionChange}
              formValues={{ role: role }}
            />
          </div>
        </div>
        {isLoading || isRefetching ? (
          <ComponentLoader />
        ) : (
          <div className="flow-root">
            <div className="inline-block min-w-full align-middle">
              <div className="relative">
                <NotificationTable
                  data={data as AccessLevels[]}
                  column={userColumn}
                  eventRefetch={accessLevelRefetch}
                  page={"Access Levels"}
                  handleApiButton={handleButton}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
