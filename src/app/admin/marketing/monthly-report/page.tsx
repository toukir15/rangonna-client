"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Monthly Report
                </h1>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={marketingData}
          noDataViewCondition={
            marketingData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivery Total
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                ROI
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Active Order
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                BDT
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                USD
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
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
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{formatMonthYear(marketing?.date)}</Td>
                    <Td>{marketing?.total_order}</Td>
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
                    <Td>{marketing?.delivery_total}</Td>
                    <Td>{deliveryPerMarketing}</Td>

                    <Td>{marketing?.active_order}</Td>
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
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
