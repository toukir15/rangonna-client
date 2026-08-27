"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDate, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { ProfitService } from "@admin/@services/apis/Profit/Profit.service";
import {
  IDailyOrderProfit,
  IDailyOrderProfitResponse,
} from "@admin/@interfaces/profit/dailyProfit/dailyProfit.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const Page: React.FC = () => {
  const [dailyProfitData, setProfitData] = useState<IDailyOrderProfit[]>([]);
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
    fetchDailyProfit();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchDailyProfit = async () => {
    setTableLoading(true);
    ProfitService.getDailyProfit({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      domain: "all",
    })
      .then((res: IDailyOrderProfitResponse) => {
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
  useTableRefreshRegister(fetchDailyProfit);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Daily Profit" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Daily Profit records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
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
                onRefresh={fetchDailyProfit}
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
          colValue={8}
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
                Total Quantity
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Profit
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Discount
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Shipping
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Net Profit
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {dailyProfitData?.map(
              (profitData: IDailyOrderProfit, index: number) => {
                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{formatDate(profitData?.date)}</span></Td>
                    <Td>
                      {profitData?.totalOrder}{" "}
                      <span className="text-red-600 text-xs">
                        (
                        {(
                          profitData?.netProfit / profitData?.totalOrder
                        ).toFixed(0)}
                        )
                      </span>
                    </Td>
                    <Td>
                      {profitData?.totalProductQuantity}{" "}
                      <span className="text-red-600 text-xs">
                        (
                        {(
                          profitData?.netProfit /
                          profitData?.totalProductQuantity
                        ).toFixed(0)}
                        )
                      </span>
                    </Td>
                    <Td><span className="table-amount">{profitData?.totalProfit}</span></Td>
                    <Td><span className="table-amount">{profitData?.totalDiscount}</span></Td>
                    <Td><span className="data-table-muted">{profitData?.shippingTotal}</span></Td>
                    <Td><span className="table-amount">{profitData?.netProfit}</span></Td>
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
