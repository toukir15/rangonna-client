"use client";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import { productReportService } from "@admin/@services/apis/ProductReport/ProductReport.service";
import {
  ICategorySalesReportItem,
  ICategorySalesReportResponse,
} from "@admin/@interfaces/productReport/categoryReport.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import PageSearch from "@admin/components/core/Search/PageSearch";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [categoryData, setCategoryData] = useState<ICategorySalesReportItem[]>(
    [],
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
  const [range, setRange] = useLocalStorageDateRange(
    "categoryReportDateRange",
    DEFAULT_DATE_RANGE,
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("categoryLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchCategoryReport();
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchCategoryReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    productReportService
      .getCategoryReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: ICategorySalesReportResponse) => {
        if (res?.success) {
          setCategoryData(res.data.data);
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

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full pb-2">
          <div className="md:flex items-center gap-3 w-full">
            <div className="flex items-center gap-3">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 flex text-nowrap">
                Category Report
              </h1>
              <Button
                className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
              </Button>
            </div>
            <div className="4xl:w-72 md:w-64 w-full md:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
          {isFilterOpen && (
            <div className=" -mt-4 md:mt-0">
              <AllFilter
                isFilterOpen={isFilterOpen}
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
          )}
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={categoryData}
          noDataViewCondition={
            categoryData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-48 text-blue-900 dark:text-gray-200">
                Title
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                In Transit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivery
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
            {categoryData?.map(
              (category: ICategorySalesReportItem, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{category?.product_category}</Td>
                    <Td>{category?.total_order}</Td>
                    <Td>{category?.in_transit}</Td>
                    <Td>
                      {category?.delivery}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.delivery || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {category?.canceled}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.canceled || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {category?.return}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.return || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {category?.refunded}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((category?.refunded || 0) /
                            (category?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                  </Tr>
                );
              },
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
