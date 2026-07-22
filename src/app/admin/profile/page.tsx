"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import profile from "@admin/assets/images/profile.png";
import AuthLayout from "@admin/layouts/AuthLayout";
import { formateDateWithMonth, noData } from "@admin/utils";
import { IUser } from "@admin/@interfaces/profile/profile.interface";
import Icon from "@admin/components/core/Icon/Icon";
import UpdateProfileDrawer from "@admin/components/pages/UpdateProfile/UpdateProfileDrawer";
import { ICardData } from "../report/employee-report/page";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ChangePasswordModal from "@admin/components/pages/Profile/ChangePasswordModal";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { ToastService } from "@admin/utils/toastr.service";

import { ProfileService } from "@admin/@services/apis/Profile/Profile.sevice";
import { IAdvance } from "@admin/@interfaces/salaryManager/advanceSalary/AdvanceSalary.interface";
import InfoItem from "@admin/components/pages/Profile/InfoItem";

const Page: React.FC = () => {
  const [user, setUser] = useState<IUser | undefined>();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [advanceData, setAdvanceData] = useState<IAdvance[]>([]);
  const [holidayData, setHolidayData] = useState<any[]>([]);

  const handleEditClick = () => {
    setOpenDrawer(true);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const CardData: ICardData[] = [
    {
      label: "Total",
      value: `${20}`,
      icon: "celebration",
      color: "text-orange-500",
      // percentage: (
      //   ((Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ?? 0) /
      //     (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
      //       1)) *
      //   100
      // ).toFixed(2),
      percentage: "20%",
    },
    {
      label: "Confirmed",
      value: `${40}`,
      icon: "inventory_2",
      color: "text-green-500",
      // percentage: (
      //   ((Number(employeeReportData?.data?.summary?.uniqueConfirmedOrders) ??
      //     0) /
      //     (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
      //       1)) *
      //   100
      // ).toFixed(2),
      percentage: "20%",
    },
    {
      label: "Unpaid",
      value: `${40}`,
      icon: "paid",
      color: "text-yellow-500",
      // percentage: (
      //   ((Number(employeeReportData?.data?.summary?.uniqueUnpaidOrders) ?? 0) /
      //     (Number(employeeReportData?.data?.summary?.uniqueStatusUpdates) ||
      //       1)) *
      //   100
      // ).toFixed(2),
      percentage: "20%",
    },
    {
      label: "Followup",
      value: `${0}`,
      icon: "celebration",
      color: "text-green-500",
      percentage: "0%",
    },
    {
      label: "Cancelled",
      value: `${50}`,
      icon: "shopping_cart",
      color: "text-cyan-500",
      percentage: "20%",
    },
    {
      label: "Create",
      value: `${40}`,
      icon: "wallet",
      color: "text-blue-500",
    },
  ];

  const getSalaryReport = () => {
    setTableLoading(true);
    ProfileService.getSalaryReport({
      page: 1,
      limit: 50,
    })
      .then((res: any) => {
        if (res?.success) {
          setSalaryData(res?.data?.data);
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

  const getAdvanceList = () => {
    setTableLoading(true);
    ProfileService.getAdvanceReport({
      page: 1,
      limit: 50,
    })
      .then((res: any) => {
        if (res?.success) {
          setAdvanceData(res?.data?.data);
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
  const getHolidayList = () => {
    setTableLoading(true);
    ProfileService.getHolidayReport({
      page: 1,
      limit: 50,
    })
      .then((res: any) => {
        if (res?.success) {
          setHolidayData(res?.data?.data);
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

  useEffect(() => {
    getSalaryReport();
    getAdvanceList();
    getHolidayList();
  }, []);

  const getMonthYearFromYYYYMM = (value: string): string => {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);

    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AuthLayout>
      <div className="md:p-4 p-4  min-h-[86%]">
        <div className="bg-white dark:bg-gray-800 dark:text-gray-300 px-4 pb-10 pt-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Profile Card */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              {/* Top action */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02]"
                >
                  <Icon name="edit_square" size={18} />
                  <span>Update Password</span>
                </button>
              </div>

              {/* Profile Image */}
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full border-4 border-blue-100 p-1 dark:border-blue-500/20">
                  <Image
                    src={profile}
                    alt="Profile Picture"
                    className="h-28 w-28 rounded-full object-cover"
                  />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  Software Engineer
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                  {user?.name || noData}
                </p>

                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  UID: EC-1001
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Active
                </div>
              </div>
            </div>

            {/* Right Info Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              {/* Header */}
              <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-blue-100">Profile Summary</p>
                  <p className="text-lg font-bold text-white">
                    Progress: <span className="text-green-300">Excellent</span>
                  </p>
                </div>

                <button
                  onClick={() => handleEditClick()}
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Icon name="edit_square" size={18} />
                  <span>Update</span>
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem label="Joining Date" value="15 Dec 2024" />
                  <InfoItem
                    label="Status"
                    value={
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        Active
                      </span>
                    }
                  />
                  <InfoItem label="Phone No" value="01824751931" />
                  <InfoItem label="Email" value={user?.email || "--"} />
                  <InfoItem label="Address" value="Kaligonj, Gazipur, Dhaka" />
                  <InfoItem label="Role" value={user?.role || "--"} />
                  <InfoItem label="DOB" value="02-03-2000" />
                  <InfoItem label="Gender" value="Male" />
                </div>
              </div>
            </div>
          </div>
          {/* Your Activity */}
          <div className="space-y-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Your Activity
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Track your daily performance, work summary, and activity insights.
                </p>
              </div>
            </div>

            {/* Card Wrapper */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              {isLoading ? (
                <EmployeeReport />
              ) : CardData?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
                  {CardData?.map((data: ICardData, index: number) => {
                    return <ShopCart data={data} key={index} />;
                  })}
                </div>
              ) : (
                <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-800/40">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-700">
                    <Icon
                      name="insights"
                      className="text-gray-400 dark:text-gray-300"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    No Activity Found
                  </h3>

                  <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-gray-400">
                    There is no activity data available right now. Please check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Your Salary Report */}
          <div className="space-y-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Your Salary Report
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  View monthly salary details, attendance summary, bonus, and payment status.
                </p>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <TableWrapper
                showCheckbox={true}
                data={salaryData}
                noDataViewCondition={salaryData.length < 1 ? "No salary report found" : null}
                isSwitchOn={true}
                className=""
                isLoading={tableLoading}
                colValue={11}
              >
                <Thead>
                  <Tr className="h-[54px] border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <Th className="min-w-48 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Employee
                    </Th>
                    <Th className="min-w-32 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Month
                    </Th>
                    <Th className="min-w-28 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Base
                    </Th>
                    <Th className="min-w-24 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Working
                    </Th>
                    <Th className="min-w-24 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Leave
                    </Th>
                    <Th className="min-w-24 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Absent
                    </Th>
                    <Th className="min-w-24 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Late
                    </Th>
                    <Th className="min-w-28 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Bonus
                    </Th>
                    <Th className="min-w-28 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Status
                    </Th>
                    <Th className="min-w-28 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Advance
                    </Th>
                    <Th className="min-w-32 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Total
                    </Th>
                  </Tr>
                </Thead>

                <Tbody className="bg-white dark:bg-gray-900">
                  {salaryData?.map((salary: any, index: number) => {
                    return (
                      <Tr
                        className="h-16 border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
                        key={index}
                      >
                        <Td>
                          <div className="flex flex-col">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {salary?.employee?.name || "--"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {salary?.employee?.phone || "--"}
                            </p>
                          </div>
                        </Td>

                        <Td>
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            {getMonthYearFromYYYYMM(salary.month)}
                          </span>
                        </Td>

                        <Td className="font-medium text-gray-700 dark:text-gray-200">
                          ৳ {salary?.base_salary ?? 0}
                        </Td>

                        <Td className="text-gray-700 dark:text-gray-200">
                          {salary?.working_days ?? 0}
                        </Td>

                        <Td className="text-gray-700 dark:text-gray-200">
                          {salary?.leave_days ?? 0}
                        </Td>

                        <Td className="text-gray-700 dark:text-gray-200">
                          {salary?.absent_days ?? 0}
                        </Td>

                        <Td className="text-gray-700 dark:text-gray-200">
                          {salary?.late_count ?? 0}
                        </Td>

                        <Td className="font-medium text-emerald-600 dark:text-emerald-400">
                          ৳ {salary?.bonus ?? 0}
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${salary.status === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                              }`}
                          >
                            {salary?.status || "unpaid"}
                          </span>
                        </Td>

                        <Td className="font-medium text-rose-600 dark:text-rose-400">
                          ৳ {salary?.advance_taken ?? 0}
                        </Td>

                        <Td>
                          <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                            ৳ {salary?.details?.net_salary ?? 0}
                          </span>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </TableWrapper>
            </div>
          </div>
          {/* Your Advance Report */}
          <div className="space-y-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Your Advance Report
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Track advance payments, request dates, and related notes.
                </p>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <TableWrapper
                showCheckbox={true}
                data={advanceData}
                noDataViewCondition={advanceData.length < 1 ? "No advance report found" : null}
                isSwitchOn={true}
                className=""
                isLoading={tableLoading}
                colValue={4}
              >
                <Thead>
                  <Tr className="h-[54px] border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <Th className="min-w-44 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Name
                    </Th>
                    <Th className="min-w-36 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Date
                    </Th>
                    <Th className="min-w-32 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Amount
                    </Th>
                    <Th className="min-w-56 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Note
                    </Th>
                  </Tr>
                </Thead>

                <Tbody className="bg-white dark:bg-gray-900">
                  {advanceData?.map((advance: IAdvance, index: number) => {
                    return (
                      <Tr
                        className="h-16 border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
                        key={index}
                      >
                        <Td>
                          <div className="flex flex-col">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {advance?.employee?.name || "--"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Advance record
                            </p>
                          </div>
                        </Td>

                        <Td>
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            {formateDateWithMonth(advance?.createdAt)}
                          </span>
                        </Td>

                        <Td>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            ৳ {Number(advance?.amount || 0).toLocaleString("en-BD")}
                          </span>
                        </Td>

                        <Td>
                          <p className="max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {advance?.note || "No note added"}
                          </p>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </TableWrapper>
            </div>
          </div>
          {/* Your Holiday Report */}
          <div className="space-y-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Your Holiday Report
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View your holiday records, dates, and notes in one place.
                </p>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <TableWrapper
                showCheckbox={true}
                data={holidayData}
                noDataViewCondition={
                  holidayData.length < 1 ? "No holiday records found" : null
                }
                isSwitchOn={true}
                isLoading={tableLoading}
                colValue={4}
              >
                <Thead>
                  <Tr className="h-[54px] border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <Th className="min-w-44 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Name
                    </Th>
                    <Th className="min-w-36 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Date
                    </Th>
                    <Th className="min-w-32 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Type
                    </Th>
                    <Th className="min-w-56 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                      Note
                    </Th>
                  </Tr>
                </Thead>

                <Tbody className="bg-white dark:bg-gray-900">
                  {holidayData?.map((holiday: any, index: number) => {
                    return (
                      <Tr
                        key={index}
                        className="h-16 border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60"
                      >
                        <Td>
                          <div className="flex flex-col">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {holiday?.employee?.name || "--"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Holiday entry
                            </p>
                          </div>
                        </Td>

                        <Td>
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            {formateDateWithMonth(holiday?.createdAt)}
                          </span>
                        </Td>

                        <Td>
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 capitalize">
                            {holiday?.holiday_type || "General"}
                          </span>
                        </Td>

                        <Td>
                          <p className="max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {holiday?.note || "No note available"}
                          </p>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </TableWrapper>
            </div>
          </div>
        </div>
      </div>

      <UpdateProfileDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        user={user}
      />

      <ChangePasswordModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </AuthLayout>
  );
};

export default Page;
