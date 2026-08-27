"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { DashboardShowroomContext } from "@/app/admin/dashboard/showroom/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Icon from "@admin/components/core/Icon/Icon";
import { ToastService } from "@admin/utils/toastr.service";
import { DashboardShowroomService } from "@admin/@services/apis/DashboardService/DashboardShowroom.service";

const DashBoardShowroomExpenseTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    expenseListData,
    tableExLoading,
    handleEditClick,
    fetchExpensesReportList,
  } = useContext(DashboardShowroomContext);

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
      showCheckbox={false}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      isSwitchOn
      data={expenseListData}
      isLoading={tableExLoading}
      noDataViewCondition={
        expenseListData?.length < 1 ? "No expense data found" : null
      }
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="min-w-40">Date</Th>
          <Th className="min-w-40">Title</Th>
          <Th className="min-w-32">Amount</Th>
          <Th className="min-w-52">Note</Th>
          <Th className="min-w-40">User</Th>
          <Th className="min-w-32">Status</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {expenseListData?.map((item: any, index: number) => {
          const isStatusLoading = statusLoadingId === item?._id;

          return (
            <Tr key={item?._id || index}>
              <Td>
                <span className="data-table-muted">
                  {formatTimeAgo(item?.createdAt)}
                </span>
              </Td>
              <Td>
                <span className="data-table-primary">{item?.title || "-"}</span>
              </Td>
              <Td>
                <span className="table-amount">{item?.amount ?? 0}</span>
              </Td>
              <Td>
                <span className="data-table-muted">{item?.note || "-"}</span>
              </Td>
              <Td>
                <span className="data-table-muted">{item?.user?.name || "-"}</span>
              </Td>

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
                        className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
                      />
                    </label>
                  ) : (
                    <></>
                  )}

                  <span
                    className={`table-role-badge ${
                      item?.status ? "is-approved" : "is-pending"
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

              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "showroom_expense_report_edit"
                ) && (
                  <div className="relative max-w-40">
                    <button
                      type="button"
                      className="data-table-action-btn"
                      aria-expanded={popupIndex === index}
                      onClick={() => togglePopup(index)}
                    >
                      <Icon name="more_vert" variant="outlined" size={18} />
                    </button>
                    {popupIndex === index && (
                      <div
                        ref={popupRef}
                        className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                      >
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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

export default DashBoardShowroomExpenseTable;
