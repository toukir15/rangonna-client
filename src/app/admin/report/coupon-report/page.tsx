"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Coupon Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Coupon records</p>
            <p className="premium-table-toolbar-meta">
              {tableData?.length?.toLocaleString() || 0} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CalendarRange range={range} setRange={setRange} />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchCampaignReportGoogle}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={tableData}
          noDataViewCondition={
            tableData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Coupon Code
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Usage Count
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total Amount
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableData?.map((data: ICouponReportItem, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{data?.coupon_code}</span></Td>
                  <Td><span className="table-amount">{data?.usage_count}</span></Td>
                  <Td><span className="table-amount">{data?.total_amount}</span></Td>
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
