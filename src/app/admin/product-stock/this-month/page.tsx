"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange, useDebounce } from "@admin/utils/hook.utils";
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
import { useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [thisMonthData, setThisMonthData] = useState<ProductReport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState<string>();

  const [range, setRange] = useLocalStorageDateRange(
    "productStockThisMonthDateRange",
    DEFAULT_DATE_RANGE,
  );

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const getProductReport = () => {
    setTableLoading(true);
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    productService
      .fetchProductThisMonthReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: ProductReportResponse) => {
        if (res?.success) {
          setThisMonthData(res?.data.data);
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
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage]);
  useTableRefreshRegister(getProductReport);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full mb-2">
          <div className="sm:flex flex-wrap items-center items-center gap-3 w-full">
            <div className="flex flex-wrap items-center items-center gap-3">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 text-nowrap">
                This Month Stock Report
              </h1>
              <AllFilter
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
            <div className="sm:w-80 w-full sm:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
          
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={thisMonthData}
          noDataViewCondition={
            thisMonthData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[650px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200 text-nowrap">
                Name
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200 text-nowrap">
                Last Month
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200 text-nowrap">
                Current Stock
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200 text-nowrap">
                Box Stock
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200 text-nowrap">
                Active Order
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
                Transit Order
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
                Quick View
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {thisMonthData?.map((report: any, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    <div>{report?.saved_remaining_stock}</div>
                  </Td>
                  <Td>
                    <div>{report?.remaining_stock}</div>
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

                  <Td>{report?.transit_quantity}</Td>

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
