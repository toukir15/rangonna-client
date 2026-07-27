"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between md:pb-2 pb-0">
            <div className="sm:flex sm:items-center sm:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 sm:mb-0 mb-2 flex text-nowrap">
                  Supplier Report
                </h1>
              </div>

              <CalendarRange
                range={range}
                setRange={setRange}
                className="sm:w-72 w-full"
              />
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={supplierData}
          noDataViewCondition={
            supplierData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-36  text-blue-900 dark:text-gray-200">
                Total Purchase
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-24  text-blue-900 dark:text-gray-200">
                Total
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-20  text-blue-900 dark:text-gray-200">
                Paid
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Due
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {supplierData?.map((supplier: ISupplierReport, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{supplier?.company_name}</Td>
                  <Td>{supplier?.total_purchase}</Td>
                  <Td>{supplier?.total_amount}</Td>
                  <Td>{supplier?.total_paid}</Td>
                  <Td>{supplier?.total_due}</Td>
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
