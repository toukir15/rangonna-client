"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@admin/layouts/AuthLayout";
import CardSkeleton from "@admin/components/Skeleton/Dashboard/CardSkeleton";
import { ToastService } from "@admin/utils/toastr.service";
import { formatDateRange } from "@admin/utils/hook.utils";
import { dashBoardService } from "@admin/@services/apis/DashboardService/Dashboard.service";
import { IEstimateData } from "@admin/@interfaces/dashboard/dashboard.interface";
import { getCookieeeee, useLocalStorageDateRange } from "@admin/utils";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { maxRange } from "@admin/utils/helper";
import UpdatePasswordModal from "@admin/components/pages/Profile/UpdatePasswordModal";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Icon from "@admin/components/core/Icon/Icon";
import PageHeader from "@admin/components/layout/PageHeader";

const DEFAULT_DATE_RANGE = {
  ...maxRange(),
  label: "Max",
};

interface IStatusItem {
  status: string;
  name: string;
  value: number;
}

const FILTER_TABS = [
  { id: "all", label: "All", tone: "" },
  { id: "pending", label: "Pending", tone: "is-warning" },
  { id: "waiting-payment", label: "Waiting Payment", tone: "is-warning" },
  { id: "approved", label: "Approved", tone: "is-success" },
  { id: "printed", label: "Printed", tone: "" },
  { id: "delivery", label: "Delivery", tone: "is-success" },
  { id: "cancel", label: "Cancelled", tone: "is-danger" },
  { id: "return", label: "Return", tone: "is-danger" },
] as const;

const page = () => {
  const router = useRouter();
  const { userInfo, canFetchPageData } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [allStatus, setAllStatus] = useState<IStatusItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [range, setRange] = useLocalStorageDateRange(
    "dashboardDateRange",
    DEFAULT_DATE_RANGE,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userInfo?.need_password_change) {
      setIsModalOpen(true);
    }
  }, [userInfo]);

  useEffect(() => {
    const authToken = getCookieeeee("authToken");
    if (!authToken) router.replace("/admin");
  }, []);

  const getStatusValue = useCallback(
    (status: string): number => {
      return allStatus.find((item) => item.status === status)?.value || 0;
    },
    [allStatus],
  );

  const calculatePercentage = useCallback(
    (statusValue: number): string => {
      const totalOrders = getStatusValue("all") || 0;
      if (totalOrders === 0) return "0%";
      const percentage = (statusValue / totalOrders) * 100;
      return `${percentage.toFixed(2)}%`;
    },
    [getStatusValue],
  );

  const estimateData: IEstimateData[] = [
    {
      label: "Total Sales",
      value: (getStatusValue("all") || 0).toLocaleString(),
      icon: "wallet",
      color: "",
      percentage: "100%",
      status: "all",
    },
    {
      label: "Pending Orders",
      value: getStatusValue("pending").toLocaleString(),
      icon: "shopping_cart",
      color: "",
      percentage: calculatePercentage(getStatusValue("pending")),
      status: "pending",
    },
    {
      label: "Waiting Payment",
      value: getStatusValue("waiting-payment").toLocaleString(),
      icon: "timer",
      color: "",
      percentage: calculatePercentage(getStatusValue("waiting-payment")),
      status: "waiting-payment",
    },
    {
      label: "Approved",
      value: getStatusValue("approved").toLocaleString(),
      icon: "done_all",
      color: "",
      percentage: calculatePercentage(getStatusValue("approved")),
      status: "approved",
    },
    {
      label: "Printed",
      value: getStatusValue("printed").toLocaleString(),
      icon: "print",
      color: "",
      percentage: calculatePercentage(getStatusValue("printed")),
      status: "printed",
    },
    {
      label: "Ready For Box",
      value: getStatusValue("ready-for-box").toLocaleString(),
      icon: "inventory_2",
      color: "",
      percentage: calculatePercentage(getStatusValue("ready-for-box")),
      status: "ready-for-box",
    },
    {
      label: "In Transit",
      value: getStatusValue("in-transit").toLocaleString(),
      icon: "local_shipping",
      color: "",
      percentage: calculatePercentage(getStatusValue("in-transit")),
      status: "in-transit",
    },
    {
      label: "Follow Up",
      value: getStatusValue("follow-up").toLocaleString(),
      icon: "track_changes",
      color: "",
      percentage: calculatePercentage(getStatusValue("follow-up")),
      status: "follow-up",
    },
    {
      label: "Delivery",
      value: getStatusValue("delivery").toLocaleString(),
      icon: "local_mall",
      color: "",
      percentage: calculatePercentage(getStatusValue("delivery")),
      status: "delivery",
    },
    {
      label: "Partial Delivery",
      value: getStatusValue("partial-delivery").toLocaleString(),
      icon: "incomplete_circle",
      color: "",
      percentage: calculatePercentage(getStatusValue("partial-delivery")),
      status: "partial-delivery",
    },
    {
      label: "Damaged",
      value: getStatusValue("damaged").toLocaleString(),
      icon: "explore_off",
      color: "",
      percentage: calculatePercentage(getStatusValue("damaged")),
      status: "damaged",
    },
    {
      label: "Cancelled",
      value: getStatusValue("cancel").toLocaleString(),
      icon: "error",
      color: "",
      percentage: calculatePercentage(getStatusValue("cancel")),
      status: "cancel",
    },
    {
      label: "Return",
      value: getStatusValue("return").toLocaleString(),
      icon: "keyboard_return",
      color: "",
      percentage: calculatePercentage(getStatusValue("return")),
      status: "return",
    },
    {
      label: "Refunded",
      value: getStatusValue("refunded").toLocaleString(),
      icon: "refresh",
      color: "",
      percentage: calculatePercentage(getStatusValue("refunded")),
      status: "refunded",
    },
    {
      label: "Exchange",
      value: getStatusValue("exchange").toLocaleString(),
      icon: "change_circle",
      color: "",
      percentage: calculatePercentage(getStatusValue("exchange")),
      status: "exchange",
    },
  ];

  const visibleCards = useMemo(() => {
    if (activeFilter === "all") return estimateData;
    return estimateData.filter((item: any) => item.status === activeFilter);
  }, [activeFilter, estimateData]);

  const totalOrders = getStatusValue("all");

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const formattedFrom = formatDateRange(range.startDate).trim();
      const formattedTo = formatDateRange(range.endDate).trim();

      const statusRes = await dashBoardService.getStatus({
        domain: "all",
        startDate: formattedFrom,
        endDate: formattedTo,
      });

      if (statusRes?.success) {
        setAllStatus(statusRes.data);
      } else {
        ToastService.error(
          statusRes?.message || "Failed to load status data",
        );
      }
    } catch (error: any) {
      ToastService.error(error?.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    if (!isInitialized || !canFetchPageData) return;
    const debounceTimer = setTimeout(() => fetchData(false), 300);
    return () => clearTimeout(debounceTimer);
  }, [range, isInitialized, canFetchPageData, fetchData]);

  return (
    <AuthLayout>
      <div className="dashboard-page px-3 py-3 lg:px-4">
        <PageHeader
          title="All Orders"
          action={
            <Link
              href="/admin/create-order"
              className="btn-primary btn-primary-inline !inline-flex !w-auto items-center gap-2"
            >
              <Icon name="add" size={18} />
              Create Order
            </Link>
          }
        />

        <div className="data-table-card glass-card rounded-2xl">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Order overview</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()}{" "}
              {totalOrders === 1 ? "order" : "orders"}
            </p>
          </div>

          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              <AllFilter isCalendarFilter={true} range={range} setRange={setRange} />
            </div>
            <div className="data-table-toolbar-end">
              <button
                type="button"
                className="data-table-refresh"
                onClick={() => fetchData(true)}
                disabled={isLoading || isRefreshing}
              >
                <Icon
                  name="refresh"
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="data-table-filters" role="tablist" aria-label="Order status">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.id === "all" ? totalOrders : getStatusValue(tab.id);
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`data-table-filter-tab ${
                    isActive ? "is-active" : tab.tone
                  }`}
                  onClick={() => setActiveFilter(tab.id)}
                >
                  {tab.label}
                  <span className="data-table-filter-count">({count})</span>
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="p-4">
              <CardSkeleton />
            </div>
          ) : (
            <div className="dashboard-metrics-grid">
              {visibleCards.map((data, index) => (
                <ShopCart data={data} key={`shop-cart-${index}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <UpdatePasswordModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </AuthLayout>
  );
};

export default page;
