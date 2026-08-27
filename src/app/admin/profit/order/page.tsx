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
import React, { useEffect, useRef, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { ProfitService } from "@admin/@services/apis/Profit/Profit.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import {
  IProfitByOrder,
  IProfitByOrderResponse,
} from "@admin/@interfaces/profit/orderByProfit/orderByProfit.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const Page: React.FC = () => {
  const [dailyProfitData, setProfitData] = useState<IProfitByOrder[]>([]);
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
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchOrderByProfit();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchOrderByProfit = async () => {
    setTableLoading(true);
    ProfitService.getOrderByProfit({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      domain: "all",
    })
      .then((res: IProfitByOrderResponse) => {
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

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    if (!remove) return;
    try {
      const res = await ProfitService.deleteProfitByOrder(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchOrderByProfit();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
    }
  };

  useTableRefreshRegister(fetchOrderByProfit);

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex flex-wrap items-center items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Order By Profit" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Order By Profit records</p>
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
                onRefresh={fetchOrderByProfit}
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
                Order Id
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Profit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Shipping
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Discount
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Net Profit
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {dailyProfitData?.map(
              (profitData: IProfitByOrder, index: number) => {
                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{formatDate(profitData?.createdAt)}</span></Td>
                    <Td><span className="table-amount">{profitData?.order_sysid}</span></Td>
                    <Td><span className="table-amount">{profitData?.profit}</span></Td>
                    <Td><span className="data-table-muted">{profitData?.order?.shipping_line?.total}</span></Td>
                    <Td><span className="table-amount">{profitData?.order?.discount_total}</span></Td>
                    <Td><span className="table-amount">{(
                        profitData?.profit - profitData?.order?.discount_total
                      ).toFixed(0)}</span></Td>
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
