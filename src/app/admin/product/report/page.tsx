"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import ProductReportModal from "@admin/components/pages/Report/ProductReport/ProductReportModal";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import {
  ProductReport,
  ProductReportResponse,
} from "@admin/@interfaces/report/productReport.interface";

const Page: React.FC = () => {
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
  const [reportIssueData, setReportIssueData] = useState<ProductReport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState<string>();

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const getProductReport = () => {
    setTableLoading(true);
    productService
      .fetchProductStockReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
      })
      .then((res: ProductReportResponse) => {
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
    getProductReport();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);
  useTableRefreshRegister(getProductReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Product Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Product records</p>
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
                    placeholder="Search records..."
                    aria-label="Search records"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={getProductReport}
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
          colValue={4}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-nowrap">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-nowrap">
                Box Stock
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-nowrap">
                Active Order
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                Quick View
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {reportIssueData?.map((report: any, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{report?.product_title}</span></Td>

                  <Td><span className="table-amount">{report?.remaining_stock - report?.transit_quantity}</span></Td>
                  <Td><span className="table-amount">{report?.active_orders_quantity}</span></Td>

                  <Td className="ps-10">
                    <Icon
                      onClick={() => {
                        setModalOpen(true);
                        setProductId(report?.product?._id);
                      }}
                      name={"visibility"}
                      variant="outlined"
                      className="cursor-pointer"
                    />
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
        <ProductReportModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          productId={productId}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
