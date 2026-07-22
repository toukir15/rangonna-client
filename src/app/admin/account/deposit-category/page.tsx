"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import DepositCategoryModal from "@admin/components/pages/DepositCategory/DepositCategoryModal";
import { DepositCategoryService } from "@admin/@services/apis/DepositCategory/DepositCategory.service";
import {
  DepositCategoryContextType,
  IDepositCategoryData,
} from "@admin/@interfaces/account/deposit-category/deposit-category";
import DepositCategoryTable from "@admin/components/pages/DepositCategory/DepositCategoryTable";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import PageSearch from "@admin/components/core/Search/PageSearch";


export const DepositCategoryContext = createContext(
  {} as DepositCategoryContextType
);

type IPriorityPayload = {
  _id: string;
  priority: number;
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const [depositCategoryData, setDepositCategoryData] = useState<
    IDepositCategoryData[]
  >([]);
  const [priorityDepositCategoryData, setPriorityDepositCategoryData] =
    useState<IDepositCategoryData[]>([]);

  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [priorityUpdateLoading, setPriorityUpdateLoading] =
    useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const [items, setItems] = useState<IDepositCategoryData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [isPriorityEditMode, setIsPriorityEditMode] = useState<boolean>(false);

  const [activeToggleLoading, setActiveToggleLoading] = useState<
    Record<string, boolean>
  >({});

  const handleAddClick = () => {
    setItems(null);
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IDepositCategoryData) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "depositCategoryPerPage",
      newProductPerPage.toString()
    );
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getDepositCategory = () => {
    setTableLoading(true);

    DepositCategoryService.getDepositCategory({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          const list = res?.data?.data || [];
          setDepositCategoryData(list);
          setPriorityDepositCategoryData(list);
          setTotalExpenses(Number(res?.data?.meta?.total_record) || 0);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const getAllDepositCategoryForPriority = async () => {
    try {
      setTableLoading(true);

      const res = await DepositCategoryService.getDepositCategory({
        searchTerm: "",
        page: 1,
        limit: totalExpenses || 1000,
      });

      if (res?.success) {
        const list = res?.data?.data || [];
        setPriorityDepositCategoryData(list);
        setIsPriorityEditMode(true);
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
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("depositCategoryPerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
  }, []);

  useEffect(() => {
    if (!isPriorityEditMode) {
      getDepositCategory();
    }
  }, [debouncedSearchTerm, currentPage, productPerPage, isPriorityEditMode]);

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;

    try {
      const res = await DepositCategoryService.deleteDepositCategory(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getDepositCategory();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const handleTogglePriorityEditMode = async () => {
    if (isPriorityEditMode) {
      setIsPriorityEditMode(false);
      setPriorityDepositCategoryData(depositCategoryData);
      getDepositCategory();
    } else {
      await getAllDepositCategoryForPriority();
    }
  };

  const handlePriorityUpdate = async () => {
    const payload: IPriorityPayload[] = priorityDepositCategoryData.map(
      (item, index) => ({
        _id: item._id,
        priority: index + 1,
      })
    );

    try {
      setPriorityUpdateLoading(true);

      const res = await DepositCategoryService.updateDepositCategoryPriority(
        payload
      );

      if (res?.success) {
        ToastService.success(res?.message || "Priority updated successfully");
        setIsPriorityEditMode(false);
        getDepositCategory();
      } else {
        ToastService.error(res?.message || "Failed to update priority");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("Unexpected error occurred");
      }
    } finally {
      setPriorityUpdateLoading(false);
    }
  };

  const toggleIsActive = (item: any) => {
    setActiveToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    DepositCategoryService.updateDepositToggle(item?._id, {
      is_active: !item.is_active,
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          getDepositCategory();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setActiveToggleLoading((prev) => ({ ...prev, [item._id]: false }));
      });
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
        <div className="md:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-3">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              Deposit Category
            </h2>
            <div className="flex mt-2 sm:mt-0 gap-2 flex-wrap">
              {hasPermission(permissionList, "account_deposit_category_create") &&
                !isPriorityEditMode && (
                  <Button
                    className="flex items-center !bg-green-200 !text-green-600 !px-4 !py-1.5"
                    onClick={handleAddClick}
                  >

                    <span className="ml-1">Add Category</span>
                  </Button>
                )}
              {permissionList.includes("setting_priority_edit") && (
                <Button
                  className={`flex items-center !px-4 !py-1.5 ${isPriorityEditMode ? "bg-orange-500" : "bg-indigo-500"
                    }`}
                  onClick={handleTogglePriorityEditMode}
                >
                  <Icon name="filter_list" />
                  <span className="">{isPriorityEditMode ? "Cancel" : ""}</span>
                </Button>
              )}

              {isPriorityEditMode && (
                <Button
                  className="flex items-center bg-green-600 !px-4 !py-1.5"
                  onClick={handlePriorityUpdate}
                  disabled={priorityUpdateLoading}
                >
                  <Icon name="assignment_turned_in" className="me-1" />{" "}
                  {priorityUpdateLoading ? "Updating..." : "Update"}
                </Button>
              )}
            </div>
          </div>
          {!isPriorityEditMode && (
            <div className="md:w-80  w-full md:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          )}
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="md:mt-0 mt-2">
          <DepositCategoryContext.Provider
            value={{
              depositCategoryData: isPriorityEditMode
                ? priorityDepositCategoryData
                : depositCategoryData,
              tableLoading,
              handleEditClick,
              handleRemove,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              items,
              getDepositCategory,
              isPriorityEditMode,
              setPriorityDepositCategoryData,
              activeToggleLoading,
              toggleIsActive,
            }}
          >
            <DepositCategoryTable />
            <DepositCategoryModal />
          </DepositCategoryContext.Provider>

          {!isPriorityEditMode && (
            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalExpenses}
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
