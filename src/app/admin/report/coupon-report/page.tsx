"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { reportService } from "@admin/@services/apis/Report/Report.service";
import {
  ICouponReportItem,
  ICouponReportResponse,
} from "@admin/@interfaces/report/couponReport.interface";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [tableData, setTableData] = useState<ICouponReportItem[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [range, setRange] = useLocalStorageDateRange(
    "googleAdsCampaignReportDateRange",
    DEFAULT_DATE_RANGE
  );

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "AccountCategoryPerPage",
      newProductPerPage.toString()
    );
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchCampaignReportGoogle();
  }, [currentPage, productPerPage, range]);

  const fetchCampaignReportGoogle = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    reportService
      .getCouponReport({
        page: currentPage,
        limit: productPerPage,
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: ICouponReportResponse) => {
        if (res?.success) {
          setTableData(res.data);
          setTotalProduct(res?.meta.total_record);
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
  useTableRefreshRegister(fetchCampaignReportGoogle);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Coupon Report
                </h1>
              </div>
              <div className="md:flex items-center w-full gap-4">
                <CalendarRange range={range} setRange={setRange} />
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[74%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={tableData}
          noDataViewCondition={
            tableData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[600px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Coupon Code
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Usage Count
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Total Amount
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {tableData?.map((data: ICouponReportItem, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{data?.coupon_code}</Td>
                  <Td>{data?.usage_count}</Td>
                  <Td>{data?.total_amount}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableWrapper>

        <PaginationComponent
          ordersPerPage={productPerPage}
          handleOrdersPerPageChange={handleProductPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalData={totalProduct}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
