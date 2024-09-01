import React, { useEffect, useState } from "react";
import Modal from "~/common/Modal";
import Pagination from "~/common/Pagination";
import ComponentLoader from "~/common/componentLoader";
import { api } from "~/utils/api";

interface selectedUsersList {
  selectedUsers: [
    {
      id: number;
      firstName: string;
      lastName: string;
      isAgent: boolean;
      isLead: boolean;
      isManager: boolean;
    }
  ];
}

interface SelecteUserProps {
  setCloseModel: (value: boolean) => void;
  setSelectedUserProps: (value: any) => void;
  exsistingUserIds?: any;
  callcenterId?: number;
}

function SelectUserTable(props: SelecteUserProps) {
  const [searchText, setSearchText] = useState("");
  const [currentOffeset, setCurrentOffset] = useState(0);
  const [searchForm, setSearchForm] = useState(false);
  const [fullNamesArray, setFullNamesArray] = useState([] as any);
  const [selectedUsers, setSelectedUsers] = useState([] as any);
  const itemsPerPage = 10;
  const {
    isLoading: userDataLoading,
    data: userData,
    error: hasError,
    refetch,
  } = api.credentialUser.list.useQuery({
    pageSize: itemsPerPage.toString(),
    offset: currentOffeset.toString(),
    search: searchText,
    filter: "AGENT",
    companyId: props.callcenterId,
  });
  useEffect(() => {
    const updatedList = userData?.data.filter((user: any) => {
      if (!props.exsistingUserIds.includes(user.id)) {
        return user;
      }
    });
    setFullNamesArray(updatedList);
  }, [userData]);

  useEffect(() => {
    if (searchForm) {
      const updatedList = userData?.data.filter((user: any) => {
        if (!props.exsistingUserIds.includes(user.id)) {
          return user;
        }
      });
      setFullNamesArray(updatedList);
    }
  }, [searchForm]);

  const setData = () => {
    refetch();
    setFullNamesArray(userData?.data);
  };

  const handleSearchTextChange = (event: any) => {
    setSearchForm(true);
    setSearchText(event.target.value);
    setData();
  };

  const handleCheckChange = (event: any, data: any) => {
    if (event.target.checked) {
      const newUser = data;
      setSelectedUsers((prevSelectedUsers: any) => [
        ...prevSelectedUsers,
        newUser,
      ]);
    } else {
      setSelectedUsers((prevSelectedUsers: any) =>
        prevSelectedUsers.filter((user: any) => user.id !== data.id)
      );
    }
  };

  const handlePage = () => {
    refetch();
  };

  return (
    <>
      <Modal
        title={"Add Reporting users"}
        onCloseClick={() => {
          props.setCloseModel(false);
          refetch();
        }}
        onSaveClick={() => {
          props.setSelectedUserProps(selectedUsers);
          props.setCloseModel(false);
        }}
        showButtons={true}
        border
      >
        <>
          <div className="text-black-500 mb-2 text-left text-lg ">
            <h1>Select users</h1>
          </div>
          <div className="my-2 flex h-[50px] w-[350px] w-full items-center rounded-md bg-[#d7edfc] pl-6">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchTextChange}
              className="w-[calc(100%-45px)] border-none bg-[#d7edfc] font-gordita text-[15px] font-medium text-black focus:ring-0"
              placeholder="Search"
            />
          </div>

          {userDataLoading ? (
            <ComponentLoader />
          ) : (
            fullNamesArray?.map((data: any) => (
              <div className="mt-1" key={data.id}>
                <input
                  type="checkbox"
                  id={data.id}
                  value={data.id}
                  onChange={(event) => {
                    handleCheckChange(event, data);
                  }}
                  checked={selectedUsers.some(
                    (selected: any) => selected.id === data.id
                  )}
                />
                <label className="ml-1.5">
                  {data.firstName + " " + data.lastName}
                </label>
              </div>
            ))
          )}
          <Pagination
            itemsPerPage={itemsPerPage}
            setCurrentOffset={setCurrentOffset}
            isLoading={userDataLoading}
            totalCount={Math.ceil(userData?.totalCount / 10)}
            handlePage={handlePage}
          />
        </>
      </Modal>
    </>
  );
}

export default SelectUserTable;
