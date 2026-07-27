"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useMemo, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
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
    fetchWebList();
  }, []);

  useEffect(() => {
    fetchUserReport();
    fetchMonthlyDeliveryReport();
  }, [range, currentPage, ordersPerPage, selectedWebsite]);

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item.web_name,
            value: item.web_url,
          }));

          setWebsiteOptions([
            { value: "all", label: "All Website" },
            ...options,
          ]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchUserReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.userReport({
      page: currentPage,
      limit: ordersPerPage,
      domain: selectedWebsite.value,
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
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="flex flex-wrap items-center items-center gap-3 w-full pb-2 ">
            <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 text-nowrap">
              User Report
            </h1>
              <AllFilter
                isWebsiteFilter={true}
                websiteOptions={websiteOptions}
                selectedWebsite={selectedWebsite}
                setSelectedWebsite={setSelectedWebsite}
                isCalendarFilter={true}
                range={range} setRange={setRange}
              />
          </div>
          
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={mergedData}
          noDataViewCondition={mergedData.length < 1 ? "No data available" : null}
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Name
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Total Order
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Delivered
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Cancelled
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Returned
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Refunded
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Monthly Delivery
              </Th>
            </Tr>
          </Thead>

          <Tbody className="dark:bg-gray-800 bg-white">
            {mergedData?.map((report: any, index: number) => {
              const validOrders =
                (report?.totalOrder || 0) - (report?.cancelled || 0);

              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={report?.userId || index}
                >
                  <Td>{report?.userName}</Td>

                  <Td>{report?.totalOrder || 0}</Td>

                  <Td>
                    {report?.delivered || 0}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((report?.delivered || 0) / (validOrders || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>

                  <Td>
                    {report?.cancelled || 0}
                    <span className="ml-2 text-xs text-gray-500">
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
                    {report?.returned || 0}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((report?.returned || 0) / (validOrders || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>

                  <Td>
                    {report?.refunded || 0}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((report?.refunded || 0) / (validOrders || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>

                  <Td>{report?.monthlyDelivered || 0}</Td>
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