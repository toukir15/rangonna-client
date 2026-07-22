"use client";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useRef, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import { last30DaysRange } from "@admin/utils/helper";
import ProgressBar from "@admin/components/pages/Orders/ViewOrder/ProgressBar";
import { useLocalStorageDateRange } from "@admin/utils";
import PageSearch from "@admin/components/core/Search/PageSearch";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

export interface ICancelOrder {
  _id: string;
  sysid: string;
  reason: string;
  customer: {
    phone: string;
  };
  source: string;
  is_verified: boolean;
  createdAt: string;
}

const Page: React.FC = () => {
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [cancelByOrderData, setCancelByOrderData] = useState<ICancelOrder[]>(
    []
  );
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const abortRef = useRef<AbortController | null>(null);

  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );
  const [fraudStats, setFraudStats] = useState<
    Record<string, { total: number; delivered: number }>
  >({});

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    if (!baseApi) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const phones = Array.from(
      new Set(
        cancelByOrderData
          .map((o) => sanitizePhone(o?.customer?.phone))
          .filter(Boolean) as string[]
      )
    );

    if (!phones.length) {
      setFraudStats({});
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.all(
          phones.map(async (p) => {
            const url = `${baseApi}/check?api=1381e7a82b62ae85aca763ec861bbdd7e7bd6d71&phone=${p}`;
            const res = await fetch(url, { signal: controller.signal });
            const json = await res.json();
            const rows = json?.data ?? [];
            const total = rows.reduce(
              (acc: number, it: any) => acc + (Number(it?.total) || 0),
              0
            );
            const delivered = rows.reduce(
              (acc: number, it: any) => acc + (Number(it?.delivered) || 0),
              0
            );
            return [p, { total, delivered }] as const;
          })
        );

        if (cancelled) return;

        const next: Record<string, { total: number; delivered: number }> = {};
        for (const [p, v] of results) next[p] = v;
        setFraudStats(next);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Fraud fetch error:", e);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [baseApi, cancelByOrderData]);

  useEffect(() => {
    fetchWebList();
  }, []);

  useEffect(() => {
    fetchMonthlyProfit();
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage, selectedWebsite]);

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
    OrderReportProfitService.getCancelByOrder({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      domain: selectedWebsite.value,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setCancelByOrderData(res.data.data);
          setTotalOrders(res?.data?.meta?.totalRecords);
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

  const sanitizePhone = (raw?: string) => {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 11) return digits.slice(-11);
    return null;
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="sm:flex items-center gap-3 w-full pb-2">
            <div className="flex items-center gap-3">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 flex text-nowrap">
                Cancel By Order
              </h1>
              <Button
                className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
              </Button>
            </div>
            <div className="sm:w-80 w-full sm:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
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
          data={cancelByOrderData}
          noDataViewCondition={
            cancelByOrderData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Order Id
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Reason
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Phone
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200 text-center">
                Success Ratio
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Source
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Verified
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {cancelByOrderData?.map(
              (cancelByOrder: ICancelOrder, index: number) => {
                const phone = sanitizePhone(cancelByOrder?.customer?.phone);
                const ratio = phone ? fraudStats[phone] : undefined;
                const totalParcel = ratio?.total || 0;
                const totalDelivery = ratio?.delivered || 0;
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{cancelByOrder?.sysid}</Td>
                    <Td>{cancelByOrder?.reason}</Td>

                    <Td>{cancelByOrder?.customer?.phone}</Td>

                    <Td>
                      {" "}
                      <div>
                        <ProgressBar
                          isOption={false}
                          totalParcel={totalParcel}
                          totalDelivery={totalDelivery}
                        />
                      </div>
                    </Td>

                    <Td>{cancelByOrder?.source}</Td>

                    <Td>
                      <Icon
                        className={`${cancelByOrder?.is_verified
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                        name={
                          cancelByOrder?.is_verified
                            ? "verified"
                            : "verified_off"
                        }
                      />
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
