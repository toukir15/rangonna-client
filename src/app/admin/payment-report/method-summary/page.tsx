"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { ICardData } from "@/app/admin/report/employee-report/page";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { MethodSummaryService } from "@admin/@services/apis/PaymentReport/MethodSummary/MethodSummary.service";

const Page: React.FC = () => {
  const [paymentReportData, setPaymentReportData] = useState<any>();
  const [paymentReport, setPaymentReport] = useState<any>();
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [tableLoading, setTableLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMonthlyPaymentSummary();
    fetchMonthlyPayment()
  }, [selectedMonth]);


  const formatMonth = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const fetchMonthlyPaymentSummary = async () => {
    setTableLoading(true);
    MethodSummaryService.getMethodSummary({

      date: formatMonth(selectedMonth)
    })
      .then((res: any) => {
        if (res?.success) {
          setPaymentReportData(res.data);
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

  const fetchMonthlyPayment = async () => {
    setTableLoading(true);
    MethodSummaryService.getMethodSummaryReport({

      date: formatMonth(selectedMonth)
    })
      .then((res: any) => {
        if (res?.success) {
          setPaymentReport(res.data);
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
      label: "Total Deposit",
      value: `${paymentReportData?.total_deposit?.toLocaleString() || 0}`,
      icon: "account_balance",
      color: "text-green-600",
    },
    {
      label: "Total Expense",
      value: `${paymentReportData?.total_expense?.toLocaleString() || 0}`,
      icon: "money_off",
      color: "text-red-600",
    },

    ...(paymentReportData?.payment_method_deposits?.map((item: any) => ({
      label: `${item?.payment_method} Deposit`,
      value: `${item?.total?.toLocaleString() || 0}`,
      icon:
        item?.payment_method === "bkash"
          ? "account_balance_wallet"
          : item?.payment_method === "nagad"
            ? "payments"
            : item?.payment_method === "bank"
              ? "account_balance"
              : item?.payment_method === "cash"
                ? "attach_money"
                : "south_west",
      color: "text-green-500",
    })) || []),

    ...(paymentReportData?.payment_method_expenses?.map((item: any) => ({
      label: `${item?.payment_method} Expense`,
      value: `${item?.total?.toLocaleString() || 0}`,
      icon:
        item?.payment_method === "bkash"
          ? "account_balance_wallet"
          : item?.payment_method === "nagad"
            ? "payments"
            : item?.payment_method === "bank"
              ? "account_balance"
              : item?.payment_method === "cash"
                ? "money_off"
                : "north_east",
      color: "text-red-500",
    })) || []),
  ];
  useTableRefreshRegister(fetchMonthlyPaymentSummary);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Method Summary
                </h1>
              </div>
              <div className="md:flex items-center w-full gap-4">

                <div className="">
                  <CustomDatePicker
                    selectedDate={selectedMonth || new Date()}
                    onChange={(date) => setSelectedMonth(date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="Select month"
                    wrapperClassName="w-64 mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 w-full">
              {tableLoading ? (
                <EmployeeReport />
              ) : (
                <div className="grid md:grid-cols-5 grid-cols-1 md:gap-4 gap-3 w-full">
                  {CardData?.map((data: ICardData, index: number) => {
                    return <ShopCart data={data} key={index} />;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[74%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={paymentReport}
          noDataViewCondition={
            paymentReport?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[600px]"
          isLoading={tableLoading}
          colValue={3}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Method
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Deposit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Expense
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {paymentReport?.map((report: any, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{report?.payment_method}</Td>
                  <Td className="text-green-600 font-semibold">
                    {report?.total_deposit || 0}
                  </Td>
                  <Td className="text-red-600 font-semibold">
                    {report?.total_expense || 0}
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
