"use client";

import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
import PageSearch from "@admin/components/core/Search/PageSearch";

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

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full mb-2">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between md:pb-2 pb-0">
            <div className="md:flex items-center md:space-x-4 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 text-nowrap">
                Product Report
              </h1>

              <div className="sm:flex items-center w-full justify-between">
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

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={reportIssueData}
          noDataViewCondition={
            reportIssueData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[650px]"
          isLoading={tableLoading}
          colValue={4}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200 text-nowrap">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200 text-nowrap">
                Box Stock
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200  text-nowrap">
                Active Order
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Quick View
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {reportIssueData?.map((report: any, index: number) => {
              return (
                <Tr
                  className=" hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>
                    <div>
                      <p className="text-nowrap pb-2 font-semibold">
                        {report?.product_title}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    <div>
                      {report?.remaining_stock - report?.transit_quantity}
                    </div>
                  </Td>
                  <Td>
                    <div>
                      <p>{report?.active_orders_quantity}</p>
                    </div>
                  </Td>

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

        <ProductReportModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          productId={productId}
        />

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
