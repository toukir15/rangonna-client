"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                Order Transaction Report
              </h1>

              <div className="md:flex items-center w-full justify-between">
                <div className="md:w-80 w-full md:mt-0 mt-4">
                  <div className="flex items-center flex-grow">
                    <input
                      type="text"
                      placeholder="Search groups"
                      className="px-2 py-1.5 pr-10 w-full dark:text-gray-300 border dark:bg-gray-700 dark:border-gray-500 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <Icon name="search" className="text-gray-400 -ml-9 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={dailyTransactionData}
          noDataViewCondition={
            dailyTransactionData.length < 1 ? "No data available" : null
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
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Reference
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Amount
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Trx ID
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Method
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                User
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                Note
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {dailyTransactionData?.map(
              (transactionData: any, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{formatDate(transactionData?.createdAt)}</Td>
                    <Td>{transactionData?.reference_no}</Td>
                    <Td>
                      {transactionData?.amount}
                    </Td>
                    <Td>
                      {transactionData?.trx_id}
                    </Td>
                    <Td>
                      {transactionData?.payment_method}

                    </Td>
                    <Td>
                      {transactionData?.user?.name}
                    </Td>
                    <Td>
                      {transactionData?.note}
                    </Td>
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
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
