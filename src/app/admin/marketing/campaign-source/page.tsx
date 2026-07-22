"use client";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [cardData, setCardData] = useState<ICampaignReportSummary>();
  const [tableData, setTableData] = useState<ICampaignReportSource[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });

  const [tableLoading, setTableLoading] = useState<boolean>(true);

  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchWebList();
  }, []);

  useEffect(() => {
    fetchCampaignReportCard();
    fetchCampaignReportTable();
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

  const fetchCampaignReportCard = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    CampaignReportService.getCampaignReportCard({
      domain: selectedWebsite.value,
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
      domain: selectedWebsite.value,
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

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Campaign Source
                </h1>
              </div>
              <div className="md:flex items-center w-full  gap-4">
                <div className="mb-2 md:mb-0">
                  <SelectComponent
                    options={websiteOptions}
                    value={selectedWebsite}
                    onChange={setSelectedWebsite}
                    placeholder="All Websites"
                    className="md:w-60 w-full"
                  />
                </div>
                <CalendarRange range={range} setRange={setRange} />
              </div>
            </div>
            <div className="pt-4 w-full">
              {tableLoading ? (
                <EmployeeReport />
              ) : (
                <div className="grid  md:grid-cols-4 grid-cols-1 md:gap-4 gap-3 w-full">
                  {CardData?.map((data: ICardData, index: number) => {
                    return <ShopCart data={data} key={index} />;
                  })}
                </div>
              )}
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
                Order Source
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
            {tableData?.map((data: ICampaignReportSource, index: number) => {
              const total = data?.total_order || 0;

              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{data?.order_source}</Td>
                  <Td>{total}</Td>

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
    </AuthLayout>
  );
};

export default Page;
