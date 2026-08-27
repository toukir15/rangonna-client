"use client";
import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { ITask } from "@admin/@interfaces/taskManager/task/task.interface";
import Link from "next/link";
import { MyTaskContext } from "@/app/admin/task-manager/my-task/page";
import { noData } from "@admin/utils";

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

const MyTaskTable: React.FC = () => {
  const { taskData, tableLoading } = useContext(MyTaskContext);
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
                <Link
                  href={`/admin/task-manager/my-task/view/${data?._id}`}
                  className="data-table-view-btn"
                >
                  View
                </Link>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default MyTaskTable;
