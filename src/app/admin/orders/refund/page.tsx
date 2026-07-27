"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import { useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import { formatDateRange } from "@admin/utils/hook.utils";
import { noPermission } from "@admin/utils/constant";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import RefundTab from "@admin/components/pages/RefundList/RefundTab";
import RefundTable from "@admin/components/pages/RefundList/RefundTable";
import RefundModal from "@admin/components/pages/RefundList/RefundModal";
import { RefundListService } from "@admin/@services/apis/RefundList/RefundList.service";

export const RefundListContext = createContext({} as any);

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

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
  const [isHydrated, setIsHydrated] = useState(false);  const [filter, setFilter] = useState<string>("all");
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
        setTotalExpenses(res?.data?.meta?.total_record || 0);      } else {
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
      <NoScrollLayout>
        <div className="md:flex flex-wrap items-center items-center gap-3 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 mb-2">
          <div className="flex flex-wrap items-center items-center gap-4 ">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              Refund Lists
            </h2>
              <AllFilter
              isCalendarFilter={true}
              range={range}
              setRange={setRange}
            />
            <div>
              {permissionList.includes("order_refund_create") && (
                <Button
                  className="flex items-center !bg-green-100 !text-green-500 !px-4 !py-1.5"
                  onClick={handleAddClick}
                >
                  <span className="ml-1">Add Refund</span>
                </Button>
              )}
            </div>
          </div>
          <div className="md:w-80 w-full md:my-0 my-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              wrapperClass="w-full"
            />
          </div>
        </div>
        <div className="px-4 lg:mt-0">
          <RefundTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            IsSearch={false}
            isCount={true}
          />
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
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
            <RefundTable />
            <RefundModal />
          </RefundListContext.Provider>

          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalExpenses}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
