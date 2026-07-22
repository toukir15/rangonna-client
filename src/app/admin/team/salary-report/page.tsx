"use client";

import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { ICardData } from "@/app/admin/report/employee-report/page";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/orders/order.interface";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";

const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [salaryData, setSalaryData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);

  const [selectedUser, setSelectedUser] = useState<SelectOption>({
    value: "all",
    label: "All User",
  });

  useEffect(() => {
    getSalaryReport();
  }, [selectedUser, selectedMonth, currentPage]);

  const formatMonth = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const getSalaryReport = () => {
    setIsLoading(true);
    OrderReportProfitService.getSalaryCard({
      month: selectedMonth ? formatMonth(selectedMonth) : "all",
      employee: selectedUser.value,
    })
      .then((res: any) => {
        if (res?.success) {
          setSalaryData(res.data);
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
    TaskService.getAssignEmploySuggestion().then((res: any) => {
      if (res?.success) {
        setUserOption([
          {
            label: "All Users",
            value: "all",
          },
          ...res.data.map((u: any) => ({
            label: u.name,
            value: u._id,
          })),
        ]);
      }
    });
  }, []);

  const CardData: any[] = [
    {
      label: "Total Paid Salary",
      value: `${Number(
        salaryData?.total_final_salary +
        salaryData?.total_holiday_salary +
        salaryData?.total_bonus +
        salaryData?.total_additional_bonus
      ) || 0}`,
      icon: "account_balance", // 💰 total money
      color: "text-orange-500",
    },
    {
      label: "Base Salary",
      value: `${salaryData?.total_salary?.toLocaleString() || 0}`,
      icon: "payments", // 💵 base payment
      color: "text-orange-500",
    },
    {
      label: "Payable Salary",
      value: `${salaryData?.total_final_salary?.toLocaleString() || 0}`,
      icon: "price_check", // ✅ payable confirmed
      color: "text-green-600",
    },
    {
      label: "Holiday Salary",
      value: `${salaryData?.total_holiday_salary?.toLocaleString() || 0}`,
      icon: "beach_access", // 🏖️ holiday vibe
      color: "text-green-600",
    },
    {
      label: "Working Days",
      value: `${salaryData?.total_working_days?.toLocaleString() || 0}`,
      icon: "work_history", // 📅 working history
      color: "text-blue-500",
    },
    {
      label: "Leave Days",
      value: `${salaryData?.total_leave_days?.toLocaleString() || 0}`,
      icon: "event_note", // 📝 leave record
      color: "text-purple-500",
    },
    {
      label: "Absent Days",
      value: `${salaryData?.total_absent_days?.toLocaleString() || 0}`,
      icon: "person_off", // 🚫 absent
      color: "text-red-500",
    },
    {
      label: "Late Count",
      value: `${salaryData?.total_late_count?.toLocaleString() || 0}`,
      icon: "alarm", // ⏰ late
      color: "text-yellow-600",
    },
    {
      label: "Bonus",
      value: `${salaryData?.total_bonus?.toLocaleString() || 0}`,
      icon: "emoji_events", // 🏆 bonus reward
      color: "text-pink-500",
    },
    {
      label: "Additional Salary",
      value: `${salaryData?.total_additional_bonus?.toLocaleString() || 0}`,
      icon: "add_card", // ➕ extra salary
      color: "text-indigo-500",
    },
  ];

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                Salary Report
              </h1>

              <div className="md:flex items-center gap-4">
                <div className="mt-2">
                  <CustomDatePicker
                    selectedDate={selectedMonth}
                    onChange={(date) => {
                      setSelectedMonth(date);
                      setCurrentPage(1);
                    }}
                    // label="Month"
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="Select month"
                    wrapperClassName="w-64"
                  />
                </div>
                <div>
                  <SelectComponent
                    options={userOption}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    placeholder="All Websites"
                    className="md:w-64 w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 mb-4">
          {isLoading ? (
            <EmployeeReport />
          ) : (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
              {CardData?.map((data: ICardData, index: number) => {
                return <ShopCart data={data} key={index} />;
              })}
            </div>
          )}
        </div>
      </NoScrollLayout>
    </AuthLayout>
  );
};

export default Page;
