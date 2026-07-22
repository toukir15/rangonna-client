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
import { ICardData } from "@/app/admin/report/employee-report/page";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { useLocalStorageDateRange } from "@admin/utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";

export interface CancelSource {
  name: string;
  value: number;
}

export interface CancelSummary {
  total_cancel: number;
  verified_count: number;
  sources: CancelSource[];
}

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [cancelBySourceData, setCancelBySourceData] = useState<CancelSummary[]>(
    []
  );
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(true);

  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchWebList();
  }, []);

  useEffect(() => {
    fetchMonthlyProfit();
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

  const fetchMonthlyProfit = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.getCancelCardReportPerOrder({
      domain: selectedWebsite.value,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setCancelBySourceData(res.data.data);
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

  const CardData: ICardData[] = [
    {
      label: "Total",
      value: `${cancelBySourceData[0]?.total_cancel?.toLocaleString() || 0}`,
      icon: "celebration",
      color: "text-orange-600",
    },
    {
      label: "Verified",
      value: `${cancelBySourceData[0]?.verified_count?.toLocaleString() || 0}`,
      icon: "verified_user",
      color: "text-green-600",
    },
    {
      label: "UnVerified",
      value: `${Number(cancelBySourceData[0]?.total_cancel) -
        Number(cancelBySourceData[0]?.verified_count)
        }`,
      icon: "gpp_bad",
      color: "text-red-600",
    },
  ];

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center gap-3 w-full">
              <div className="flex items-center gap-3">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 text-nowrap">
                  Cancel By Source
                </h1>
                <Button
                  className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                >
                  <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
                </Button>
              </div>
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
          <div className="pb-4 w-full">
            {tableLoading ? (
              <EmployeeReport />
            ) : (
              <div className="grid  md:grid-cols-3 grid-cols-1 md:gap-4 gap-3 w-full">
                {CardData?.map((data: ICardData, index: number) => {
                  return <ShopCart data={data} key={index} />;
                })}
              </div>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[74%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={cancelBySourceData}
          noDataViewCondition={
            cancelBySourceData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[600px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Value
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {cancelBySourceData[0]?.sources?.map(
              (cancelBySource: CancelSource, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{cancelBySource?.name}</Td>
                    <Td>{cancelBySource?.value}</Td>
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
