"use client";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { ICardData } from "@/app/admin/report/employee-report/page";
import Alert from "@admin/components/core/Aleart/Aleart";
import Icon from "@admin/components/core/Icon/Icon";
// import Button from "@admin/components/core/Button/Button";
// import { hasPermission } from "@admin/utils";
// import { useGlobalContext } from "@admin/context/GlobalContext";

const Page: React.FC = () => {
  // const { permissionList } = useGlobalContext();
  const [summaryData, setSummaryData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isSearchAlertOpen, setIsSearchAlertOpen] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncSearchLoading, setSyncSearchLoading] = useState<boolean>(false);

  const getProductStockSummary = () => {
    setIsLoading(true);
    WarehouseService.getStockSummary()
      .then((res: any) => {
        if (res?.success) {
          setSummaryData(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getProductStockSummary();
  }, []);

  const CardData: any[] = [
    {
      label: "Remaining Stock",
      value: `${summaryData?.remaining_stock?.toLocaleString() || 0}`,
      icon: "celebration",
      color: "text-orange-500",

    },
    {
      label: "Purchased Amount",
      value: `${summaryData?.remaining_stock_purchase_value.toLocaleString() || 0
        }`,
      icon: "inventory_2",
      color: "text-green-500",
      percentage: `${summaryData?.remaining_stock
        ? ((summaryData.remaining_stock_purchase_value / summaryData.remaining_stock)).toFixed(0)
        : 0
        }`
    },
    {
      label: "Sales Amount",
      value: `${summaryData?.remaining_stock_sales_value?.toLocaleString() || 0
        }`,
      icon: "paid",
      color: "text-yellow-500",
      percentage: `${summaryData?.remaining_stock
        ? ((summaryData?.remaining_stock_sales_value / summaryData.remaining_stock)).toFixed(0)
        : 0
        }`
    },
  ];

  const confirmRemove = async () => {
    setSyncLoading(true);

    try {
      const res = await WarehouseService.createProductStockSync();
      if (res?.success) {
        ToastService.success(res?.message);
        getProductStockSummary();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);

      setSyncLoading(false);
    }
  };
  const confirmSearchSync = async () => {
    setSyncSearchLoading(true);

    try {
      const res = await WarehouseService.createProductSearchSync();
      if (res?.success) {
        ToastService.success(res?.message);
        getProductStockSummary();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);

      setSyncSearchLoading(false);
    }
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
  };
  const cancelSearchRemove = () => {
    setIsSearchAlertOpen(false);
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Sync"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={syncLoading}
      >
        <h3 className="text-2xl font-bold text-center">Stock Update</h3>
        <h6 className="text-md my-4 text-center">
          Are you sure you want to product stock sync?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="sync_alt"
            variant="outlined"
            size={130}
            className="text-blue-400"
          />
        </div>
      </Alert>
      <Alert
        isOpen={isSearchAlertOpen}
        confirmLabel="Yes, Sync"
        cancelLabel="Cancel"
        onConfirm={confirmSearchSync}
        onCancel={cancelSearchRemove}
        isLoading={syncSearchLoading}
      >
        <h3 className="text-2xl font-bold text-center">Search Update</h3>
        <h6 className="text-md my-4 text-center">
          Are you sure you want to product Search sync?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="sync_alt"
            variant="outlined"
            size={130}
            className="text-blue-400"
          />
        </div>
      </Alert>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center justify-between md:space-x-4 w-full">
              <div className="w-60">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Stock Summary
                </h1>
              </div>
              {/* <div className="flex items-center gap-2">
                {hasPermission(permissionList, "product_stock_report_sync") && (
                  <Button
                    className="flex items-center bg-blue-500 !px-4"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    <Icon name={"sync"} />
                    <span className="ml-1 text-nowrap">Stock Sync </span>
                  </Button>
                )}

                {hasPermission(permissionList, "product_search_sync") && (
                  <Button
                    className="flex items-center bg-blue-500 !px-4"
                    onClick={() => setIsSearchAlertOpen(true)}
                  >
                    <Icon name={"sync"} />
                    <span className="ml-1 text-nowrap">Search Sync </span>
                  </Button>
                )}
              </div> */}
            </div>
          </div>
          <div className="">
            {isLoading ? (
              <EmployeeReport />
            ) : (
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
                {CardData?.map((data: ICardData, index: number) => {
                  return <ShopCart data={data} key={index} />;
                })}
              </div>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative min-h-[65%] md:min-h-[85%] w-full "></div>
    </AuthLayout>
  );
};

export default Page;
