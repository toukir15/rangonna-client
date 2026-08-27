"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { CampaignReportService } from "@admin/@services/apis/Marketing/CampaignReport/CampaignReport.service";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import { formatDate, formatDateRange } from "@admin/utils/hook.utils";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import { ICardData } from "@/app/admin/report/employee-report/page";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

type SearchEvent =
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLInputElement>;

const Page: React.FC = () => {
  const [productSearch, setProductSearch] = useState("");
  const [singleProduct, setSingleProduct] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [ordersPerPage, setOrdersPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [cardData, setCardData] = useState<any>();
  const [cardLoading, setCardLoading] = useState<boolean>(false);

  const [range, setRange] = useLocalStorageDateRange(
    "facebookAdsSetUtmTermReportDateRange",
    DEFAULT_DATE_RANGE
  );

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const fetchCampaignData = async () => {
    if (!productSearch || productSearch.length < 2) return;

    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setTableLoading(true);

    try {
      const res: any = await CampaignReportService.getCampainSearch({
        searchTerm: productSearch,
        page: currentPage,
        limit: ordersPerPage,
        startDate: formattedFrom,
        endDate: formattedTo,
      });

      if (res?.success) {
        setSingleProduct(res.data.data || []);
        setTotalOrders(res.data.meta.total_record || 0);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearchSubmit = (e: SearchEvent) => {
    e.preventDefault();

    if (!productSearch || productSearch.length < 2) {
      ToastService.error("Please enter at least 2 characters");
      return;
    }

    setCurrentPage(1);
    fetchCampaignData();
    fetchCartData();
  };

  useEffect(() => {
    if (!productSearch || productSearch.length < 2) return;
    setCurrentPage(1);
    fetchCampaignData();
  }, [range]);

  useEffect(() => {
    if (!productSearch || productSearch.length < 2) return;
    fetchCampaignData();
  }, [currentPage, ordersPerPage]);

  const handleLogsPerPageChange = (value: number) => {
    setOrdersPerPage(value);
    localStorage.setItem("ordersLogsPerPage", value.toString());
  };

  const getPercent = (value = 0, total = 0) => {
    if (!total) return "0%";
    return `${((value / total) * 100).toFixed(2)}%`;
  };

  const fetchCartData = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setCardLoading(true);
    CampaignReportService.getCartList({
      searchTerm: productSearch,
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setCardData(res?.data?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setCardLoading(false);
      });
  };

  useEffect(() => {
    if (!productSearch || productSearch.length < 2) return;
    fetchCartData();
  }, [range]);

  const total = cardData?.total_order || 0;

  const CardData: ICardData[] = [
    {
      label: "Total",
      value: `${total}`,
      icon: "wallet",
      color:
        "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
      // percentage: "100%",
    },
    {
      label: "Active",
      value: `${cardData?.active_order || 0}`,
      icon: "animation",
      color:
        "bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent",
      percentage: getPercent(cardData?.active_order, total),
    },
    {
      label: "Delivery",
      value: `${cardData?.delivery_count || 0}`,
      icon: "check_circle",
      color:
        "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent",
      percentage: getPercent(cardData?.delivery_count, total),
    },
    {
      label: "Cancel",
      value: `${cardData?.cancel_count || 0}`,
      icon: "cancel",
      color:
        "bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent",
      percentage: getPercent(cardData?.cancel_count, total),
    },
    {
      label: "Return",
      value: `${cardData?.return_count || 0}`,
      icon: "keyboard_return",
      color:
        "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent",
      percentage: getPercent(cardData?.return_count, total),
    },
  ];
  useTableRefreshRegister(fetchCampaignData);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Campaign Search" />
        
        <div className="mb-4">
          {cardLoading ? (
              <EmployeeReport />
            ) : (
              <div className="grid md:grid-cols-5 grid-cols-1 md:gap-4 gap-3 w-full">
                {CardData?.map((data: ICardData, index: number) => {
                  return <ShopCart data={data} key={index} />;
                })}
              </div>
            )}
        </div>

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Campaign Search records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CalendarRange range={range} setRange={setRange} />
                <div className="relative md:w-[400px] w-full">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                placeholder="Search campaign / product"
                className="p-2 px-4 pr-10 w-full border dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="absolute right-2 top-3 text-gray-400"
              >
                <Icon name="search" variant="outlined" />
              </button>
            </div>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchCampaignData}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          data={singleProduct}
          showCheckbox={false}
          isLoading={tableLoading}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          colValue={6}
          isSwitchOn={true}
          noDataViewCondition={
            singleProduct.length === 0 ? "No data available" : null
          }
        >
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Total</Th>
              <Th>Active</Th>
              <Th>Delivery</Th>
              <Th>Cancelled</Th>
              <Th>Returned</Th>
            </Tr>
          </Thead>

          <Tbody>
            {singleProduct.map((data: any, index: number) => {
              const total = data?.total_order || 0;

              return (
                <Tr key={index}>
                  <Td><span className="data-table-primary">{formatDate(data.date)}</span></Td>
                  <Td><span className="table-amount">{total}</span></Td>
                  <Td>
                    {data?.active_order}{" "}
                    <span className="text-xs text-gray-500">
                      ({getPercent(data?.active_order, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.delivery_count}{" "}
                    <span className="text-xs text-gray-500">
                      ({getPercent(data?.delivery_count, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.cancel_count}{" "}
                    <span className="text-xs text-red-500">
                      ({getPercent(data?.cancel_count, total)})
                    </span>
                  </Td>

                  <Td>
                    {data?.return_count}{" "}
                    <span className="text-xs text-yellow-500">
                      (
                      {getPercent(
                        data?.return_count,
                        total - (data?.cancel_count || 0)
                      )}
                      )
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
