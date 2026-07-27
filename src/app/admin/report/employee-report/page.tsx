"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import SelectComponent from "@admin/components/core/Select/Select";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableLoading from "@admin/components/Table/TableLoading";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatDateRange } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";

export interface ICardData {
  label: string;
  icon: string;
  value: any;
  color?: string;
  percentage?: string;
}

interface ITeamData {
  id: number;
  name: string;
  email: string;
  created_at: string;
  phone: string;
  status: string;
  role: string;
  image?: any;
}

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teamData, setTeamData] = useState<ITeamData[]>([]);
  const [employeeReportData, setEmployeeReportData] = useState<any>();
  const [selectedEmployee, setSelectedEmployee] = useState<any>({
    value: "all",
    label: "All Employee",
  });
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const { baseAPI, token } = useGlobalContext();

  const fetchEmployeeReport = async () => {
    setIsLoading(true);
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    try {
      const response = await fetch(
        `${baseAPI}/team_reports.php?user=${selectedEmployee?.value}&from=${formattedFrom}&to=${formattedTo}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const reportData = await response.json();
      setEmployeeReportData(reportData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeReport();
  }, [token, selectedEmployee, range]);

  const employeeOption = [
    { value: "all", label: "All Employee" },
    ...teamData.map((emp) => ({
      value: emp.id,
      label: emp.name,
    })),
  ];

  useEffect(() => {
    fetchTeamList();
  }, [baseAPI]);

  const fetchTeamList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseAPI}/teamList.php`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch websites");
      const data = await response.json();
      setTeamData(data.data);
    } catch {
      ToastService.error("Faild to fetch website");
    }
  };

  const CardData: ICardData[] = [
    {
      label: "Total",
      value: `${employeeReportData?.data?.summary?.uniqueStatusUpdates?.toLocaleString() ||
        0
        }`,
      icon: "celebration",
      color: "text-orange-500",
      percentage: (
        ((Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ?? 0) /
          (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
            1)) *
        100
      ).toFixed(2),
    },
    {
      label: "Confirmed",
      value: `${employeeReportData?.data?.summary?.uniqueConfirmedOrders?.toLocaleString() ||
        0
        }`,
      icon: "inventory_2",
      color: "text-green-500",
      percentage: (
        ((Number(employeeReportData?.data?.summary?.uniqueConfirmedOrders) ??
          0) /
          (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
            1)) *
        100
      ).toFixed(2),
    },
    {
      label: "Unpaid",
      value: `${employeeReportData?.data?.summary?.uniqueUnpaidOrders?.toLocaleString() ||
        0
        }`,
      icon: "paid",
      color: "text-yellow-500",
      percentage: (
        ((Number(employeeReportData?.data?.summary?.uniqueUnpaidOrders) ?? 0) /
          (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
            1)) *
        100
      ).toFixed(2),
    },
    {
      label: "Followup",
      value: `${0}`,
      icon: "celebration",
      color: "text-green-500",
      percentage: "0",
    },
    {
      label: "Cancelled",
      value: `${employeeReportData?.data?.summary?.uniqueCancelledOrders?.toLocaleString() ||
        0
        }`,
      icon: "shopping_cart",
      color: "text-cyan-500",
      percentage: (
        ((Number(employeeReportData?.data?.summary?.uniqueCancelledOrders) ??
          0) /
          (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
            1)) *
        100
      ).toFixed(2),
    },
    {
      label: "Create",
      value: `${employeeReportData?.data?.summary?.createdOrders?.toLocaleString() || 0
        }`,
      icon: "wallet",
      color: "text-blue-500",
    },
  ];
  useTableRefreshRegister(fetchEmployeeReport);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="md:px-6 px-3 pt-4 md:flex items-center gap-4">
          <h1 className="text-xl font-bold md:mb-0 mb-3 dark:text-gray-400">
            Employee Report
          </h1>
          <SelectComponent
            options={employeeOption}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="All Employee"
            className="md:w-56 w-full"
          />
          <CalendarRange range={range} setRange={setRange} />
        </div>
      </NoScrollLayout>
      <div className="md:px-6 px-3 pt-4 min-h-[70vh]">
        <div>
          {isLoading ? (
            <EmployeeReport />
          ) : (
            <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
              {CardData?.map((data: ICardData, index: number) => {
                return <ShopCart data={data} key={index} />;
              })}
            </div>
          )}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <TableLoading />
          ) : (
            <TableWrapper
              showCheckbox={true}
              className="min-h-[500px]"
              colValue={8}
              printLabel="Label Print"
              isLoading={isLoading}
              data={employeeReportData?.data?.users}
              isSwitchOn
            // noDataViewCondition={
            //   employeeReportData?.data?.length < 1 ? "No data available" : null
            // }
            >
              <Thead>
                <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                  <Th className="min-w-32 text-blue-900 dark:text-gray-200">
                    SL
                  </Th>

                  <Th className="min-w-48 text-blue-900 dark:text-gray-200">
                    Employee Name
                  </Th>
                  <Th className="min-w-32 text-blue-900 dark:text-gray-200">
                    Total
                  </Th>

                  <Th className="min-w-36 text-blue-900 dark:text-gray-200">
                    Confirmed
                  </Th>
                  <Th className=" min-w-48 text-blue-900 dark:text-gray-200">
                    Unpaid
                  </Th>
                  <Th className=" min-w-40 text-blue-900 dark:text-gray-200">
                    Followup
                  </Th>
                  <Th className="min-w-36 text-blue-900 dark:text-gray-200">
                    Cancelled
                  </Th>
                  <Th className="min-w-36 text-blue-900 dark:text-gray-200">
                    Create
                  </Th>
                </Tr>
              </Thead>
              <Tbody className="dark:bg-gray-800 bg-white">
                {employeeReportData?.data?.users?.map(
                  (employeeReport: any, index: number) => {
                    return (
                      <Tr
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        key={index}
                      >
                        <Td>
                          <div className=" font-bold">
                            {employeeReport?.userId}
                          </div>
                        </Td>
                        <Td>
                          <div className="font-semibold">
                            {employeeReport?.userName}
                          </div>
                        </Td>
                        <Td>{employeeReport?.summary?.uniqueStatusUpdates}</Td>
                        <Td>
                          {employeeReport?.summary?.uniqueConfirmedOrders}
                        </Td>
                        <Td>{employeeReport?.summary?.uniqueUnpaidOrders}</Td>
                        <Td>{0}</Td>
                        <Td>
                          {employeeReport?.summary?.uniqueCancelledOrders}
                        </Td>
                        <Td>{employeeReport?.summary?.createdOrders}</Td>
                      </Tr>
                    );
                  }
                )}
              </Tbody>
            </TableWrapper>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
