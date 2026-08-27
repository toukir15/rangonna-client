"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout from "@admin/layouts/AuthLayout";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useMemo, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );
  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchUserReport();
    fetchMonthlyDeliveryReport();
  }, [range, currentPage, ordersPerPage]);

  const fetchUserReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.userReport({
      page: currentPage,
      limit: ordersPerPage,
      domain: "all",
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setReportData(res?.data?.data || []);
          setTotalOrders(res?.data?.meta?.total_record || 0);
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

  const fetchMonthlyDeliveryReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.userMonthlyReport({
      page: currentPage,
      limit: ordersPerPage,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setMonthlyData(res?.data?.data || []);
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

  const mergedData = useMemo(() => {
    const monthlyMap = Object.fromEntries(
      monthlyData.map((item: any) => [item.userId, item])
    );

    return reportData.map((user: any) => ({
      ...user,
      monthlyDelivered: monthlyMap[user.userId]?.delivered || 0,
    }));
  }, [reportData, monthlyData]);
  useTableRefreshRegister(fetchUserReport);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="User Report" />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">User report records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} items
            </p>
          </div>

          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              <AllFilter
                isCalendarFilter={true}
                range={range} setRange={setRange}
              />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchUserReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <TableWrapper
            showCheckbox={false}
            data={mergedData}
            noDataViewCondition={mergedData.length < 1 ? "No data available" : null}
            isSwitchOn={true}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
            isLoading={tableLoading}
            colValue={7}
          >
            <Thead>
              <Tr>
                <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Name</Th>
                <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Total Order</Th>
                <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Delivered</Th>
                <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Cancelled</Th>
                <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Returned</Th>
                <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Refunded</Th>
                <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Monthly Delivery</Th>
              </Tr>
            </Thead>

            <Tbody>
              {mergedData?.map((report: any, index: number) => {
                const validOrders =
                  (report?.totalOrder || 0) - (report?.cancelled || 0);

                return (
                  <Tr key={report?.userId || index}>
                    <Td>
                      <span className="data-table-primary">{report?.userName}</span>
                    </Td>

                    <Td>
                      <span className="table-amount">{report?.totalOrder || 0}</span>
                    </Td>

                    <Td>
                      <span className="table-amount">{report?.delivered || 0}</span>
                      <span className="data-table-muted ml-2">
                        (
                        {(
                          ((report?.delivered || 0) / (validOrders || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>

                    <Td>
                      <span className="table-amount">{report?.cancelled || 0}</span>
                      <span className="data-table-muted ml-2">
                        (
                        {(
                          ((report?.cancelled || 0) /
                            (report?.totalOrder || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>

                    <Td>
                      <span className="table-amount">{report?.returned || 0}</span>
                      <span className="data-table-muted ml-2">
                        (
                        {(
                          ((report?.returned || 0) / (validOrders || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>

                    <Td>
                      <span className="table-amount">{report?.refunded || 0}</span>
                      <span className="data-table-muted ml-2">
                        (
                        {(
                          ((report?.refunded || 0) / (validOrders || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>

                    <Td>
                      <span className="table-amount">
                        {report?.monthlyDelivered || 0}
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
            showRefresh={false}
            isShowText={true}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;