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
import { useLocalStorageDateRange } from "@admin/utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
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
  const [cancelReportData, setCancelReportData] = useState<
    ICancelReasonReport[]
  >([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchCancelReport();
  }, [range]);

  const fetchCancelReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.getCancelReport({
      domain: "all",
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
  useTableRefreshRegister(fetchCancelReport);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Cancel Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Cancel records</p>
            <p className="premium-table-toolbar-meta">
              {cancelReportData?.length?.toLocaleString() || 0} records
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
                onRefresh={fetchCancelReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={cancelReportData}
          noDataViewCondition={
            cancelReportData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Reason
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Order Quantity
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Verified
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                UnVerified
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {cancelReportData?.map(
              (cancelReport: ICancelReasonReport, index: number) => {
                const delivered = cancelReport?.verified_count || 0;
                const total = cancelReport?.quantity || 1;
                const cancelled = total - delivered;

                const deliveredPercent = ((delivered / total) * 100).toFixed(0);
                const cancelledPercent = ((cancelled / total) * 100).toFixed(0);

                return (
                  <Tr key={index}
                  >
                    <Td><span className="data-table-primary">{cancelReport?.reason}</span></Td>
                    <Td><span className="table-amount">{total}</span></Td>

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
        
      </div>
    </AuthLayout>
  );
};

export default Page;
