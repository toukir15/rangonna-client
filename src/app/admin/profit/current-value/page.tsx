"use client";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useMemo, useState } from "react";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { IWarehouseReportResponse } from "@admin/@interfaces/stockReport/stockReport.interface";
import Button from "@admin/components/core/Button/Button";
import { useGlobalContext } from "@admin/context/GlobalContext";
import ProfitModal from "@admin/components/pages/Profit/ProfitModal";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import CurrentValueCart from "@admin/components/pages/ShopCart/CurrentValueCart";

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [warehouseReport, setWarehouseReport] = useState<any>();
  const [currenValue, setCurrenValue] = useState<any>();
  const [currenValueMonthly, setCurrenValueMonthly] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [courierAmount, setCourierAmount] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [investorAmount, setInvestorAmount] = useState<number>(0);

  const toNumber = (value: any) => Number(value) || 0;

  const getWareHouseReport = () => {
    setIsLoading(true);
    WarehouseService.getWarehouseReport()
      .then((res: IWarehouseReportResponse) => {
        if (res?.success) {
          setWarehouseReport(res.data);
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

  const getCurrenValue = () => {
    setIsLoading(true);
    WarehouseService.getCurrentValue()
      .then((res: any) => {
        if (res?.success) {
          setCurrenValue(res.data);
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

  const formatMonth = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const getCurrenValueMonthly = () => {
    setIsLoading(true);
    WarehouseService.getCurrentValueMonthly({
      date: selectedMonth ? formatMonth(selectedMonth) : "all",
    })
      .then((res: any) => {
        if (res?.success) {
          setCurrenValueMonthly(res.data?.data);
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
    getWareHouseReport();
    getCurrenValue();
  }, []);

  useEffect(() => {
    getCurrenValueMonthly();
  }, [selectedMonth]);

  const monthlyData = useMemo(
    () => currenValueMonthly?.[0] || {},
    [currenValueMonthly],
  );
  const previousMonthData = useMemo(
    () => currenValueMonthly?.[1] || {},
    [currenValueMonthly],
  );

  const total = useMemo(() => {
    return (
      toNumber(currenValue?.total_deposit_amount) -
      toNumber(currenValue?.total_expense_amount)
    );
  }, [currenValue]);

  const currentMonthValuation = useMemo(() => {
    return (
      toNumber(monthlyData?.total_stock) +
      toNumber(monthlyData?.total_deposit_amount) +
      toNumber(monthlyData?.total_courier_amount) -
      toNumber(monthlyData?.total_expense_amount) -
      toNumber(monthlyData?.total_purchase_due)
    );
  }, [monthlyData]);

  const priviousMonthValuation = useMemo(() => {
    return (
      toNumber(previousMonthData?.total_stock) +
      toNumber(previousMonthData?.total_deposit_amount) +
      toNumber(previousMonthData?.total_courier_amount) -
      toNumber(previousMonthData?.total_expense_amount) -
      toNumber(previousMonthData?.total_purchase_due)
    );
  }, [monthlyData]);

  const CardData: any[] = [
    {
      label: "Stock Value",
      value: `${toNumber(
        warehouseReport?.remaining_stock_purchase_value,
      ).toLocaleString()}`,
      icon: "inventory",
      color: "text-orange-500",
    },
    {
      label: "Current Balance",
      value: `${toNumber(total).toLocaleString()}`,
      icon: "account_balance_wallet",
      color: "text-green-500",
    },
    {
      label: "Supplier Due",
      value: `${toNumber(currenValue?.total_purchase_due).toLocaleString()}`,
      icon: "receipt_long",
      color: "text-yellow-500",
    },
    {
      label: "Courier Amount",
      value: courierAmount,
      icon: "local_shipping",
      color: "text-blue-500",
      isInput: true,
      onChange: (value: string) => setCourierAmount(Number(value) || 0),
    },
    {
      label: "Valuation",
      value: `${warehouseReport?.remaining_stock_purchase_value + toNumber(total) + courierAmount - currenValue?.total_purchase_due}`,
      icon: "price_check",
      color: "text-purple-500",
    },
  ];

  const CardData2: any[] = [
    {
      label: "Stock Value",
      value: `${toNumber(monthlyData?.total_stock).toLocaleString()}`,
      icon: "inventory",
      color: "text-orange-500",
    },
    {
      label: "Current Balance",
      value: `${Number(monthlyData?.total_deposit_amount - monthlyData?.total_expense_amount)}`,
      icon: "account_balance_wallet",
      color: "text-green-500",
    },
    {
      label: "Courier Amount",
      value: `${toNumber(monthlyData?.total_courier_amount).toLocaleString()}`,
      icon: "local_shipping",
      color: "text-yellow-500",
    },
    {
      label: "Supplier Due",
      value: `${toNumber(monthlyData?.total_purchase_due).toLocaleString()}`,
      icon: "receipt_long",
      color: "text-yellow-500",
    },
    {
      label: "Valuation",
      value: `${currentMonthValuation}`,
      icon: "price_check",
      color: "text-purple-500",
    },
    {
      label: "Profit",
      value: `${currentMonthValuation - priviousMonthValuation}`,
      icon: "trending_up",
      color: "text-purple-500",
    },
    {
      label: "Total Value",
      value: totalValue,
      icon: "payments",
      color: "text-blue-500",
      isInput: true,
      onChange: (value: string) => setTotalValue(Number(value) || 0),
    },
    {
      label: "SingleProfit",
      value: `${(((currentMonthValuation - priviousMonthValuation) / totalValue) * 0.1).toFixed(0)}`,
      icon: "percent",
      color: "text-purple-500",
    },
    {
      label: "Investor Value",
      value: investorAmount,
      icon: "person",
      color: "text-blue-500",
      isInput: true,
      onChange: (value: string) => setInvestorAmount(Number(value) || 0),
    },
    {
      label: "Net Profit",
      value: `${(((currentMonthValuation - priviousMonthValuation) / totalValue) * 0.1 * investorAmount).toFixed(0)}`,
      icon: "savings",
      color: "text-purple-500",
    },
  ];

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center justify-between md:space-x-4 w-full">
              <div className="flex items-center gap-4">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Current Value
                </h1>

                {permissionList.includes("current_value_monthly_create") && (
                  <Button
                    className="!bg-green-200 !text-green-600 !py-1.5 !px-4"
                    onClick={handleAddClick}
                  >
                    Add Monthly Value
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            {permissionList.includes("current_value_summary_view") && (
              <div>
                {isLoading ? (
                  <EmployeeReport />
                ) : (
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
                    {CardData?.map((data: any, index: number) => (
                      <CurrentValueCart data={data} key={index} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-4 mb-1">
              <h2 className="font-bold text-xl ">Monthly Current Value: </h2>
              <div className="mt-2">
                <CustomDatePicker
                  selectedDate={selectedMonth}
                  onChange={(date) => {
                    setSelectedMonth(date);
                  }}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="Select month"
                  wrapperClassName="w-64"
                />
              </div>
            </div>

            {permissionList.includes("current_value_monthly_view") && (
              <div>
                {isLoading ? (
                  <EmployeeReport />
                ) : (
                  <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
                    {CardData2?.map((data: any, index: number) => (
                      <CurrentValueCart data={data} key={index} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <ProfitModal
        currenValue={currenValue}
        warehouseReport={warehouseReport}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </AuthLayout>
  );
};

export default Page;
