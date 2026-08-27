"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDateRange, useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useRef, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import { last30DaysRange } from "@admin/utils/helper";
import ProgressBar from "@admin/components/pages/Orders/ViewOrder/ProgressBar";
import { useLocalStorageDateRange } from "@admin/utils";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

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
  const [cancelByOrderData, setCancelByOrderData] = useState<ICancelOrder[]>(
    []
  );
  const abortRef = useRef<AbortController | null>(null);

  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;
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
    fetchMonthlyProfit();
  }, [range, debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchMonthlyProfit = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    OrderReportProfitService.getCancelByOrder({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      domain: "all",
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

  useTableRefreshRegister(fetchMonthlyProfit);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Cancel By Order" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Cancel By Order records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
                                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search records..."
                    aria-label="Search records"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchMonthlyProfit}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={cancelByOrderData}
          noDataViewCondition={
            cancelByOrderData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Order Id
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Reason
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Phone
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-center">
                Success Ratio
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Source
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Verified
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {cancelByOrderData?.map(
              (cancelByOrder: ICancelOrder, index: number) => {
                const phone = sanitizePhone(cancelByOrder?.customer?.phone);
                const ratio = phone ? fraudStats[phone] : undefined;
                const totalParcel = ratio?.total || 0;
                const totalDelivery = ratio?.delivered || 0;
                return (
                  <Tr key={index}
                  >
                    <Td><span className="table-amount">{cancelByOrder?.sysid}</span></Td>
                    <Td><span className="data-table-muted">{cancelByOrder?.reason}</span></Td>

                    <Td><span className="data-table-muted">{cancelByOrder?.customer?.phone}</span></Td>

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

                    <Td><span className="data-table-muted">{cancelByOrder?.source}</span></Td>

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
            isShowText={true}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default Page;
