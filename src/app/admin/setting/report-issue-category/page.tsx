"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import ReportIssueCategoryModal from "@admin/components/pages/Settings/ReportIssueCategory/ReportIssueCategoryModal";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import ReportIssueCategoryTable from "@admin/components/pages/Settings/ReportIssueCategory/ReportIssueCategoryTable";
import {
  IReportIssueCategory,
  IReportIssueCategoryContextType,
  IReportIssueCategoryResponse,
} from "@admin/@interfaces/setting/reportIssueCategory/reporIssueCategory.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

export const ReportIssueCategoryContext =
  createContext<IReportIssueCategoryContextType>(
    {} as IReportIssueCategoryContextType
  );

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [reportIssueData, setReportIssueData] = useState<
    IReportIssueCategory[]
  >([]);
  const [items, setItems] = useState<IReportIssueCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const handleEditClick = (data: IReportIssueCategory) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("reportIssuePerPage", newProductPerPage.toString());
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("reportIssuePerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
  }, [debouncedSearchTerm, currentPage, productPerPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getReportCategory = () => {
    setTableLoading(true);
    ReportIssueCategoryService.getReportIssueCategory({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: IReportIssueCategoryResponse) => {
        if (res?.success) {
          setReportIssueData(res?.data.data);
          setTotalProduct(res?.data.meta.total_record);
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
  }, [debouncedSearchTerm, currentPage, productPerPage]);

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
      const res = await ReportIssueCategoryService.deleteReportIssue(remove);
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
          title="Report Issue Category"
          action={
            permissionList.includes("setting_report_issue_category_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Report Issue
              </Button>
            ) : undefined
          }
        />
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Issue category records</p>
            <p className="premium-table-toolbar-meta">
              {totalProduct.toLocaleString()}{" "}
              {totalProduct === 1 ? "category" : "categories"}
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
          <ReportIssueCategoryContext.Provider
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
            <ReportIssueCategoryTable />
            <ReportIssueCategoryModal />
          </ReportIssueCategoryContext.Provider>
          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalProduct}
            isShowText={true}
            onRefresh={getReportCategory}
            isLoading={tableLoading}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
