"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
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
import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [range, setRange] = useLocalStorageDateRange(
    "purchasePaymentReportDate",
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
  const [reportIssueData, setReportIssueData] = useState<any[]>([]);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const fetchPurchasePaymentReport = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    PurchasesService.getPurchasePaymentReport({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setReportIssueData(res?.data.data);
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
    fetchPurchasePaymentReport();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);
  useTableRefreshRegister(fetchPurchasePaymentReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Purchase Payment Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Purchase Payment records</p>
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
                onRefresh={fetchPurchasePaymentReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={reportIssueData}
          noDataViewCondition={
            reportIssueData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-28 text-nowrap">
                Reference
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-nowrap">
                Supplier
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-32 text-nowrap">
                Payment Method
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-32">
                Account
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-32">
                Amount
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-40">
                Date
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {reportIssueData?.map((paymentData: any, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{paymentData?.ref_no}</span></Td>
                  <Td><span className="data-table-primary">{paymentData?.purchase?.supplier?.name}</span></Td>

                  <Td className="capitalize"><span className="data-table-muted">{paymentData?.payment_method === "mobile_banking"
                      ? "Mobile Banking"
                      : paymentData?.payment_method === "bank_transfer"
                        ? "Bank Transfer"
                        : paymentData?.payment_method}</span></Td>
                  <Td><span className="table-amount">{paymentData?.account?.account_name}</span></Td>
                  <Td><span className="table-amount">{paymentData?.amount}</span></Td>
                  <Td><span className="data-table-muted">{formatTimeAgo(paymentData?.createdAt)}</span></Td>
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
