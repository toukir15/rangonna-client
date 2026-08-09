"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import CardSkeleton from "@admin/components/Skeleton/Dashboard/CardSkeleton";
import { ToastService } from "@admin/utils/toastr.service";
import { formatDateRange } from "@admin/utils/hook.utils";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { dashBoardService } from "@admin/@services/apis/DashboardService/Dashboard.service";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { getCookieeeee, useLocalStorageDateRange } from "@admin/utils";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { maxRange } from "@admin/utils/helper";
import UpdatePasswordModal from "@admin/components/pages/Profile/UpdatePasswordModal";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { noPermission } from "@admin/utils/constant";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const DEFAULT_DATE_RANGE = {
  ...maxRange(),
  label: "Max",
};

interface IStatusItem {
  status: string;
  name: string;
  status_value: number;
  status_total: number;
}

const Page = () => {
  const router = useRouter();
  const { userInfo, canFetchPageData } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [allStatus, setAllStatus] = useState<IStatusItem[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [range, setRange] = useLocalStorageDateRange(
    "dashboardDateRange",
    DEFAULT_DATE_RANGE
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
  }, [router]);

  const getStatusValue = useCallback(
    (status: string): number => {
      return (
        allStatus.find((item) => item.status === status)?.status_total || 0
      );
    },
    [allStatus]
  );

  const getStatusLabel = useCallback(
    (status: string): React.ReactNode => {
      const value =
        allStatus.find((item) => item.status === status)?.status_value || 0;

      return <span className="text-red-500">{value}</span>;
    },
    [allStatus]
  );

  const calculatePercentage = useCallback(
    (statusValue: number): string => {
      const totalOrders = getStatusValue("all") || 0;
      if (totalOrders === 0) return "0%";
      const percentage = (statusValue / totalOrders) * 100;
      return `${percentage.toFixed(2)}%`;
    },
    [getStatusValue]
  );

  const estimateData: any[] = [
    {
      label: <>Total Sales : {getStatusLabel("all")}</>,
      value: getStatusValue("all").toLocaleString(),
      icon: "wallet",
      color:
        "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
      percentage: "100%",
    },
    {
      label: <>Pending Orders : {getStatusLabel("pending")}</>,
      value: getStatusValue("pending").toLocaleString(),
      icon: "shopping_cart",
      color:
        "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("pending")),
    },
    {
      label: <>Waiting Payment : {getStatusLabel("waiting-payment")}</>,
      value: getStatusValue("waiting-payment").toLocaleString(),
      icon: "timer",
      color:
        "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("waiting-payment")),
    },
    {
      label: <>Approved : {getStatusLabel("approved")}</>,
      value: getStatusValue("approved").toLocaleString(),
      icon: "done_all",
      color:
        "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("approved")),
    },
    {
      label: <>Printed : {getStatusLabel("printed")}</>,
      value: getStatusValue("printed").toLocaleString(),
      icon: "print",
      color:
        "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("printed")),
    },
    {
      label: <>Ready For Box : {getStatusLabel("ready-for-box")}</>,
      value: getStatusValue("ready-for-box").toLocaleString(),
      icon: "inventory_2",
      color:
        "bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("ready-for-box")),
    },
    {
      label: <>In Transit : {getStatusLabel("in-transit")}</>,
      value: getStatusValue("in-transit").toLocaleString(),
      icon: "local_shipping",
      color:
        "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("in-transit")),
    },
    {
      label: <>Follow Up : {getStatusLabel("follow-up")}</>,
      value: getStatusValue("follow-up").toLocaleString(),
      icon: "track_changes",
      color:
        "bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("follow-up")),
    },
    {
      label: <>Delivery : {getStatusLabel("delivery")}</>,
      value: getStatusValue("delivery").toLocaleString(),
      icon: "local_mall",
      color:
        "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("delivery")),
    },
    {
      label: <>Partial Delivery : {getStatusLabel("partial-delivery")}</>,
      value: getStatusValue("partial-delivery").toLocaleString(),
      icon: "incomplete_circle",
      color:
        "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("partial-delivery")),
    },
    {
      label: <>Damaged : {getStatusLabel("damaged")}</>,
      value: getStatusValue("damaged").toLocaleString(),
      icon: "explore_off",
      color:
        "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("damaged")),
    },
    {
      label: <>Cancelled : {getStatusLabel("cancel")}</>,
      value: getStatusValue("cancel").toLocaleString(),
      icon: "error",
      color:
        "bg-gradient-to-r from-red-400 via-rose-500 to-pink-600 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("cancel")),
    },
    {
      label: <>Return : {getStatusLabel("return")}</>,
      value: getStatusValue("return").toLocaleString(),
      icon: "keyboard_return",
      color:
        "bg-gradient-to-r from-rose-400 via-pink-500 to-red-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("return")),
    },
    {
      label: <>Refunded : {getStatusLabel("refunded")}</>,
      value: getStatusValue("refunded").toLocaleString(),
      icon: "refresh",
      color:
        "bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("refunded")),
    },
    {
      label: <>Exchange : {getStatusLabel("exchange")}</>,
      value: getStatusValue("exchange").toLocaleString(),
      icon: "change_circle",
      color:
        "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent",
      percentage: calculatePercentage(getStatusValue("exchange")),
    },
  ];

  useEffect(() => {
    const initialize = async () => {
      try {
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

        setIsInitialized(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          ToastService.error(error.message);
        } else {
          ToastService.error("Failed to initialize data");
        }
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized || !canFetchPageData) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const formattedFrom = formatDateRange(range.startDate).trim();
        const formattedTo = formatDateRange(range.endDate).trim();

        const statusRes = await dashBoardService.getSummary({
          domain: "all",
          startDate: formattedFrom,
          endDate: formattedTo,
        });

        if (statusRes?.success) {
          setAllStatus(statusRes?.data?.orderStatuses || []);        } else {
          ToastService.error(
            statusRes?.message || "Failed to load status data"
          );
        }
      } catch (error: any) {
        ToastService.error(error?.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedWebsite, range, isInitialized, canFetchPageData]);

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:px-4 px-3 2xl:pt-4 sm:pt-3 pt-2">
          <div className="flex flex-wrap items-center sm:mb-4 mb-4 gap-3">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              Summary
            </h2>
              <AllFilter
                            isCalendarFilter={true}
              range={range}
              setRange={setRange}
            />

          </div>
        </div>

        
      </NoScrollLayout>

      <div className="2xl:px-4 px-3">
        {isLoading ? (
          <div>
            <CardSkeleton />
          </div>
        ) : (
          <div className="flex-grow bg-myBg relative">
            <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 grid-cols-2  md:gap-4 gap-3 w-full">
              {estimateData.map((data, index) => (
                <ShopCart data={data} key={`shop-cart-${index}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <UpdatePasswordModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </AuthLayout>
  );
};

export default Page;
