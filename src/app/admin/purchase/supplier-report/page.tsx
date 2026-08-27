"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useMemo, useState } from "react";
import { last30DaysRange } from "@admin/utils/helper";
import { reportService } from "@admin/@services/apis/Report/Report.service";
import { useLocalStorageDateRange } from "@admin/utils";
import {
  ISupplierReport,
  ISupplierReportResponse,
} from "@admin/@interfaces/report/supplierReport.interface";
import { dueColor, paidColor } from "@admin/utils/constant";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const [supplierData, setSupplierData] = useState<ISupplierReport[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);  const [range, setRange] = useLocalStorageDateRange(
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
          setSupplierData(res.data || []);
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

  const totals = useMemo(() => {
    return supplierData.reduce(
      (acc, item) => {
        acc.totalPurchase += Number(item?.total_purchase || 0);
        acc.totalAmount += Number(item?.total_amount || 0);
        acc.totalPaid += Number(item?.total_paid || 0);
        acc.totalDue += Number(item?.total_due || 0);
        return acc;
      },
      {
        totalPurchase: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
      }
    );
  }, [supplierData]);
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
          data={supplierData}
          noDataViewCondition={
            supplierData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={5}
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
                Total:{" "}
                <span className="text-red-600">
                  {totals.totalAmount.toLocaleString()}
                </span>
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-20">
                Paid:{" "}
                <span className="text-red-600">
                  {totals.totalPaid.toLocaleString()}
                </span>
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">
                Due:{" "}
                <span className="text-red-600">
                  {totals.totalDue.toLocaleString()}
                </span>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {supplierData?.map((supplier: ISupplierReport, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{supplier?.company_name}</span></Td>
                  <Td><span className="table-amount">{Number(supplier?.total_purchase || 0).toLocaleString()}</span></Td>
                  <Td><span className="table-amount">{Number(supplier?.total_amount || 0).toLocaleString()}</span></Td>
                  <Td>
                    <div className="w-28">
                      <p className={`${paidColor}`}>{Number(supplier?.total_paid || 0).toLocaleString()}</p>
                    </div>
                  </Td>
                  <Td>
                    <div className="w-28">
                      <p className={`${dueColor}`}>
                        {Number(supplier?.total_due || 0).toLocaleString()}
                      </p>
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