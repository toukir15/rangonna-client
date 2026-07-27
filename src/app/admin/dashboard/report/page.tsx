"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
// import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import {
  IOrderSkipTwentySummaryItem,
  IOrderSkipTwentySummaryResponse,
} from "@admin/@interfaces/dashboard/dashboard.interface";
import { dashBoardService } from "@admin/@services/apis/DashboardService/Dashboard.service";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";


const Page: React.FC = () => {
  const [reportSummaryData, setReportSummaryData] = useState<
    IOrderSkipTwentySummaryItem[]
  >([]);
  // const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [totalOrders, setTotalOrders] = useState<number>(0);
  // const totalPages = Math.ceil(totalOrders / ordersPerPage);  // default: current month will be passed
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());

  // const handleLogsPerPageChange = (newLogsPerPage: number) => {
  //   setOrdersPerPage(newLogsPerPage);
  //   localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  // };

  useEffect(() => {
    fetchMarOrderSummaryReport();
  }, [ selectedMonth]);
  // currentPage, ordersPerPage,

  const formatMonth = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${month}-${year}`;
  };

  const fetchMarOrderSummaryReport = async () => {
    setTableLoading(true);
    dashBoardService.getOrderSkipTwentySummary({
      page: 1,
      limit: 12,
      ...(selectedMonth ? { month: formatMonth(selectedMonth) } : {}),
    })
      .then((res: IOrderSkipTwentySummaryResponse) => {
        if (res?.success) {
          setReportSummaryData(res?.data?.data ?? []);
          // setTotalOrders(res?.data?.meta?.total ?? 0);
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

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-US").format(value ?? 0);

  const formatMonthLabel = (value?: string) => {
    if (!value) return "";
    const [mmRaw, yyyy] = value.split("-");
    const mm = Number.parseInt(mmRaw ?? "", 10);
    if (!Number.isFinite(mm) || !yyyy) return value;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const name = monthNames[mm - 1];
    return name ? `${name}-${yyyy}` : value;
  };
  useTableRefreshRegister(fetchMarOrderSummaryReport);




  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex flex-wrap items-center items-center md:space-x-4 w-full">
              <div className="flex flex-wrap items-center items-center gap-3">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                    Dashboard Report
                </h1>
              <AllFilter
              isDateFilter={true}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
              </div>
            </div>
          </div>
          
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={reportSummaryData}
          noDataViewCondition={
            reportSummaryData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[600px]"
          isLoading={tableLoading}
          colValue={2}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                Month
              </Th>
              {/* <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th> */}
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Total Amount
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {reportSummaryData?.map(
              (summaryData: IOrderSkipTwentySummaryItem, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>
                      {formatMonthLabel(summaryData?.month)}
                    </Td>
                    {/* <Td>{summaryData?.total_order}</Td> */}
                    <Td>{formatAmount(summaryData?.total_amount)}</Td>
                  </Tr>
                );
              }
            )}
          </Tbody>
        </TableWrapper>

        {/* <PaginationComponent
          ordersPerPage={ordersPerPage}
          handleOrdersPerPageChange={handleLogsPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalData={totalOrders}
        /> */}


      </div>
    </AuthLayout>
  );
};

export default Page;
