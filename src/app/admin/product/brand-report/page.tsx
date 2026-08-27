"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDateRange, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import { productReportService } from "@admin/@services/apis/ProductReport/ProductReport.service";
import {
  IBrandSalesReportItem,
  IBrandSalesReportResponse,
} from "@admin/@interfaces/productReport/brandReport.interface";
import Button from "@admin/components/core/Button/Button";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [brandData, setBrandData] = useState<IBrandSalesReportItem[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [range, setRange] = useLocalStorageDateRange(
    "brandReportDateRange",
    DEFAULT_DATE_RANGE,
  );

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchBrand();
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchBrand = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    productReportService
      .getBrandReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,

        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: IBrandSalesReportResponse) => {
        if (res?.success) {
          setBrandData(res.data.data);
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
  useTableRefreshRegister(fetchBrand);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Brand Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Brand records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
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
                onRefresh={fetchBrand}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={brandData}
          noDataViewCondition={
            brandData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Brand
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                In Transit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Cancelled
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {brandData?.map((brand: IBrandSalesReportItem, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{brand?.product_brand}</span></Td>
                  <Td><span className="table-amount">{brand?.total_order}</span></Td>
                  <Td><span className="table-amount">{brand?.in_transit}</span></Td>
                  <Td>
                    {brand?.delivery}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((brand?.delivery || 0) / (brand?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {brand?.canceled}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((brand?.canceled || 0) / (brand?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {brand?.return}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((brand?.return || 0) / (brand?.total_order || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {brand?.refunded}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((brand?.refunded || 0) / (brand?.total_order || 1)) *
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
