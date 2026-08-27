"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDateRange, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import { productReportService } from "@admin/@services/apis/ProductReport/ProductReport.service";
import {
  ICategorySalesReportItem,
  ICategorySalesReportResponse,
} from "@admin/@interfaces/productReport/categoryReport.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [categoryData, setCategoryData] = useState<ICategorySalesReportItem[]>(
    [],
  );
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [range, setRange] = useLocalStorageDateRange(
    "categoryReportDateRange",
    DEFAULT_DATE_RANGE,
  );
  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("categoryLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchCategoryReport();
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchCategoryReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    productReportService
      .getCategoryReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: ICategorySalesReportResponse) => {
        if (res?.success) {
          setCategoryData(res.data.data);
          setTotalOrders(res?.data?.meta?.total_record);
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
  useTableRefreshRegister(fetchCategoryReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Category Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Category records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search records..."
                    aria-label="Search records"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchCategoryReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={categoryData}
          noDataViewCondition={
            categoryData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-48">
                Title
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                In Transit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Cancelled
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {categoryData?.map(
              (category: ICategorySalesReportItem, index: number) => {
                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{category?.product_category}</span></Td>
                    <Td><span className="table-amount">{category?.total_order}</span></Td>
                    <Td><span className="table-amount">{category?.in_transit}</span></Td>
                    <Td>
                      {category?.delivery}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.delivery || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {category?.canceled}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.canceled || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {category?.return}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.return || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {category?.refunded}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.refunded || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                  </Tr>
                );
              },
            )}
          </Tbody>
        </TableWrapper>
          <PaginationComponent
          ordersPerPage={ordersPerPage}
          handleOrdersPerPageChange={handleLogsPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalData={totalOrders}
            isShowText={true}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default Page;
