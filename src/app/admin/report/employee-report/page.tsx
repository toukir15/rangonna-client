"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import CalendarRange from "@admin/components/core/Calendar/CalendarRange";
import SelectComponent from "@admin/components/core/Select/Select";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Employee Report" />

        {isLoading ? (
          <EmployeeReport />
        ) : (
          <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full mb-4">
            {CardData?.map((data: ICardData, index: number) => {
              return <ShopCart data={data} key={index} />;
            })}
          </div>
        )}
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Employee records</p>
            <p className="premium-table-toolbar-meta">
              {employeeReportData?.data?.users?.length?.toLocaleString?.() || 0} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <CalendarRange range={range} setRange={setRange} />
                <SelectComponent
            options={employeeOption}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder="All Employee"
            className="md:w-56 w-full"
          />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchEmployeeReport}
                isLoading={isLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
              showCheckbox={true}
              className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
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
                <Tr>
                  <Th className="min-w-32">
                    SL
                  </Th>

                  <Th className="min-w-48">
                    Employee Name
                  </Th>
                  <Th className="min-w-32">
                    Total
                  </Th>

                  <Th className="min-w-36">
                    Confirmed
                  </Th>
                  <Th className="min-w-48">
                    Unpaid
                  </Th>
                  <Th className="min-w-40">
                    Followup
                  </Th>
                  <Th className="min-w-36">
                    Cancelled
                  </Th>
                  <Th className="min-w-36">
                    Create
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {employeeReportData?.data?.users?.map(
                  (employeeReport: any, index: number) => {
                    return (
                      <Tr className="cursor-pointer" key={index}
                      >
                        <Td><span className="table-amount">{employeeReport?.userId}</span></Td>
                        <Td><span className="data-table-primary">{employeeReport?.userName}</span></Td>
                        <Td><span className="table-amount">{employeeReport?.summary?.uniqueStatusUpdates}</span></Td>
                        <Td><span className="table-amount">{employeeReport?.summary?.uniqueConfirmedOrders}</span></Td>
                        <Td><span className="table-amount">{employeeReport?.summary?.uniqueUnpaidOrders}</span></Td>
                        <Td><span className="data-table-muted">{0}</span></Td>
                        <Td><span className="table-amount">{employeeReport?.summary?.uniqueCancelledOrders}</span></Td>
                        <Td><span className="table-amount">{employeeReport?.summary?.createdOrders}</span></Td>
                      </Tr>
                    );
                  }
                )}
              </Tbody>
            </TableWrapper>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
