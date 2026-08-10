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
import ReturnListTable from "@admin/components/pages/ReturnLists/ReturnListTable";
import ReturnListModal from "@admin/components/pages/ReturnLists/ReturnListModal";
import { ReturnListService } from "@admin/@services/apis/ReturnList/ReturnList.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import { formatDateRange } from "@admin/utils/hook.utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";

export const ReturnListContext = createContext({} as any);

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

type StatusItem = {
  name: string;
  status: string;
  value?: number;
};

const DEFAULT_RETURN_STATUSES: StatusItem[] = [
  { name: "All", status: "all", value: 0 },
  { name: "Partial", status: "partial-delivery", value: 0 },
  { name: "Return", status: "return", value: 0 },
  { name: "Exchange", status: "exchange", value: 0 },
  { name: "Issue", status: "issue", value: 0 },
  { name: "Close", status: "close", value: 0 },
];

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [returnListData, setReturnListData] = useState<any[]>([]);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [cardLoading, setCardLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE,
  );
  const [cardData, setCardData] = useState<any>();
  const [returnStatuses, setReturnStatuses] = useState<StatusItem[]>(
    DEFAULT_RETURN_STATUSES,
  );

  const handleAddClick = () => {
    setModalMode("Add");
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
      const res = await ReturnListService.getReturnList({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: productPerPage,
        status: filter,
        startDate: formattedFrom,
        endDate: formattedTo,
        domain: "all",
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

  const fetchCartData = async () => {
    if (!isHydrated) return;

    setCardLoading(true);
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    try {
      const res = await ReturnListService.getCartList({
        startDate: formattedFrom,
        endDate: formattedTo,
        domain: "all",
      });

      if (res?.success) {
        const data = res?.data;
        setCardData(data);

        const updatedStatuses: StatusItem[] = [
          { name: "All", status: "all", value: data?.total_count ?? 0 },
          {
            name: "Return",
            status: "return",
            value: data?.return_count ?? 0,
          },
          {
            name: "Exchange",
            status: "exchange",
            value: data?.exchange_count ?? 0,
          },
          { name: "Issue", status: "issue", value: data?.issue_count ?? 0 },
          {
            name: "Partial",
            status: "partial-delivery",
            value: data?.partial_count ?? 0,
          },
          { name: "Close", status: "close", value: data?.close_count ?? 0 },
        ];

        setReturnStatuses(updatedStatuses);
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
      setCardLoading(false);
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

  useEffect(() => {
    if (!isHydrated || !canFetchPageData) return;
    fetchCartData();
  }, [isHydrated, canFetchPageData, range]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    localStorage.setItem("return_list_filter", newFilter);
  };

  const handleStatusUpdate = (id: string) => {
    setUpdateId(id);
    setIsAlertOpen(true);
  };

  const cancelUpdate = () => {
    setIsAlertOpen(false);
    setUpdateId(null);
  };

  const StatusUpdate = async () => {
    if (!updateId) return;

    try {
      const res = await ReturnListService.updateStatus(updateId, {
        status: "close",
      });

      if (res?.success) {
        ToastService.success(res?.message);
        fetchReturnList();
        fetchCartData();
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
      setUpdateId(null);
    }
  };

  useTableRefreshRegister(fetchReturnList);

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Update"
        cancelLabel="Cancel"
        onConfirm={StatusUpdate}
        onCancel={cancelUpdate}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold text-center">Update Status</h3>
        <h6 className="text-md my-4 text-center">
          Are you sure you want to update the status
        </h6>
      </Alert>

      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Return Lists"
          action={
            permissionList.includes("order_return_create") ? (
              <button
                type="button"
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Icon name="add" size={16} />
                Add Return
              </button>
            ) : undefined
          }
        />

        <ReturnListContext.Provider
          value={{
            returnListData,
            tableLoading: tableLoading || cardLoading,
            modalMode,
            setIsModalOpen,
            isModalOpen,
            fetchReturnList,
            handleStatusUpdate,
            cardData,
          }}
        >
          <div className="data-table-card glass-card rounded-2xl orders-table-shell">
            <div className="premium-table-toolbar">
              <p className="premium-table-toolbar-title">Return records</p>
              <p className="premium-table-toolbar-meta">
                {totalExpenses.toLocaleString()}{" "}
                {totalExpenses === 1 ? "return" : "returns"}
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
                    placeholder="Search returns..."
                    aria-label="Search returns"
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
                isCount
                allStatuses={returnStatuses}
                handleFilterChange={handleFilterChange}
              />
            </div>

            <ReturnListTable />

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

          <ReturnListModal />
        </ReturnListContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
