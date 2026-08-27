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
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import { last30DaysRange } from "@admin/utils/helper";
import { reportService } from "@admin/@services/apis/Report/Report.service";
import { useLocalStorageDateRange } from "@admin/utils";
import {
  ISupplierReport,
  ISupplierReportResponse,
} from "@admin/@interfaces/report/supplierReport.interface";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [supplierData, setSupplierData] = useState<ISupplierReport[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);

  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );

  useEffect(() => {
    fetchSupplierReport();
  }, [range]);

  const fetchSupplierReport = async () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();
    setTableLoading(true);
    reportService
      .getSupplierReport({
        startDate: formattedFrom,
        endDate: formattedTo,
      })
      .then((res: ISupplierReportResponse) => {
        if (res?.success) {
          setSupplierData(res.data);
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
  useTableRefreshRegister(fetchSupplierReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Supplier Report" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Supplier records</p>
            <p className="premium-table-toolbar-meta">
              {supplierData?.length?.toLocaleString() || 0} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CalendarRange
                range={range}
                setRange={setRange}
                className="sm:w-72 w-full"
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
          data={supplierData}
          noDataViewCondition={
            supplierData?.length < 1 ? "No data available" : null
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
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-36">
                Total Purchase
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-24">
                Total
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-20">
                Paid
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Due
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {supplierData?.map((supplier: ISupplierReport, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{supplier?.company_name}</span></Td>
                  <Td><span className="table-amount">{supplier?.total_purchase}</span></Td>
                  <Td><span className="table-amount">{supplier?.total_amount}</span></Td>
                  <Td><span className="table-amount">{supplier?.total_paid}</span></Td>
                  <Td><span className="data-table-muted">{supplier?.total_due}</span></Td>
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
