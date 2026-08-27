"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { OrderActivityService } from "@admin/@services/apis/RepoetService/OrderActivity.service";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Order Activity" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Order Activity records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CalendarRange
                  range={range}
                  setRange={setRange}
                  className="sm:w-72 w-full"
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
                onRefresh={getActivityLogs}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={logsData}
          noDataViewCondition={logsData.length < 1 ? "No data available" : null}
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={4}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Order ID
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Message
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Name
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-40">
                Date & Time
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {logsData?.map((logs: any, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="table-amount">{logs?.order_sysid}</span></Td>

                  <Td><span className="data-table-primary">{logs?.log_message}</span></Td>
                  <Td><span className="data-table-primary">{logs?.user_name}</span></Td>

                  <Td><span className="data-table-muted">{formatTimeAgo(logs?.updatedAt)}</span></Td>
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
