"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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

      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="flex flex-wrap items-center items-center gap-3">
            <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 flex text-nowrap">
              Expense Report
            </h1>
              <AllFilter
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
          </div>
          
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full md:mt-2 mt-0">
        <TableWrapper
          showCheckbox={true}
          data={expensesData}
          noDataViewCondition={
            expensesData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Total : <span className="text-red-600">{totalAmount}</span>
              </Th>
              <Th className="dark:text-gray-300 min-w-40">Quick View</Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {expensesData?.map((supplier: IExpenseReport, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{supplier?.category_name}</Td>
                  <Td>{supplier?.total_amount}</Td>
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
