"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Dashboard Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Dashboard records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
              isDateFilter={true}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchMarOrderSummaryReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={reportSummaryData}
          noDataViewCondition={
            reportSummaryData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={2}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">
                Month
              </Th>
              {/* <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total Order
              </Th> */}
              <Th className="2xl:min-w-20 lg:min-w-32 min-w-20">
                Total Amount
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {reportSummaryData?.map(
              (summaryData: IOrderSkipTwentySummaryItem, index: number) => {
                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{formatMonthLabel(summaryData?.month)}</span></Td>
                    {/* <Td><span className="table-amount">{summaryData?.total_order}</span></Td> */}
                    <Td><span className="table-amount">{formatAmount(summaryData?.total_amount)}</span></Td>
                  </Tr>
                );
              }
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
        {/*  */}
      </div>
    </AuthLayout>
  );
};

export default Page;
