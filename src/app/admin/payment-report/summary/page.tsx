"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";
import { ICardData } from "@/app/admin/report/employee-report/page";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";

const Page: React.FC = () => {
  const [paymentReportData, setPaymentReportData] = useState<any>();
  const [paymentReport, setPaymentReport] = useState<any>();
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [tableLoading, setTableLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMonthlyPaymentSummary();
    fetchMonthlyPayment();
  }, [selectedMonth]);

  const formatMonth = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const fetchMonthlyPaymentSummary = async () => {
    setTableLoading(true);
    OrderReportProfitService.getPaymentReportSummary({
      date: formatMonth(selectedMonth),
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
    OrderReportProfitService.getPaymentReport({
      date: formatMonth(selectedMonth),
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Summary" />
        
        <div className="mb-4">
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

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Summary records</p>
            <p className="premium-table-toolbar-meta">
              {paymentReport?.length?.toLocaleString() || 0} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CustomDatePicker
                    selectedDate={selectedMonth || new Date()}
                    onChange={(date) => setSelectedMonth(date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    placeholderText="Select month"
                    wrapperClassName="w-64 mt-1"
                  />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchMonthlyPaymentSummary}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={paymentReport}
          noDataViewCondition={
            paymentReport?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={4}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Account Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Deposit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Expense
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Deposit Method
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Expense Method
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {paymentReport?.map((report: any, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="table-amount">{report?.account_name}</span></Td>
                  <Td className="text-green-600 font-semibold"><span className="table-amount">{report?.total_deposit || 0}</span></Td>
                  <Td className="text-red-600 font-semibold"><span className="table-amount">{report?.total_expense || 0}</span></Td>
                  <Td>
                    <div className="flex gap-6">
                      <div className="text-green-600">
                        {report?.payment_method_deposits?.length > 0 ? (
                          report.payment_method_deposits.map(
                            (item: any, i: number) => (
                              <div key={i}>
                                {item.payment_method} : {item.total}
                              </div>
                            ),
                          )
                        ) : (
                          <div>-</div>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex gap-6">
                      <div className="text-red-600">
                        {report?.payment_method_expenses?.length > 0 ? (
                          report.payment_method_expenses.map(
                            (item: any, i: number) => (
                              <div key={i}>
                                {item.payment_method} : {item.total}
                              </div>
                            ),
                          )
                        ) : (
                          <div>-</div>
                        )}
                      </div>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableWrapper>
          
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default Page;
