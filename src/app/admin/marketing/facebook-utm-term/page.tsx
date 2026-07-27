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
import { CampaignReportService } from "@admin/@services/apis/Marketing/CampaignReport/CampaignReport.service";
import {
  IFacebookUtmTermReport,
  IFacebookUtmTermReportResponse,
} from "@admin/@interfaces/myActivity/campaingn/campaign.interface";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [tableData, setTableData] = useState<IFacebookUtmTermReport[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);

  const [range, setRange] = useLocalStorageDateRange(
    "facebookAdsSetUtmTermReportDateRange",
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
    fetchCampaignReportFacebookAds();
  }, [currentPage, productPerPage, range]);

  const fetchCampaignReportFacebookAds = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    CampaignReportService.getCampaignReportFbAdset({
      page: currentPage,
      limit: productPerPage,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: IFacebookUtmTermReportResponse) => {
        if (res?.success) {
          setTableData(res.data.data);
          setTotalProduct(res?.data.meta.total_record);
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

  const getPercent = (value = 0, total = 0) => {
    if (!total) return "0%";
    return `${((value / total) * 100).toFixed(2)}%`;
  };
  useTableRefreshRegister(fetchCampaignReportFacebookAds);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Facebook Adset Report
                </h1>
              </div>
              <div className="md:flex items-center w-full  gap-4">
                <CalendarRange range={range} setRange={setRange} />
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[74%] w-full ">
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
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Adset ID
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Active
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Cancel
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Return
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {tableData?.map((data: IFacebookUtmTermReport, index: number) => {
              const total = data?.total_order || 0;

              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{data?.utm_term_id}</Td>
                  <Td>{total}</Td>
                  <Td>
                    {data?.active_order}{" "}
                    <span className="text-xs text-gray-500">
                      ({getPercent(data?.active_order, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.delivery_count}{" "}
                    <span className="text-xs text-gray-500">
                      ({getPercent(data?.delivery_count, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.cancel_count}{" "}
                    <span className="text-xs text-red-500">
                      ({getPercent(data?.cancel_count, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.return_count}{" "}
                    <span className="text-xs text-yellow-500">
                      (
                      {getPercent(
                        data?.return_count,
                        total - data?.cancel_count
                      )}
                      )
                    </span>
                  </Td>
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
