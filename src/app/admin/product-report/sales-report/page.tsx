"use client";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Product Sale Report
                </h1>
              </div>
              <div className="md:flex items-center w-full md:justify-between">
                <CalendarRange range={range} setRange={setRange} />

                <div className="md:w-80 w-full md:mt-0 mt-4">
                  <div className="flex items-center flex-grow">
                    <input
                      type="text"
                      placeholder="Search groups"
                      className="px-2 py-1.5 pr-10 w-full dark:text-gray-300 dark:bg-gray-700 dark:border-gray-500 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <Icon name="search" className="text-gray-400 -ml-9 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={salesData}
          noDataViewCondition={
            salesData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-64 text-blue-900 dark:text-gray-200">
                Title
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                In Transit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Cancelled
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {salesData?.map((sales: IProductOrderReport) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={sales?.product_id}
                >
                  <Td>{sales?.product_title}</Td>
                  <Td>{sales?.total_order}</Td>
                  <Td>{sales?.in_transit}</Td>
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
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
