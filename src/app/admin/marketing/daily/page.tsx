"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDate } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import {
  IDailyReport,
  IDailyReportResponse,
} from "@admin/@interfaces/orderReport/dailyReport.interface";

const Page: React.FC = () => {
  const [dailyProfitData, setProfitData] = useState<IDailyReport[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage) || 1;

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const fetchDailyReport = async () => {
    setTableLoading(true);
    OrderReportProfitService.getDailyProfit({
      page: currentPage,
      limit: ordersPerPage,
      domain: "all",
    })
      .then((res: IDailyReportResponse) => {
        if (res?.success) {
          setProfitData(res.data.data);
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

  useEffect(() => {
    fetchDailyReport();
  }, [currentPage, ordersPerPage]);

  useTableRefreshRegister(fetchDailyReport);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Daily Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Daily records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchDailyReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={dailyProfitData}
          noDataViewCondition={
            dailyProfitData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                RD
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Delivered
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
            {dailyProfitData?.map((profitData: IDailyReport, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{formatDate(profitData?.date)}</span></Td>
                  <Td><span className="table-amount">{profitData?.totalOrder}</span></Td>
                  <Td>
                    {profitData?.readyForBox}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.readyForBox || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {profitData?.delivered}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.delivered || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {profitData?.cancelled}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.cancelled || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {profitData?.returned}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.returned || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {profitData?.refunded}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.refunded || 0) /
                          (profitData?.totalOrder || 1)) *
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
