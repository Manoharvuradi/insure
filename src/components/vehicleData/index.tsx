import React, { useEffect, useState } from "react";
import DefaultLayout from "../defaultLayout";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import DescriptionList from "~/common/showDetails/tableView";
import Loader from "~/common/loader";
import Modal from "~/common/Modal";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import NoAccessComponent from "~/common/noAccess";
import ErrorComponent from "~/common/errorPage";
import EditButton from "~/common/buttons/editButton";
import DeleteButton from "~/common/buttons/deleteButton";
import { validateFrom } from "~/utils/helpers/validations";
import { vehicleInputFields } from "~/utils/constants/vehicleData";
import { getMultipleAccessRoles } from "~/utils/helpers";

const VehicleDataView = (props: any) => {
  const [editModal, setEditModal] = useState(false);
  const [vehicleData, setEditVehicleData] = useState({} as any);
  const [loading, setLoading] = useState(false);
  const [errorData, setErrorData] = useState({} as any);
  const updateVehicleDetails = api.vehicleData.update.useMutation();
  const deleteVehicleDetails = api.vehicleData.delete.useMutation();
  const router = useRouter();
  const session = useSession();
  const currentRole = session.data?.user.roles as UserRole[];
  const currentRoleAccessLevels = getMultipleAccessRoles(currentRole, props);
  const userId = router.query.id as string;
  let {
    isLoading,
    data,
    error,
    refetch: refetch = () => {},
  } = api.vehicleData.show.useQuery(Number(userId));

  const onEditSave = async () => {
    const errors = validateFrom(vehicleData, vehicleInputFields);
    const isFormValid = Object.values(errors).some(Boolean);
    if (isFormValid) {
      setErrorData(errors);
      return;
    }
    setLoading(true);
    try {
      const updateVehicleRes = await updateVehicleDetails.mutateAsync({
        id: Number(vehicleData?.id),
        ...vehicleData,
      });
      if (updateVehicleRes) {
        setEditModal(false);
        toast.success("Vehicle data updated successfully");
      }
    } catch (error) {
      toast.error("Unable to update the vehicle data please try again later");
    } finally {
      setLoading(false);
      handleRefetch();
    }
  };

  useEffect(() => {
    if (data) {
      setEditVehicleData(data);
    }
  }, [data]);

  const handleRefetch = () => {
    refetch();
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const delEmpRes = await deleteVehicleDetails.mutateAsync({
        id: Number(data?.id),
      });
      if (delEmpRes) {
        toast.success("Vehicle data has been deleted");
        router.push("/vehicle-data/list");
      }
    } catch (error) {
      toast.error("Unable to delete Vehicle data please try again later");
    } finally {
      setLoading(false);
      handleRefetch();
    }
  };

  const handleFormInputChange = (e: IEvent): void => {
    const { name, value } = e.target;
    setEditVehicleData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));

    setErrorData((prevFormErrors: any) => ({
      ...prevFormErrors,
      [name]: false,
    }));
  };

  const handlePhoneChange = (name: string, value: string) => {
    setEditVehicleData({
      ...vehicleData,
      phone: value,
    });
  };

  return currentRoleAccessLevels?.Admin?.canView ? (
    data && (
      <>
        {loading || (isLoading && !error) ? (
          <Loader />
        ) : !error ? (
          <div className="flex flex-row">
            <div className="w-full border-r-2 border-solid border-gray-300">
              <div className="h-screen overflow-auto transition duration-300 scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-400 scrollbar-thumb-rounded-md">
                <div
                  className="my-4 flex items-center justify-between px-5"
                  id="Claim details"
                >
                  <h2 className="text-[26px] font-bold leading-9 text-dark-grey">
                    Vehicle Details
                  </h2>
                  <div className="flex gap-4">
                    {currentRoleAccessLevels?.Admin?.canDelete && (
                      <DeleteButton handleDelete={handleDeleteUser} />
                    )}
                    {currentRoleAccessLevels?.Admin?.canUpdate && (
                      <EditButton
                        handleClick={() => {
                          setEditModal(true);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="m-2 mt-5 rounded-[10px]  px-4 py-3 shadow-[0px_0px_5px_0px_rgba(0,94,155,0.15)]">
                  <DescriptionList
                    data={{
                      ...data,
                      ...(vehicleData.role === "AGENT" && {
                        callcenterName: data?.callCenter?.name,
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            {editModal && (
              <Modal
                title={"Edit Vehicle Details"}
                onCloseClick={() => {
                  setEditModal(false);
                  handleRefetch();
                }}
                onSaveClick={onEditSave}
                showButtons
                border
              >
                <>
                  <div>
                    <FormComponent
                      inputs={vehicleInputFields}
                      formValues={vehicleData}
                      handleChange={handleFormInputChange}
                      handlePhoneChange={handlePhoneChange}
                      formErrors={errorData}
                      tailwindClass="grid grid-cols-2 gap-4"
                    />
                  </div>
                </>
              </Modal>
            )}
          </div>
        ) : (
          <>
            <ErrorComponent />{" "}
          </>
        )}
      </>
    )
  ) : (
    <>
      <NoAccessComponent />
    </>
  );
};

export default DefaultLayout(VehicleDataView);
