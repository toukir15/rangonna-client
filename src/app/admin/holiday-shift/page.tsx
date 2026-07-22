"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import { useRouter } from "next/navigation";
import { MyLeaveService } from "@admin/@services/apis/TeamService/MyLeave.service";
import { ToastService } from "@admin/utils/toastr.service";
import { formatDateRange } from "@admin/utils/hook.utils";
import { getStatusStyle } from "@admin/utils/system.utils";
import Link from "next/link";
import {
    SummaryCardsSkeleton,
    LeaveHistorySkeleton,
    HolidaySkeleton,
    TodayShiftSkeleton,
} from "@admin/components/Skeleton/HolidayShift/HolidayShiftSkeleton";
import { trimString } from "@admin/utils";
import { getRosterStatus } from "@admin/components/pages/Utilities/data";
import { CompanyPolicyService } from "@admin/@services/apis/DutyPlan/CompanyPolicy/CompanyPolicy.service";
import PolicyModal from "@admin/components/pages/DutyPlan/PolicyModal/PolicyModal";
import { useGlobalContext } from "@admin/context/GlobalContext";


const cardBase =
    "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900";
const softCard =
    "rounded-2xl border border-gray-200 bg-white px-4  py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900";

const Page = (): JSX.Element => {
    const router = useRouter();
    const { canFetchPageData } = useGlobalContext();
    const [isOpen, setIsOpen] = useState(false);
    const [leaveData, setLeaveData] = useState<any[]>([]);
    const [holidaySummary, setHolidaySummary] = useState<any>({});
    const [rosterPlan, setRosterPlan] = useState<any>();
    const [rosterPlanSummary, setRosterPlanSummary] = useState<any>({});
    const [companyPolicySuggestions, setCompanyPolicySuggestions] = useState<any>();
    const [leaveLoading, setLeaveLoading] = useState(true);
    const [holidayLoading, setHolidayLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [policyInfo, setPolicyInfo] = useState();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getAdvanceList = () => {
        setLeaveLoading(true);

        MyLeaveService.getLeaveHistory()
            .then((res: any) => {
                if (res?.success) {
                    setLeaveData(res?.data);
                } else {
                    ToastService.error(res?.message || "Failed to load leave history");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err?.message || "Failed to load leave history");
            })
            .finally(() => {
                setLeaveLoading(false);
            });
    };

    const getHolidaySummary = () => {
        setHolidayLoading(true);

        const currentYear = new Date().getFullYear();

        MyLeaveService.getHolidaySummary(currentYear)
            .then((res: any) => {
                if (res?.success) {
                    setHolidaySummary(res?.data || {});
                } else {
                    ToastService.error(res?.message || "Failed to load holiday summary");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err?.message || "Failed to load holiday summary");
            })
            .finally(() => {
                setHolidayLoading(false);
            });
    };
    const fetchRosterPlan = () => {
        setHolidayLoading(true);
        MyLeaveService.getRosterPlan()
            .then((res: any) => {
                if (res?.success) {
                    setRosterPlan(res?.data || {});
                } else {
                    ToastService.error(res?.message || "Failed to load roster plan");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err?.message || "Failed to load holiday summary");
            })
            .finally(() => {
                setHolidayLoading(false);
            });
    };
    const fetchRosterPlanSummary = () => {
        setSummaryLoading(true);
        MyLeaveService.getRosterPlanSummary()
            .then((res: any) => {
                if (res?.success) {
                    setRosterPlanSummary(res?.data || {});
                } else {
                    ToastService.error(res?.message || "Failed to load roster plan");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err?.message || "Failed to load holiday summary");
            })
            .finally(() => {
                setSummaryLoading(false);
            });
    };

    const fetchCompanyPolicySuggestions = () => {

        CompanyPolicyService.getCompanyPolicySuggestions()
            .then((res: any) => {
                if (res?.success) {
                    setCompanyPolicySuggestions(res?.data);

                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            })

    };

    useEffect(() => {
        if (!canFetchPageData) return;
        getAdvanceList();
        getHolidaySummary();
        fetchRosterPlan();
        fetchRosterPlanSummary();
        fetchCompanyPolicySuggestions();
    }, [canFetchPageData]);

    const getTotalDays = (start: string, end: string) => {
        if (!start || !end) return 0;

        const startDate = new Date(start);
        const endDate = new Date(end);

        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;

        return diffDays > 0 ? diffDays : 0;
    };




    const formatToTitle = (value: string = "") => {
        return value
            .replace(/[-_]/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getDayFromDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split("-");
        const date = new Date(`${year}-${month}-${day}`);
        const engDay = date.toLocaleDateString("en-US", { weekday: "long" });
        const banglaDays: Record<string, string> = {
            Saturday: "শনিবার",
            Sunday: "রবিবার",
            Monday: "সোমবার",
            Tuesday: "মঙ্গলবার",
            Wednesday: "বুধবার",
            Thursday: "বৃহস্পতিবার",
            Friday: "শুক্রবার",
        };
        return `${engDay} - ${banglaDays[engDay]}`;
    };

    return (
        <AuthLayout>
            <NoScrollLayout>
                <div className="flex items-center px-3 pt-3 mb-3 flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Duty Plan
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex gap-4">
                            <Button
                                className="bg-blue-500 !px-3 !py-1.5 !text-sm"
                                onClick={() => router.push("/admin/notice")}
                            >
                                <span className="ml-1">Notice</span>
                            </Button>

                            <div className="relative" ref={dropdownRef}>
                                <Button
                                    className="bg-blue-500 !px-3 !py-1.5 !text-sm flex items-center gap-1"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    Company Policy
                                    <Icon
                                        name="expand_more"
                                        className={`transition-transform duration-700 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"
                                            }`}
                                    />
                                </Button>

                                {isOpen && (
                                    <div className="absolute  mt-2 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">

                                        {companyPolicySuggestions?.length ? (
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                {companyPolicySuggestions.map((item: any, index: number) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            setModalOpen(true);
                                                            setPolicyInfo(item);
                                                        }}
                                                    >
                                                        {formatToTitle(item.title)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">

                                                {/* Icon */}
                                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                                                    <Icon name="info" className="text-gray-500 dark:text-gray-300" />
                                                </div>

                                                {/* Title */}
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                    No Policies Found
                                                </p>

                                                {/* Subtitle */}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    There are no company policies available right now.
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </NoScrollLayout>

            <div className="px-3 pb-4 space-y-4">
                {/* Summary Cards */}
                {summaryLoading ? (
                    <SummaryCardsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                        {/* Today Shift */}
                        <div className={`${softCard} flex items-center gap-4`}>
                            <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400 flex items-center justify-center">
                                <Icon name="today" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Today Shift
                                </p>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {formatToTitle(rosterPlanSummary?.roster_plan?.shift_time) || "--"}
                                </h3>
                                <h3 className="text-sm text-gray-800 dark:text-white pt-1">
                                    {rosterPlanSummary?.roster_plan?.break_time || "--"}
                                </h3>
                            </div>
                        </div>

                        {/* Tomorrow Shift */}
                        <div className={`${softCard} flex items-center gap-4`}>
                            <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400 flex items-center justify-center">
                                <Icon name="event" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Tomorrow Shift
                                </p>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {formatToTitle(rosterPlanSummary?.tomorrow_shift?.shift_time) || "--"}
                                </h3>
                                <h3 className="text-sm text-gray-800 dark:text-white pt-1">
                                    {rosterPlanSummary?.tomorrow_shift?.break_time || "--"}
                                </h3>
                            </div>
                        </div>

                        {/* Team Leader */}
                        <div className={`${softCard} flex items-center gap-4`}>
                            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center">
                                <Icon name="groups" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Team Leader
                                </p>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {formatToTitle(rosterPlanSummary?.team_leader) || "--"}
                                </h3>
                            </div>
                        </div>

                        {/* Leave Balance */}
                        <div className={`${softCard} flex items-center gap-4`}>
                            <div className="h-12 w-12 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400 flex items-center justify-center">
                                <Icon name="event_available" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Leave Balance
                                </p>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {rosterPlanSummary?.leave_balance?.remaining ?? 0}
                                </h3>
                            </div>
                        </div>

                        {/* Weekly Off */}
                        <div className={`${softCard} flex items-center gap-4`}>
                            <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400 flex items-center justify-center">
                                <Icon name="weekend" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Weekly Off
                                </p>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {(rosterPlanSummary?.weekly_off_day) || "--"}
                                </h3>
                            </div>
                        </div>

                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Left Side */}
                    <div className="xl:col-span-2 space-y-4">
                        {/* Leave History */}
                        {leaveLoading ? (
                            <LeaveHistorySkeleton />
                        ) : (
                            <div className={cardBase}>
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon name="history" />
                                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                            Recent Leave History
                                        </h3>
                                    </div>
                                    <Link href="/admin/team/my-leave">
                                        <button className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            See More
                                        </button>
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                                <th className="text-left text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">
                                                    Leave Title
                                                </th>
                                                <th className="text-left text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">
                                                    Description
                                                </th>
                                                <th className="text-left text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">
                                                    Start Date
                                                </th>
                                                <th className="text-left text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">
                                                    End Date
                                                </th>
                                                <th className="text-left text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">
                                                    Status
                                                </th>
                                                <th className="text-right text-sm font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {leaveData?.length > 0 ? (
                                                leaveData.slice(0, 3).map((item) => (
                                                    <tr
                                                        key={item?.id || item?._id}
                                                        className="border-b border-gray-100 dark:border-gray-800/70"
                                                    >
                                                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                            {item?.leave_title || "--"}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                            {trimString(item?.leave_description, 30) || "--"}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                            {item?.start_date
                                                                ? formatDateRange(item.start_date)
                                                                : "--"}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                            {item?.end_date
                                                                ? formatDateRange(item.end_date)
                                                                : "--"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                                    item?.status
                                                                )}`}
                                                            >
                                                                {item?.status || "--"}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                                                            {getTotalDays(item?.start_date, item?.end_date)} days
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                                                    >
                                                        No leave history available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Upcoming Holidays */}
                        {holidayLoading ? (
                            <HolidaySkeleton />
                        ) : (
                            <div className={cardBase}>
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon name="celebration" />
                                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                            Upcoming Holidays {holidaySummary?.title || ""}
                                        </h3>
                                    </div>
                                </div>

                                <div className=" ">

                                    <div className="p-4 space-y-3">
                                        {holidaySummary?.holidays?.map((item: any, index: number) => (
                                            <div
                                                key={index}
                                                className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="h-11 w-11 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 flex items-center justify-center shrink-0">
                                                        <Icon name="event_available" />
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {item.date} • {getDayFromDate(item.date)}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            {item.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium `}
                                                >
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="space-y-4">
                        {/* Today Shift */}
                        {holidayLoading ? (
                            <TodayShiftSkeleton />
                        ) : (
                            <div className={cardBase}>
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                                    <Icon name="access_time" />
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                        Today’s Shift
                                    </h3>
                                </div>
                                {
                                    rosterPlan?.map((item: any, index: number) => {
                                        const status = getRosterStatus(item?.from_date, item?.to_date);
                                        return (
                                            <div className="p-3" key={item?._id || index}>
                                                <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <h4 className="text-base font-semibold text-gray-800 dark:text-white tracking-wide">
                                                                {formatToTitle(item?.shift_time) || "--"}
                                                            </h4>

                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {item?.team_leader?.name || "--"}
                                                            </p>

                                                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-1">
                                                                <p>
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                        Start Date:
                                                                    </span>{" "}
                                                                    {item?.from_date || "--"}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                        End Date:
                                                                    </span>{" "}
                                                                    {item?.to_date || "--"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400">
                                                                <Icon name="schedule" />
                                                            </div>

                                                            <span
                                                                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${status.className}`}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="my-4 border-t border-dashed border-gray-200 dark:border-gray-700" />

                                                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                Start Time
                                                            </p>
                                                            <p className="mt-1 font-medium text-gray-800 dark:text-white">
                                                                {item?.start_time || "--"}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                End Time
                                                            </p>
                                                            <p className="mt-1 font-medium text-gray-800 dark:text-white">
                                                                {item?.end_time || "--"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <PolicyModal
                isModalOpen={modalOpen}
                setIsModalOpen={setModalOpen}
                policyInfo={policyInfo}
            />
        </AuthLayout>
    );
};

export default Page;