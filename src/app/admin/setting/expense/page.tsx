"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import ExpenseSettingModal from "@admin/components/pages/Settings/ExpenseCategory/ExpenseSettingModal";
import ExpenseSettingTable from "@admin/components/pages/Settings/ExpenseCategory/ExpenseSettingTable";
import { ExpenseSettingService } from "@admin/@services/apis/SettingsService/ExpenseSettings/ExpenseSetting.service";

export const ExpenseSettingContext = createContext<any>({} as any);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [reportIssueData, setReportIssueData] = useState<any[]>([]);
  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const handleEditClick = (data: any) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("reportIssuePerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
  }, [debouncedSearchTerm, productPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getReportCategory = () => {
    setTableLoading(true);
    ExpenseSettingService.getExpenseSetting({
      searchTerm: debouncedSearchTerm,
      page: 1,
      limit: 50,
    })
      .then((res: any) => {
        if (res?.success) {
          setReportIssueData(res?.data);
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

  useEffect(() => {
    getReportCategory();
  }, [debouncedSearchTerm, productPerPage]);

  const handleRemove = (id: string) => {
    setRemove(id);
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
      const res = await ExpenseSettingService.deleteExpenseSetting(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getReportCategory();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
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
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 ">
          <div className="md:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
                Expense Setting
              </h2>
              {permissionList.includes("account_settings_create") && (
                <Button
                  className="!bg-green-200 !text-green-600 !py-1.5 !px-4 text-nowrap"
                  onClick={handleAddClick}
                >
                  Add Expense
                </Button>
              )}
            </div>
            <div className="md:w-80 w-full md:mt-0 mt-4">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <ExpenseSettingContext.Provider
            value={{
              reportIssueData,
              tableLoading,
              handleEditClick,
              handleRemove,
              modalMode,
              items,
              setIsModalOpen,
              getReportCategory,
              isModalOpen,
            }}
          >
            <ExpenseSettingTable />
            <ExpenseSettingModal />
          </ExpenseSettingContext.Provider>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
