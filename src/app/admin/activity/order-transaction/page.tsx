"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDate, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { orderTransactionService } from "@admin/@services/apis/Activity/OrderTransaction/orderTransaction.service";

const Page: React.FC = () => {
  const [dailyTransactionData, setTransactionData] = useState<any[]>(
    []
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
    fetchOrderHistoryReport();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchOrderHistoryReport = async () => {
    setTableLoading(true);
    orderTransactionService
      .getOrderTransactionReport({
        page: currentPage,
        limit: ordersPerPage,
        searchTerm: debouncedSearchTerm,
      })
      .then((res: any) => {
        if (res?.success) {
          setTransactionData(res.data.data);
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
  useTableRefreshRegister(fetchOrderHistoryReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Order Transaction Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Order Transaction records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search groups"
                    aria-label="Search groups"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchOrderHistoryReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={dailyTransactionData}
          noDataViewCondition={
            dailyTransactionData.length < 1 ? "No data available" : null
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
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Reference
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Amount
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Trx ID
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Method
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                User
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Note
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {dailyTransactionData?.map(
              (transactionData: any, index: number) => {
                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{formatDate(transactionData?.createdAt)}</span></Td>
                    <Td><span className="data-table-primary">{transactionData?.reference_no}</span></Td>
                    <Td><span className="table-amount">{transactionData?.amount}</span></Td>
                    <Td><span className="data-table-muted">{transactionData?.trx_id}</span></Td>
                    <Td><span className="data-table-muted">{transactionData?.payment_method}</span></Td>
                    <Td><span className="data-table-primary">{transactionData?.user?.name}</span></Td>
                    <Td><span className="data-table-muted">{transactionData?.note}</span></Td>
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
        
      </div>
    </AuthLayout>
  );
};

export default Page;
