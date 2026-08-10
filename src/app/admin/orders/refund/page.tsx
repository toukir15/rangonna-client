"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import { formatDateRange } from "@admin/utils/hook.utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import RefundTable from "@admin/components/pages/RefundList/RefundTable";
import RefundModal from "@admin/components/pages/RefundList/RefundModal";
import { RefundListService } from "@admin/@services/apis/RefundList/RefundList.service";
import PageHeader from "@admin/components/layout/PageHeader";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";

export const RefundListContext = createContext({} as any);

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const REFUND_STATUSES = [
  { status: "all", name: "All Status" },
  { status: "pending", name: "Pending" },
  { status: "processing", name: "Processing" },
  { status: "completed", name: "Completed" },
  { status: "rejected", name: "Rejected" },
];

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [returnListData, setReturnListData] = useState<any[]>([]);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [statusUpdateOnly, setStatusUpdateOnly] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE,
  );

  const handleAddClick = () => {
    setModalMode("Add");
    setSelectedRefund(null);
    setStatusUpdateOnly(false);
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    setCurrentPage(1);
    localStorage.setItem("ProductBrandPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchReturnList = async () => {
    if (!isHydrated) return;

    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setTableLoading(true);

    try {
      const res = await RefundListService.getRefundList({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: productPerPage,
        status: filter,
        startDate: formattedFrom,
        endDate: formattedTo,
      });

      if (res?.success) {
        setReturnListData(res?.data?.data || []);
        setTotalExpenses(res?.data?.meta?.total_record || 0);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("ProductBrandPerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }

    const savedFilter = localStorage.getItem("return_list_filter");
    if (savedFilter) {
      setFilter(savedFilter);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !canFetchPageData) return;
    fetchReturnList();
  }, [
    isHydrated,
    canFetchPageData,
    range,
    filter,
    debouncedSearchTerm,
    currentPage,
    productPerPage,
  ]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    localStorage.setItem("return_list_filter", newFilter);
  };
  useTableRefreshRegister(fetchReturnList);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Refund Lists"
          action={
            permissionList.includes("order_refund_create") ? (
              <button
                type="button"
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Icon name="add" size={16} />
                Add Refund
              </button>
            ) : undefined
          }
        />

        <RefundListContext.Provider
          value={{
            returnListData,
            tableLoading: tableLoading,
            modalMode,
            setModalMode,
            setIsModalOpen,
            isModalOpen,
            fetchReturnList,
            selectedRefund,
            setSelectedRefund,
            statusUpdateOnly,
            setStatusUpdateOnly,
          }}
        >
          <div className="data-table-card glass-card rounded-2xl orders-table-shell">
            <div className="premium-table-toolbar">
              <p className="premium-table-toolbar-title">Refund records</p>
              <p className="premium-table-toolbar-meta">
                {totalExpenses.toLocaleString()}{" "}
                {totalExpenses === 1 ? "refund" : "refunds"}
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
                    placeholder="Search refunds..."
                    aria-label="Search refunds"
                  />
                </label>
                <AllFilter
                  isCalendarFilter={true}
                  range={range}
                  setRange={setRange}
                />
              </div>
            </div>

            <div className="px-4 pb-3">
              <OrdersTab
                filter={filter}
                handleFilterChange={handleFilterChange}
                allStatuses={REFUND_STATUSES}
              />
            </div>

            <RefundTable />

            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalExpenses}
              onRefresh={fetchReturnList}
              isLoading={tableLoading}
              showRefresh={false}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          </div>

          <RefundModal />
        </RefundListContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
