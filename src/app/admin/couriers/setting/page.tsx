"use client";
import { useEffect, useRef, useState } from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { ToastService } from "@admin/utils/toastr.service";
import CouriersTable from "@admin/components/pages/Couriers/CouriersTable";
import AddCouriersModal from "@admin/components/pages/Couriers/AddCouriersModal";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AddStoreModal from "@admin/components/pages/Couriers/AddStoreModal";
import Alert from "@admin/components/core/Aleart/Aleart";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { CourierManagementContext } from "@admin/context/CourierManagementContext";

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [courierData, setCourierData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalStoreOpen, setIsModalStoreOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [items, setItems] = useState<any | null>(null);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<{ id: string } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedCourierType, setSelectedCourierType] = useState<SelectOption>({
    value: "all",
    label: "All Courier",
  });

  const courierTypeOptions: SelectOption[] = [
    { value: "all", label: "All Courier" },
    { value: "pathao", label: "Pathao" },
    { value: "steadfast", label: "SteadFast" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  const providerLabels: Record<string, string> = {
    pathao: "Pathao",
    steadfast: "SteadFast",
  };

  const mapCourierData = (couriers: any[], courierType: string) =>
    couriers.map((courier: any) => {
      const selectedStore = courier?.stores?.find(
        (store: any) => store?.store_id === courier?.store_id
      );
      const provider = courier?.provider || courierType;

      return {
        ...courier,
        courierType: providerLabels[provider] || courierType,
        selectedWebsite: selectedStore
          ? {
              value: selectedStore.store_id,
              label: selectedStore.store_name,
            }
          : { value: "", label: "" },
      };
    });

  const extractCourierList = (res: any) => {
    if (!res?.success) return [];
    const data = res?.data?.data ?? res?.data ?? [];
    return Array.isArray(data) ? data : [];
  };

  const fetchCouriers = async (courierType = selectedCourierType.value) => {
    setTableLoading(true);
    try {
      const res = await CourierService.getCouriers(courierType);
      const list = extractCourierList(res);
      setCourierData(
        mapCourierData(list, courierType === "all" ? "" : courierType)
      );

      if (!res?.success) {
        ToastService.error(res?.message || "Failed to fetch couriers");
      }
    } catch (err: any) {
      ToastService.error(err.message || "Failed to fetch couriers");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers(selectedCourierType.value);
  }, [selectedCourierType]);

  const handleWebsiteChange = (
    pId: string,
    index: number,
    selectedOption: any
  ) => {
    if (!selectedOption) return;
    setCourierData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        selectedWebsite: selectedOption,
        store_id: selectedOption.value,
        store_name: selectedOption.label,
      };
      return newData;
    });

    CourierService.updateStore(pId, {
      store_id: selectedOption.value,
      store_name: selectedOption.label,
    })
      .then((res: any) => {
        if (!res?.success) {
          throw new Error(res?.message);
        }
        ToastService.success(res?.message);
      })
      .catch((err: any) => {
        ToastService.error(err.message);
        setCourierData((prevData) => prevData);
      });
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleEditClick = (data: any) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleStoreAddClick = (data: any) => {
    setItems(data);
    setModalMode("Add");
    setIsModalStoreOpen(true);
  };
  const handleRemove = (id: string) => {
    setRemove({ id });
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;
    try {
      const res = await CourierService.deleteCourier(remove.id);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchCouriers();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("Unexpected error occurred");
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold dark:text-gray-300">
              Courier Settings
            </h1>
            <div>
              <Button
                className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Icon
                  name={isFilterOpen ? "close" : "filter_alt"}
                  size={20}
                />
              </Button>
            </div>
            {permissionList.includes("courier_create") && (
              <Button
                onClick={handleAddClick}
                className="flex items-center !px-3 !bg-green-200 !text-green-500 !py-1.5"
              >
                Add Courier
              </Button>
            )}
          </div>

          {isFilterOpen && (
            <div>
              <AllFilter
                isFilterOpen={isFilterOpen}
                isCourierTypeFilter={true}
                courierTypeOptions={courierTypeOptions}
                selectedCourierType={selectedCourierType}
                setSelectedCourierType={setSelectedCourierType}
              />
            </div>
          )}
        </div>
      </NoScrollLayout>
      <div className="md:p-4 p-4 ">
        <CourierManagementContext.Provider
          value={{
            courierData,
            tableLoading,
            handleWebsiteChange,
            fetchCouriers,
            isModalOpen,
            setIsModalOpen,
            modalMode,
            items,
            handleEditClick,
            popupRef,
            popupIndex,
            togglePopup,
            handleStoreAddClick,
            isModalStoreOpen,
            setIsModalStoreOpen,
            handleRemove,
          }}
        >
          <CouriersTable />
          <AddCouriersModal />
          <AddStoreModal />
        </CourierManagementContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
