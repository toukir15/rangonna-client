"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import MarketingListTable from "@admin/components/pages/Marketing/MarketingListTable";
import MarketingListModal from "@admin/components/pages/Marketing/MarketingListModal";
import { marketingReportService } from "@admin/@services/apis/Marketing/MarketingReport.service";
import {
  IMarketing,
  IMarketingContext,
  IMarketingResponse,
} from "@admin/@interfaces/marketing/marketing.interface";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

export const MarketingContext = createContext<IMarketingContext>(
  {} as IMarketingContext
);

const Page = (): JSX.Element => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [marketingData, setMarketingData] = useState<IMarketing[]>([]);
  const [items, setItems] = useState<IMarketing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const savedPerPage = localStorage.getItem("AccountCategoryPerPage");
    if (savedPerPage) {
      const parsedValue = parseInt(savedPerPage, 10);
      if (!isNaN(parsedValue)) {
        setProductPerPage(parsedValue);
      }
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      getMarketingList();
    }
  }, [currentPage, productPerPage, hasMounted]);

  const handleEditClick = () => {
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "AccountCategoryPerPage",
      newProductPerPage.toString()
    );
    setCurrentPage(1);
  };

  const getMarketingList = () => {
    setTableLoading(true);
    marketingReportService
      .getMarketing({
        page: currentPage,
        limit: productPerPage,
      })
      .then((res: IMarketingResponse) => {
        if (res?.success) {
          setMarketingData(res?.data);
          setTotalProduct(res?.meta.total_record);
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
      const res = await marketingReportService.deleteMarketing(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getMarketingList();
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
  useTableRefreshRegister(getMarketingList);


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
          title="Marketing"
          action={
            permissionList.includes("marketing_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Marketing
              </Button>
            ) : undefined
          }
        />
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Marketing records</p>
            <p className="premium-table-toolbar-meta">
              {totalProduct.toLocaleString()}{" "}
              {totalProduct === 1 ? "record" : "records"}
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start" />
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={getMarketingList}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <MarketingContext.Provider
            value={{
              marketingData,
              tableLoading,
              handleEditClick,
              handleRemove,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              items,
              getMarketingList,
              setItems,
            }}
          >
            <MarketingListModal />
            <MarketingListTable />
          </MarketingContext.Provider>
          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalProduct}
            isShowText={true}
            onRefresh={getMarketingList}
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
