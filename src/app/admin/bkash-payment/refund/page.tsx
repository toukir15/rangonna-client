"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import React, { useState, useEffect, createContext } from "react";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { IWarehouse } from "@admin/@interfaces/setting/warehouse/warehouse.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import RefundTable from "@admin/components/pages/BkashPayment/Refund/RefundTable";
import RefundModal from "@admin/components/pages/BkashPayment/Refund/RefundModal";
import { RefundService } from "@admin/@services/apis/BkashPayment/Refund/Refund.service";

export const BkashPaymentContext = createContext<any>({} as any);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [activeToggleLoading, setActiveToggleLoading] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [warehouseData, setWarehouseData] = useState<IWarehouse[]>([]);
  const [items, setItems] = useState<IWarehouse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const handleEditClick = (data: IWarehouse) => {
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
    localStorage.setItem("RefundPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getRefund = () => {
    return;
    setTableLoading(true);
    RefundService.getRefund({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res) => {
        if (res?.success) {
          setWarehouseData(res?.data.data);
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
    const savedExpensesPerPage = localStorage.getItem("WarehousePerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
    getRefund();
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
    if (!remove) return;
    try {
      const res = await RefundService.deleteRefund(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getRefund();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("An unexpected error occurred");
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
    }
  };

  const toggleIsActive = (item: IWarehouse) => {
    setActiveToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    RefundService.updateRefund(item?._id, {
      is_active: !item.is_active,
    })
      .then((res) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          getRefund();
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
  useTableRefreshRegister(getRefund);


  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
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
          title="Bkash Refund"
          action={
            permissionList.includes("ware_c") ? (
              <Button
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Refund
              </Button>
            ) : undefined
          }
        />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Refund records</p>
            <p className="premium-table-toolbar-meta">
              {totalProduct.toLocaleString()}{" "}
              {totalProduct === 1 ? "refund" : "refunds"}
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
                onRefresh={getRefund}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <BkashPaymentContext.Provider
            value={{
              warehouseData,
              tableLoading,
              toggleIsActive,
              activeToggleLoading,
              handleEditClick,
              handleRemove,
              modalMode,
              items,
              setIsModalOpen,
              getRefund,
              isModalOpen,
            }}
          >
            <RefundTable />
            <RefundModal />
          </BkashPaymentContext.Provider>
          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalProduct}
            isShowText={true}
            onRefresh={getRefund}
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
