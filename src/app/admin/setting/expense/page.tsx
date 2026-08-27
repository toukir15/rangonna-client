"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
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
  useTableRefreshRegister(getReportCategory);


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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Expense Setting"
          action={
            permissionList.includes("account_settings_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Expense
              </Button>
            ) : undefined
          }
        />
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Expense setting records</p>
            <p className="premium-table-toolbar-meta">
              {reportIssueData.length.toLocaleString()}{" "}
              {reportIssueData.length === 1 ? "record" : "records"}
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              <label className="data-table-search">
                <Icon name="search" variant="outlined" size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                />
              </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={getReportCategory}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
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
