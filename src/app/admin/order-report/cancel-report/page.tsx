"use client";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import { last30DaysRange } from "@admin/utils/helper";
import { useLocalStorageDateRange } from "@admin/utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
export interface ICancelReasonReport {
  quantity: number;
  verified_count: number;
  reason: string;
}

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};
const Page: React.FC = () => {
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [cancelReportData, setCancelReportData] = useState<
    ICancelReasonReport[]
  >([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchWebList();
  }, []);

  useEffect(() => {
    fetchCancelReport();
  }, [range, selectedWebsite]);

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item.web_name,
            value: item.web_url,
          }));
          setWebsiteOptions([
            { value: "all", label: "All Website" },
            ...options,
          ]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchCancelReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.getCancelReport({
      domain: selectedWebsite.value,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setCancelReportData(res?.data);
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
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="flex items-center gap-3 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 flex text-nowrap">
                Cancel Report
              </h1>
              <Button
                className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
              </Button>
            </div>
          </div>
          {
            isFilterOpen && <div className="md:mt-0 -mt-4">
              <AllFilter
                isWebsiteFilter={true}
                isFilterOpen={isFilterOpen}
                websiteOptions={websiteOptions}
                selectedWebsite={selectedWebsite}
                setSelectedWebsite={setSelectedWebsite}
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
          }
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={cancelReportData}
          noDataViewCondition={
            cancelReportData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Reason
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Order Quantity
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Verified
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                UnVerified
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {cancelReportData?.map(
              (cancelReport: ICancelReasonReport, index: number) => {
                const delivered = cancelReport?.verified_count || 0;
                const total = cancelReport?.quantity || 1;
                const cancelled = total - delivered;

                const deliveredPercent = ((delivered / total) * 100).toFixed(0);
                const cancelledPercent = ((cancelled / total) * 100).toFixed(0);

                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{cancelReport?.reason}</Td>
                    <Td>{total}</Td>

                    {/* Delivered */}
                    <Td>
                      {delivered}
                      <span className="ml-2 text-xs text-gray-500">
                        ({deliveredPercent}%)
                      </span>
                    </Td>

                    {/* Cancelled */}
                    <Td>
                      {cancelled}
                      <span className="ml-2 text-xs text-gray-500">
                        ({cancelledPercent}%)
                      </span>
                    </Td>
                  </Tr>
                );
              }
            )}
          </Tbody>
        </TableWrapper>
      </div>
    </AuthLayout>
  );
};

export default Page;
