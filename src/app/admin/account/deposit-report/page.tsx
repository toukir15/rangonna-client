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
import { useLocalStorageDateRange } from "@admin/utils";
import {
  IDepositReport,
  IDepositReportResponse,
} from "@admin/@interfaces/report/depositReport.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [depositData, setDepositData] = useState<IDepositReport[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchDepositReport();
  }, [range]);

  const fetchDepositReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    reportService
      .getDepositReport({
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: IDepositReportResponse) => {
        if (res?.success) {
          setDepositData(res.data);
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
  const totalAmount = depositData?.reduce(
    (sum: number, supplier: IDepositReport) =>
      sum + (supplier?.total_amount || 0),
    0
  );
  useTableRefreshRegister(fetchDepositReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Deposit Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Deposit records</p>
            <p className="premium-table-toolbar-meta">
              {depositData?.length?.toLocaleString() || 0} records
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
                onRefresh={fetchDepositReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={depositData}
          noDataViewCondition={
            depositData?.length < 1 ? "No data available" : null
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
            </Tr>
          </Thead>
          <Tbody>
            {depositData?.map((supplier: IDepositReport, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{supplier?.company_name}</span></Td>
                  <Td><span className="table-amount">{supplier?.total_amount}</span></Td>
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
