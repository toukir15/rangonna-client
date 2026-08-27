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
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import { productReportService } from "@admin/@services/apis/ProductReport/ProductReport.service";
import {
  IProductOrderReport,
  IProductSalesResponse,
} from "@admin/@interfaces/productReport/saleReport.interface";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [salesData, setSalesData] = useState<IProductOrderReport[]>([]);
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
    "salesReportRangeDate",
    DEFAULT_DATE_RANGE
  );

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchMonthlyProfit();
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchMonthlyProfit = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    productReportService
      .getSalesReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,

        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: IProductSalesResponse) => {
        if (res?.success) {
          setSalesData(res.data.data);
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
  useTableRefreshRegister(fetchMonthlyProfit);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Product Sale Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Product Sale records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CalendarRange range={range} setRange={setRange} />
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search groups"
                    aria-label="Search groups"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchMonthlyProfit}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={salesData}
          noDataViewCondition={
            salesData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-64">
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
            {salesData?.map((sales: IProductOrderReport) => {
              return (
                <Tr key={sales?.product_id}
                >
                  <Td><span className="data-table-primary">{sales?.product_title}</span></Td>
                  <Td><span className="table-amount">{sales?.total_order}</span></Td>
                  <Td><span className="table-amount">{sales?.in_transit}</span></Td>
                  <Td>
                    {sales?.delivery}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((sales?.delivery || 0) / (sales?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {sales?.canceled}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((sales?.canceled || 0) / (sales?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {sales?.return}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((sales?.return || 0) / (sales?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {sales?.refunded}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((sales?.refunded || 0) / (sales?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                </Tr>
              );
            })}
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
