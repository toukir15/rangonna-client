"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import {
  IWebsiteOption,
  IWebsiteRes,
  IWebsiteResponse,
  SelectOption,
} from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDate, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { MyActivityReport } from "@admin/@services/apis/MyActivity/OrderHistoryReport.service";
import {
  IOrderHistoryReportItem,
  IOrderHistoryReportResponse,
} from "@admin/@interfaces/myActivity/orderHistory.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import PageSearch from "@admin/components/core/Search/PageSearch";

const Page: React.FC = () => {
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [dailyProfitData, setProfitData] = useState<IOrderHistoryReportItem[]>(
    []
  );
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
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
    fetchWebList();
  }, []);

  useEffect(() => {
    fetchOrderHistoryReport();
  }, [debouncedSearchTerm, currentPage, ordersPerPage, selectedWebsite]);

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: IWebsiteRes) => {
        if (res?.success) {
          const options = res.data.map((item: IWebsiteResponse) => ({
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

  const fetchOrderHistoryReport = async () => {
    setTableLoading(true);
    MyActivityReport.getOrderHistoryReport({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      domain: "all",
    })
      .then((res: IOrderHistoryReportResponse) => {
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
  useTableRefreshRegister(fetchOrderHistoryReport);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex flex-wrap items-center items-center md:space-x-4 w-full">
              <div className="flex flex-wrap items-center items-center gap-3">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 flex text-nowrap">
                  My Order
                </h1>
              <AllFilter
                              />
              </div>
              <div className="4xl:w-72  w-full md:mt-0 mt-2">
                <PageSearch
                  value={searchTerm}
                  onChange={handleSearchChange}
                  wrapperClass="md:w-72 w-full"
                />
              </div>
            </div>
          </div>
          
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
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
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivered
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Cancelled
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {dailyProfitData?.map(
              (profitData: IOrderHistoryReportItem, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{formatDate(profitData?.date)}</Td>
                    <Td>{profitData?.totalOrder}</Td>
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
