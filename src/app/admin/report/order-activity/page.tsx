"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { OrderActivityService } from "@admin/@services/apis/RepoetService/OrderActivity.service";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import {
  formatDateRange,
  formatTimeAgo,
  useDebounce,
} from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import PageSearch from "@admin/components/core/Search/PageSearch";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [logsData, setLogsData] = useState<any[]>([]);
  const [range, setRange] = useLocalStorageDateRange(
    "orderActivityRange",
    DEFAULT_DATE_RANGE
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

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    getActivityLogs();
  }, [debouncedSearchTerm, range, currentPage, ordersPerPage]);

  const getActivityLogs = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderActivityService.getActivityLogs({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setLogsData(res.data.data);
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
  useTableRefreshRegister(getActivityLogs);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 text-nowrap">
                Order Activity
              </h1>

              <div className="sm:flex items-center w-full justify-between">
                <CalendarRange
                  range={range}
                  setRange={setRange}
                  className="sm:w-72 w-full"
                />

                <div className="sm:w-80 w-full sm:mt-0 mt-2">
                  <PageSearch
                    value={searchTerm}
                    onChange={handleSearchChange}
                    wrapperClass="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={logsData}
          noDataViewCondition={logsData.length < 1 ? "No data available" : null}
          isSwitchOn={true}
          className="min-h-[500px]"
          isLoading={tableLoading}
          colValue={4}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Order ID
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Message
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-40 dark:text-gray-200">
                Date & Time
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {logsData?.map((logs: any, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{logs?.order_sysid}</Td>

                  <Td>{logs?.log_message}</Td>
                  <Td>{logs?.user_name}</Td>

                  <Td>{formatTimeAgo(logs?.updatedAt)}</Td>
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
