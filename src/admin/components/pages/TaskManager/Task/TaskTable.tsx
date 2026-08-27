"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { TaskContext } from "@/app/admin/task-manager/task/page";
import { ITask } from "@admin/@interfaces/taskManager/task/task.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import Link from "next/link";

const taskBadgeClass = (status?: string) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "done") return "is-approved";
  if (s === "cancelled" || s === "rejected") return "is-rejected";
  if (s === "pending" || s === "in-progress") return "is-pending";
  return "is-neutral";
};

const priorityBadgeClass = (priority?: string) => {
  const s = String(priority || "").toLowerCase();
  if (s === "high" || s === "urgent") return "is-rejected";
  if (s === "medium") return "is-pending";
  return "is-neutral";
};

const TaskTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    taskData,
    tableLoading,
    handleEditClick,
    handleUpdateNote,
    handleRemove,
    handleDuplicateClick,
  } = useContext(TaskContext);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
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

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);
  return (
    <TableWrapper
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={taskData}
      isLoading={tableLoading}
      noDataViewCondition={taskData?.length < 1 ? "No data available" : null}
      colValue={10}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">Task No</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">Title</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">Project</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-28">Start Date</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-28">End Date</Th>
          <Th className="2xl:min-w-32 lg:min-w-28 min-w-40">Status</Th>
          <Th>Assign</Th>
          <Th>Priority</Th>
          <Th>View</Th>
          <Th>Duplicate</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {taskData?.map((data: ITask, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {data?.task_no || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-primary">
                  {data?.title || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {data?.project?.title || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {data?.start_date || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {data?.end_date || noData}
                </span>
              </Td>
              <Td>
                <span className={`table-role-badge ${taskBadgeClass(data.status)}`}>
                  {data?.status || noData}
                </span>
              </Td>
              <Td>
                <div className="flex flex-col w-40 gap-1">
                  {data?.assign_employee?.map((emp: any, empIndex: number) => (
                    <span key={empIndex} className="data-table-muted">
                      {emp.name}
                    </span>
                  ))}
                </div>
              </Td>
              <Td>
                <span
                  className={`table-role-badge ${priorityBadgeClass(data?.priority)}`}
                >
                  {data?.priority || noData}
                </span>
              </Td>
              <Td>
                {hasPermission(permissionList, "task_view") && (
                  <Link
                    className="data-table-view-btn"
                    href={`/admin/task-manager/task/view/${data?._id}`}
                  >
                    View
                  </Link>
                )}
              </Td>
              <Td>
                {hasPermission(permissionList, "task_view") && (
                  <button
                    type="button"
                    className="data-table-view-btn"
                    onClick={() => handleDuplicateClick(data)}
                  >
                    Duplicate
                  </button>
                )}
              </Td>
              <Td className="is-right">
                {hasPermission(permissionList, "task_edit", "task_delete") && (
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
                        {hasPermission(permissionList, "task_edit") && (
                          <>
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                              onClick={() => handleUpdateNote(data)}
                            >
                              Add Notes
                            </button>
                          </>
                        )}
                        {hasPermission(permissionList, "task_delete") && (
                          <button
                            type="button"
                            onClick={() => handleRemove(data._id)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                          >
                            Delete
                          </button>
                        )}
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

export default TaskTable;
