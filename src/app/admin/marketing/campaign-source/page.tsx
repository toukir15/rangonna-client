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
import { ICardData } from "@/app/admin/report/employee-report/page";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { useLocalStorageDateRange } from "@admin/utils";
import { CampaignReportService } from "@admin/@services/apis/Marketing/CampaignReport/CampaignReport.service";
import {
  ICampaignReportSource,
  ICampaignReportSourceResponse,
  ICampaignReportSummary,
  ICampaignReportSummaryResponse,
} from "@admin/@interfaces/myActivity/campaingn/campaign.interface";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [cardData, setCardData] = useState<ICampaignReportSummary>();
  const [tableData, setTableData] = useState<ICampaignReportSource[]>([]);

  const [tableLoading, setTableLoading] = useState<boolean>(true);

  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchCampaignReportCard();
    fetchCampaignReportTable();
  }, [range]);

  const fetchCampaignReportCard = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    CampaignReportService.getCampaignReportCard({
      domain: "all",
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: ICampaignReportSummaryResponse) => {
        if (res?.success) {
          setCardData(res.data.data);
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
  const fetchCampaignReportTable = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    CampaignReportService.getCampaignReportTable({
      domain: "all",
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: ICampaignReportSourceResponse) => {
        if (res?.success) {
          setTableData(res.data.data);
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
      value: `${cardData?.total_count || 0}`,
      icon: "wallet",
      color:
        "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
    },
    {
      label: "Delivered",
      value: `${cardData?.delivery_count || 0}`,
      icon: "local_mall",
      color:
        "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent",
    },
    {
      label: "Canceled",
      value: `${cardData?.cancel_count}`,
      icon: "error",
      color:
        "bg-gradient-to-r from-red-400 via-rose-500 to-pink-600 bg-clip-text text-transparent",
    },
    {
      label: "Returned",
      value: `${cardData?.return_count}`,
      icon: "keyboard_return",
      color:
        "bg-gradient-to-r from-rose-400 via-pink-500 to-red-500 bg-clip-text text-transparent",
    },
  ];

  const getPercent = (value = 0, total = 0) => {
    if (!total) return "0%";
    return `${((value / total) * 100).toFixed(2)}%`;
  };
  useTableRefreshRegister(fetchCampaignReportCard);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Campaign Source" />
        
        <div className="mb-4">
          {tableLoading ? (
                <EmployeeReport />
              ) : (
                <div className="grid md:grid-cols-4 grid-cols-1 md:gap-4 gap-3 w-full">
                  {CardData?.map((data: ICardData, index: number) => {
                    return <ShopCart data={data} key={index} />;
                  })}
                </div>
              )}
        </div>

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Campaign Source records</p>
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
                onRefresh={fetchCampaignReportCard}
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
                Order Source
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Active
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Cancel
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Return
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableData?.map((data: ICampaignReportSource, index: number) => {
              const total = data?.total_order || 0;

              return (
                <Tr key={index}
                >
                  <Td><span className="table-amount">{data?.order_source}</span></Td>
                  <Td><span className="table-amount">{total}</span></Td>

                  <Td>
                    {data?.active_order}{" "}
                    <span className="text-xs text-gray-500">
                      ({getPercent(data?.active_order, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.total_delivery}{" "}
                    <span className="text-xs text-gray-500">
                      ({getPercent(data?.total_delivery, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.total_cancel}{" "}
                    <span className="text-xs text-red-500">
                      ({getPercent(data?.total_cancel, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.total_return}{" "}
                    <span className="text-xs text-yellow-500">
                      (
                      {getPercent(
                        data?.total_return,
                        data?.total_delivery - data?.total_cancel
                      )}
                      )
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableWrapper>
          
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default Page;
