"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { DepositService } from "@admin/@services/apis/Account/Deposit/Deposit.service";
import { DepositContextType } from "@admin/@interfaces/account/deposit/deposit";
import DepositTable from "@admin/components/pages/Deposit/DepositTable";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import { formatDateRange } from "@admin/utils/hook.utils";
import CourierDeposit from "@admin/components/pages/Deposit/CourierDeposit";
import PageHeader from "@admin/components/layout/PageHeader";
import { Plus } from "lucide-react";

export const DepositContext = createContext({} as DepositContextType);

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [deposit, setDeposit] = useState<any[]>([]);
  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [range, setRange] = useLocalStorageDateRange(
    "depositDateRange",
    DEFAULT_DATE_RANGE,
  );

  const handleEditClick = (data: any) => {
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
    localStorage.setItem("productListPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getDeposit = () => {
    setTableLoading(true);
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    DepositService.getDeposit({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setDeposit(res?.data.data);
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
    getDeposit();
  }, [debouncedSearchTerm, currentPage, productPerPage, range]);

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
      const res = await DepositService.deleteDeposit(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getDeposit();
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

  useTableRefreshRegister(getDeposit);

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
          Are you sure you want to remove this deposit?
        </h6>
        <div className="flex flex-wrap items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>

      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4">
        <PageHeader
          title="Deposits"
          action={
            hasPermission(permissionList, "account_deposit_create") ? (
              <button
                type="button"
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Record Deposit
              </button>
            ) : undefined
          }
        />

        <DepositContext.Provider
          value={{
            deposit,
            tableLoading,
            handleEditClick,
            handleRemove,
            modalMode,
            items,
            setIsModalOpen,
            isModalOpen,
            getDeposit,
          }}
        >
          <DepositTable
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            range={range}
            setRange={setRange}
            onRefresh={getDeposit}
          >
            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalProduct}
              isShowText={true}
              onRefresh={getDeposit}
              isLoading={tableLoading}
              showRefresh={false}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          </DepositTable>
          <CourierDeposit />
        </DepositContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
