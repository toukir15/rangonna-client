import React from "react";
import Skeleton from "../Skeleton";

const cardBase =
    "rounded-2xl border border-gray-200 bg-[#dfdfe0] dark:bg-gray-500  opacity-70 dark:opacity-50 shadow-sm dark:border-gray-800 ";

const softCard =
    "rounded-2xl border border-gray-200 bg-[#dfdfe0] dark:bg-gray-500   opacity-70 dark:opacity-50 p-4 shadow-sm dark:border-gray-800 ";

export const SummaryCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 ">
            {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className={`${softCard} flex items-center gap-4`}>
                    <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1">
                        <Skeleton type="text" count={1} height={12} width={100} />
                        <div className="mt-2">
                            <Skeleton type="text" count={1} height={20} width={120} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const LeaveHistorySkeleton = () => {
    return (
        <div className={cardBase}  >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 ">
                <Skeleton type="text" count={1} height={20} width={170} />
                <Skeleton type="text" count={1} height={16} width={70} />
            </div>

            <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <th key={item} className="px-4 py-3 text-left">
                                    <Skeleton type="text" count={1} height={14} width={80} />
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {[1, 2, 3].map((row) => (
                            <tr
                                key={row}
                                className="border-b border-gray-100 dark:border-gray-800/70"
                            >
                                <td className="px-4 py-4">
                                    <Skeleton type="text" count={1} height={14} width={100} />
                                </td>
                                <td className="px-4 py-4">
                                    <Skeleton type="text" count={1} height={14} width={160} />
                                </td>
                                <td className="px-4 py-4">
                                    <Skeleton type="text" count={1} height={14} width={90} />
                                </td>
                                <td className="px-4 py-4">
                                    <Skeleton type="text" count={1} height={14} width={90} />
                                </td>
                                <td className="px-4 py-4">
                                    <Skeleton type="text" count={1} height={26} width={70} />
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end">
                                        <Skeleton type="text" count={1} height={14} width={50} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const HolidaySkeleton = () => {
    return (
        <div className={cardBase}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <Skeleton type="text" count={1} height={20} width={180} />
            </div>

            <div className="p-4 space-y-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                    >
                        <Skeleton type="text" count={1} height={14} width={"90%"} />
                        <div className="mt-2">
                            <Skeleton type="text" count={1} height={14} width={"80%"} />
                        </div>
                        <div className="mt-2">
                            <Skeleton type="text" count={1} height={14} width={"65%"} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TodayShiftSkeleton = () => {
    return (
        <div className={cardBase}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <Skeleton type="text" count={1} height={20} width={120} />
            </div>

            <div className="p-4 space-y-3">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton type="text" count={1} height={16} width={140} />
                        <Skeleton type="text" count={1} height={24} width={24} />
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton type="text" count={1} height={16} width={140} />
                        <Skeleton type="text" count={1} height={24} width={24} />
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton type="text" count={1} height={16} width={140} />
                        <Skeleton type="text" count={1} height={24} width={24} />
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton type="text" count={1} height={16} width={140} />
                        <Skeleton type="text" count={1} height={24} width={24} />
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton type="text" count={1} height={16} width={140} />
                        <Skeleton type="text" count={1} height={24} width={24} />
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton type="text" count={1} height={16} width={140} />
                        <Skeleton type="text" count={1} height={24} width={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const QuickInfoSkeleton = () => {
    return (
        <div className={cardBase}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <Skeleton type="text" count={1} height={20} width={100} />
            </div>

            <div className="p-4 space-y-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="rounded-xl bg-[#dfdfe0] dark:bg-gray-500   opacity-70 dark:opacity-50 p-4"
                    >
                        <Skeleton type="text" count={1} height={12} width={90} />
                        <div className="mt-2">
                            <Skeleton type="text" count={1} height={16} width={140} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};