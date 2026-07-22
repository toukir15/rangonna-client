"use client";
import {
  IWebsiteOption,
  IWebsiteResponse,
} from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDate } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useMemo, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import {
  IDailyReport,
  IDailyReportResponse,
} from "@admin/@interfaces/orderReport/dailyReport.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";

/** Same storefront URLs as order modules; tabs require matching dashboard_*_view. */
const DAILY_REPORT_DASHBOARD_SITE_ACCESS: readonly {
  readonly permission: string;
  readonly domain: string;
}[] = [
  {
    permission: "dashboard_naviforce_view",
    domain: "https://naviforce.com.bd",
  },
  {
    permission: "dashboard_timeverse_view",
    domain: "https://timeverse.com.bd",
  },
  {
    permission: "dashboard_bikreta_view",
    domain: "https://bikreta.com.bd",
  },
  {
    permission: "dashboard_olevs_view",
    domain: "https://olevs.com.bd",
  },
];

function normalizeWebUrl(url: string): string {
  return url.trim().replace(/\/$/, "").toLowerCase();
}

function websitesAllowedForDashboardPermissions(
  sites: IWebsiteOption[],
  permissions: string[],
): IWebsiteOption[] {
  const byUrl = new Map(
    sites.map((s) => [normalizeWebUrl(s.value), s] as const),
  );
  return DAILY_REPORT_DASHBOARD_SITE_ACCESS.filter((entry) =>
    permissions.includes(entry.permission),
  )
    .map((entry) => byUrl.get(normalizeWebUrl(entry.domain)))
    .filter((opt): opt is IWebsiteOption => opt != null);
}

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [rawWebsiteOptions, setRawWebsiteOptions] = useState<IWebsiteOption[]>(
    [],
  );
  const [webListLoading, setWebListLoading] = useState(true);
  const [dailyProfitData, setProfitData] = useState<IDailyReport[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<IWebsiteOption | null>(
    null,
  );

  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const websiteOptions = useMemo(
    () =>
      websitesAllowedForDashboardPermissions(rawWebsiteOptions, permissionList),
    [rawWebsiteOptions, permissionList],
  );

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchWebList();
  }, []);

  useEffect(() => {
    if (!selectedWebsite) {
      setProfitData([]);
      setTotalOrders(0);
      return;
    }
    fetchDailyReport();
  }, [currentPage, ordersPerPage, selectedWebsite]);

  useEffect(() => {
    if (webListLoading) return;
    if (websiteOptions.length === 0) {
      setSelectedWebsite(null);
      setTableLoading(false);
      return;
    }
    setSelectedWebsite((prev) => {
      if (!prev) return null;
      return websiteOptions.some((o) => o.value === prev.value) ? prev : null;
    });
  }, [websiteOptions, webListLoading]);

  const fetchWebList = async () => {
    setWebListLoading(true);
    GlobalService.getWebsiteList()
      .then(
        (res: {
          success?: boolean;
          message?: string;
          data?: IWebsiteResponse[];
        }) => {
          if (res?.success) {
            const options: IWebsiteOption[] =
              res?.data?.map((item: IWebsiteResponse) => ({
                label: item.web_name,
                value: item.web_url,
              })) ?? [];
            setRawWebsiteOptions(options);
          } else {
            ToastService.error(res?.message ?? "Failed to load websites");
            setTableLoading(false);
          }
        },
      )
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
        setTableLoading(false);
      })
      .finally(() => {
        setWebListLoading(false);
      });
  };

  const fetchDailyReport = async () => {
    if (!selectedWebsite) return;
    setTableLoading(true);
    OrderReportProfitService.getDailyProfit({
      page: currentPage,
      limit: ordersPerPage,
      domain: selectedWebsite.value,
    })
      .then((res: IDailyReportResponse) => {
        if (res?.success) {
          setProfitData(res.data.data);
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

  const handleWebsiteTabChange = (option: IWebsiteOption) => {
    setCurrentPage(1);
    setSelectedWebsite(option);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm px-4 py-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="shrink-0">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-bold text-gray-800 dark:text-gray-100">
                  Daily Report
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Website wise report overview
                </p>
              </div>

              <div className="w-full lg:flex-1 lg:min-w-0">
                <div className="flex flex-nowrap overflow-x-auto gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-1.5 [scrollbar-width:thin]">
                  {websiteOptions.map((opt) => {
                    const isActive = selectedWebsite?.value === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleWebsiteTabChange(opt)}
                        className={`relative shrink-0 rounded-lg px-4 py-2 text-sm 2xl:text-base font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-600"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white"
                  }`}
                      >
                        {opt.label}

                        {isActive && (
                          <span className="absolute left-1/2 -bottom-1 h-1 w-8 -translate-x-1/2 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full mt-3">
        <TableWrapper
          showCheckbox={true}
          data={dailyProfitData}
          noDataViewCondition={
            !selectedWebsite
              ? "Select a website above to load the report"
              : dailyProfitData.length < 1
                ? "No data available"
                : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading || webListLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                RD
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Delivered
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Cancelled
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {dailyProfitData?.map((profitData: IDailyReport, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{formatDate(profitData?.date)}</Td>
                  <Td>{profitData?.totalOrder}</Td>

                  <Td>
                    {profitData?.readyForBox}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.readyForBox || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                  <Td>
                    {profitData?.delivered}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.delivered || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>

                  {/* Cancelled */}
                  <Td>
                    {profitData?.cancelled}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.cancelled || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>

                  {/* Returned */}
                  <Td>
                    {profitData?.returned}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.returned || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>

                  {/* Refunded */}
                  <Td>
                    {profitData?.refunded}
                    <span className="ml-2 text-xs text-gray-500">
                      (
                      {(
                        ((profitData?.refunded || 0) /
                          (profitData?.totalOrder || 1)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </Td>
                </Tr>
              );
            })}
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
