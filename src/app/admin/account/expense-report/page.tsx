"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { last30DaysRange } from "@admin/utils/helper";
import { reportService } from "@admin/@services/apis/Report/Report.service";
import { hasPermission, useLocalStorageDateRange } from "@admin/utils";
import {
  IExpenseReport,
  IExpenseReportResponse,
} from "@admin/@interfaces/report/expenseReport.interface";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";

import ExpenseListQuickViewModal from "@admin/components/pages/AccountsLists/ExpenseListQuickViewModal";
import Button from "@admin/components/core/Button/Button";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [expensesData, setExpensesData] = useState<IExpenseReport[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<any | null>(null);

  useEffect(() => {
    fetchSupplierReport();
  }, [range]);

  const formattedFrom = formatDateRange(range.startDate).trim();
  const formattedTo = formatDateRange(range.endDate).trim();

  const fetchSupplierReport = async () => {
    setTableLoading(true);
    reportService
      .getExpenseReport({
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: IExpenseReportResponse) => {
        if (res?.success) {
          setExpensesData(res.data);
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

  const totalAmount = expensesData?.reduce(
    (sum: number, supplier: IExpenseReport) =>
      sum + (supplier?.total_amount || 0),
    0
  );
  useTableRefreshRegister(fetchSupplierReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Expense Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Expense records</p>
            <p className="premium-table-toolbar-meta">
              {expensesData?.length?.toLocaleString() || 0} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <AllFilter
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchSupplierReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={expensesData}
          noDataViewCondition={
            expensesData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Total : <span className="text-red-600">{totalAmount}</span>
              </Th>
              <Th className="dark:text-gray-300 min-w-40">Quick View</Th>
            </Tr>
          </Thead>
          <Tbody>
            {expensesData?.map((supplier: IExpenseReport, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{supplier?.category_name}</span></Td>
                  <Td><span className="table-amount">{supplier?.total_amount}</span></Td>
                  <Td>
                    {hasPermission(
                      permissionList,
                      "showroom_payment_history_quick_view"
                    ) && (
                        <Icon
                          onClick={() => {
                            setModalOpen(true);
                            setItems(supplier);
                          }}
                          name={"visibility"}
                          variant="outlined"
                          className="cursor-pointer"
                        />
                      )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableWrapper>
          
        </div>
        <ExpenseListQuickViewModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          items={items}
          startDate={formattedFrom}
          endDate={formattedTo}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
