"use client";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
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

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="w-full pb-2">
            <div className="flex items-center gap-3">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800  flex text-nowrap">
                Supplier Report
              </h1>
              <div>
                <Button
                  className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                >
                  <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
                </Button>
              </div>
            </div>

            {
              isFilterOpen && <div >
                <AllFilter
                  isFilterOpen={isFilterOpen}
                  isCalendarFilter={true}
                  range={range}
                  setRange={setRange}
                />
              </div>
            }
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={supplierData}
          noDataViewCondition={
            supplierData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={5}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-36 text-blue-900 dark:text-gray-200">
                Total Purchase
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-24 text-blue-900 dark:text-gray-200">
                Total:{" "}
                <span className="text-red-600">
                  {totals.totalAmount.toLocaleString()}
                </span>
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-20 text-blue-900 dark:text-gray-200">
                Paid:{" "}
                <span className="text-red-600">
                  {totals.totalPaid.toLocaleString()}
                </span>
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
                Due:{" "}
                <span className="text-red-600">
                  {totals.totalDue.toLocaleString()}
                </span>
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
                  <Td>{Number(supplier?.total_purchase || 0).toLocaleString()}</Td>
                  <Td>{Number(supplier?.total_amount || 0).toLocaleString()}</Td>
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
    </AuthLayout>
  );
};

export default Page;