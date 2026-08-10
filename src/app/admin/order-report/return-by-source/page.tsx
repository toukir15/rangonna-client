"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
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

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

export interface CancelSource {
  name: string;
  value: number;
}

export interface CancelSummary {
  total_cancel: number;
  verified_count: number;
  sources: CancelSource[];
}

const Page: React.FC = () => {
  const [returnBySourceData, setReturnBySourceData] = useState<CancelSummary[]>(
    []
  );
  const [tableLoading, setTableLoading] = useState<boolean>(true);

  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchReturnBySource();
  }, [range]);

  const fetchReturnBySource = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.getReturnCardReportPerOrder({
      domain: "all",
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setReturnBySourceData(res.data.data);
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
      value: `${returnBySourceData[0]?.total_cancel?.toLocaleString() || 0}`,
      icon: "celebration",
      color: "text-orange-600",
    },
    {
      label: "Verified",
      value: `${returnBySourceData[0]?.verified_count?.toLocaleString() || 0}`,
      icon: "verified_user",
      color: "text-green-600",
    },
    {
      label: "UnVerified",
      value: `${Number(returnBySourceData[0]?.total_cancel) -
        Number(returnBySourceData[0]?.verified_count)
        }`,
      icon: "gpp_bad",
      color: "text-red-600",
    },
  ];
  useTableRefreshRegister(fetchReturnBySource);

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="flex flex-wrap items-center items-center gap-3 pb-2">
            <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 text-nowrap">
              Return By Source
            </h1>
              <AllFilter
                                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
          </div>
          
          <div className="pb-4 w-full">
            {tableLoading ? (
              <EmployeeReport />
            ) : (
              <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-3 w-full">
                {CardData?.map((data: ICardData, index: number) => {
                  return <ShopCart data={data} key={index} />;
                })}
              </div>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[74%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={returnBySourceData}
          noDataViewCondition={
            returnBySourceData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[600px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Value
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {returnBySourceData[0]?.sources?.map(
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
