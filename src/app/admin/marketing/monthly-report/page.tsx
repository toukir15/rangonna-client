"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { marketingReportService } from "@admin/@services/apis/Marketing/MarketingReport.service";
import {
  IMonthlyMarketingReport,
  IMonthlyMarketingReportResponse,
} from "@admin/@interfaces/marketing/monthlyReport.interface";
import { formatMonthYear } from "@admin/utils/hook.utils";

const Page: React.FC = () => {
  const [marketingData, setMarketingData] = useState<IMonthlyMarketingReport[]>(
    []
  );
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchMarketingReport();
  }, [currentPage, ordersPerPage]);

  const fetchMarketingReport = async () => {
    setTableLoading(true);
    marketingReportService
      .getMarketingReport({
        page: currentPage,
        limit: ordersPerPage,
        domain: "all",
      })
      .then((res: IMonthlyMarketingReportResponse) => {
        if (res?.success) {
          setMarketingData(res.data.data);
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
  useTableRefreshRegister(fetchMarketingReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Monthly Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Monthly records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchMarketingReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={marketingData}
          noDataViewCondition={
            marketingData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total Order
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Delivery Total
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                ROI
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Active Order
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                BDT
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                USD
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {marketingData?.map(
              (marketing: IMonthlyMarketingReport, index: number) => {
                const deliveryPerMarketing =
                  marketing.total_marketing_usd > 0
                    ? (
                        Number(marketing.delivery_total) /
                        Number(marketing.total_marketing_usd) /
                        130
                      ).toFixed(2)
                    : 0;

                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{formatMonthYear(marketing?.date)}</span></Td>
                    <Td><span className="table-amount">{marketing?.total_order}</span></Td>
                    <Td>
                      {marketing?.delivered}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((marketing?.delivered || 0) /
                            (marketing?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td><span className="table-amount">{marketing?.delivery_total}</span></Td>
                    <Td><span className="data-table-muted">{deliveryPerMarketing}</span></Td>

                    <Td><span className="table-amount">{marketing?.active_order}</span></Td>
                    <Td>
                      {marketing?.total_marketing_bdt} (
                      {marketing?.delivered && marketing.delivered > 0
                        ? (
                            Number(marketing.total_marketing_bdt) /
                            Number(marketing.delivered)
                          ).toFixed(2)
                        : 0}
                      )
                    </Td>
                    <Td>
                      {marketing?.total_marketing_usd} (
                      {marketing?.delivered && marketing.delivered > 0
                        ? (
                            Number(marketing.total_marketing_usd) /
                            Number(marketing.delivered)
                          ).toFixed(2)
                        : 0}
                      )
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
