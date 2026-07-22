"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Icon from "@admin/components/core/Icon/Icon";
import { ToastService } from "@admin/utils/toastr.service";
import { DashboardShowroomService } from "@admin/@services/apis/DashboardService/DashboardShowroom.service";
import { DashboardShowroomReportContext } from "@/app/admin/dashboard/showroom-report/page";

const DashBoardShowroomExpenseTableAdmin: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const {
        expenseListData,
        tableExLoading,
        handleEditClick,
        fetchExpensesReportList,
    } = useContext(DashboardShowroomReportContext);

    const [popupIndex, setPopupIndex] = useState<number | null>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<
        string | number | null
    >(null);

    const popupRef = useRef<HTMLDivElement | null>(null);

    const togglePopup = (index: number) => {
        setPopupIndex((prev) => (prev === index ? null : index));
    };

    const handleStatusToggle = async (item: any) => {
        try {
            const updatedStatus = !item?.status;
            setStatusLoadingId(item?._id);

            const res = await DashboardShowroomService.updateExpenseReport?.(
                item?._id,
                {
                    status: updatedStatus,
                }
            );

            if (res?.success) {
                ToastService.success(res?.message || "Status updated successfully");
                fetchExpensesReportList?.();
            } else {
                ToastService.error(res?.message || "Failed to update status");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Failed to update status");
        } finally {
            setStatusLoadingId(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                setPopupIndex(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <TableWrapper
            className="min-h-40"
            isSwitchOn
            data={expenseListData}
            isLoading={tableExLoading}
            noDataViewCondition={
                expenseListData?.length < 1 ? "No expense data found" : null
            }
            colValue={7}
        >
            <Thead>
                <Tr className="bg-blue-100 dark:bg-gray-700 h-[40px]">
                    <Th className="dark:text-gray-300 min-w-40">Date</Th>
                    <Th className="dark:text-gray-300 min-w-40">Title</Th>
                    <Th className="dark:text-gray-300 min-w-32">Amount</Th>
                    <Th className="dark:text-gray-300 min-w-52">Note</Th>
                    <Th className="dark:text-gray-300 min-w-40">User</Th>
                    <Th className="dark:text-gray-300 min-w-32">Status</Th>
                    <Th className="dark:text-gray-300 min-w-24">Action</Th>
                </Tr>
            </Thead>

            <Tbody className="bg-white dark:bg-gray-800">
                {expenseListData?.map((item: any, index: number) => {
                    const isStatusLoading = statusLoadingId === item?._id;

                    return (
                        <Tr key={item?._id || index} className="h-8 align-top">
                            <Td>{formatTimeAgo(item?.createdAt)}</Td>
                            <Td>{item?.title || "-"}</Td>
                            <Td>{item?.amount ?? 0}</Td>
                            <Td>{item?.note || "-"}</Td>
                            <Td>{item?.user?.name || "-"}</Td>

                            <Td>
                                <div className="flex items-center gap-3">
                                    {/* showroom_expense_report_status_edit */}
                                    {item?.status === false &&
                                        hasPermission(
                                            permissionList,
                                            "showroom_expense_report_status_edit"
                                        ) ? (
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!item?.status}
                                                disabled={
                                                    isStatusLoading ||
                                                    !hasPermission(
                                                        permissionList,
                                                        "showroom_expense_report_status_edit"
                                                    )
                                                }
                                                className="sr-only peer"
                                                onChange={() => handleStatusToggle(item)}
                                            />
                                            <div
                                                className="
    relative w-11 h-6 bg-gray-200 rounded-full peer
    dark:bg-gray-600
    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
    after:bg-white after:border-gray-300 after:border
    after:rounded-full after:h-5 after:w-5 after:transition-all
    peer-checked:bg-green-500 peer-checked:after:translate-x-full
    peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
  "
                                            />
                                        </label>
                                    ) : (
                                        <></>
                                    )}

                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${item?.status ? "bg-green-100 text-green-700" : ""
                                            }`}
                                    >
                                        {isStatusLoading ? (
                                            <Icon
                                                name="restart_alt"
                                                size={28}
                                                className={`text-green-600 animate-spin ml-5`}
                                            />
                                        ) : item?.status ? (
                                            "Active"
                                        ) : (
                                            ""
                                        )}
                                    </span>
                                </div>
                            </Td>

                            <Td>
                                {hasPermission(
                                    permissionList,
                                    "showroom_expense_report_edit"
                                ) && (
                                        <div className="relative">
                                            <Icon
                                                name={"more_horiz"}
                                                variant="outlined"
                                                onClick={() => togglePopup(index)}
                                                className="cursor-pointer"
                                            />

                                            {popupIndex === index && (
                                                <div
                                                    ref={popupRef}
                                                    className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-2 z-20 min-w-32"
                                                >
                                                    <button
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                        onClick={() => {
                                                            handleEditClick(item);
                                                            setPopupIndex(null);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </Td>
                        </Tr>
                    );
                })}
            </Tbody>
        </TableWrapper>
    );
};

export default DashBoardShowroomExpenseTableAdmin;
