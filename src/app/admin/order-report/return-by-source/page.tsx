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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Return By Source" />
        
        <div className="mb-4">
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

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Return By Source records</p>
            <p className="premium-table-toolbar-meta">
              {returnBySourceData?.length?.toLocaleString() || 0} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
                                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchReturnBySource}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={returnBySourceData}
          noDataViewCondition={
            returnBySourceData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Value
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {returnBySourceData[0]?.sources?.map(
              (cancelBySource: CancelSource, index: number) => {
                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{cancelBySource?.name}</span></Td>
                    <Td><span className="table-amount">{cancelBySource?.value}</span></Td>
                  </Tr>
                );
              }
            )}
          </Tbody>
        </TableWrapper>
          
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default Page;
