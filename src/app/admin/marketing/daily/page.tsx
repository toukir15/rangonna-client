"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm px-4 py-3">
            <h1 className="2xl:text-2xl lg:text-xl text-lg font-bold text-gray-800 dark:text-gray-100">
              Daily Report
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              All domains report overview
            </p>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full mt-3">
        <TableWrapper
          showCheckbox={true}
          data={dailyProfitData}
          noDataViewCondition={
            dailyProfitData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                RD
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Delivered
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Cancelled
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {dailyProfitData?.map((profitData: IDailyReport, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{formatDate(profitData?.date)}</Td>
                  <Td>{profitData?.totalOrder}</Td>
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
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
