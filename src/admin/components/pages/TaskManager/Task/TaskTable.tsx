"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { priorityStyle, taskStatusStyle } from "@admin/utils/system.utils";
import { TaskContext } from "@/app/admin/task-manager/task/page";
import { ITask } from "@admin/@interfaces/taskManager/task/task.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import Link from "next/link";

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
      isSwitchOn={true}
      className="min-h-[650px]"
      data={taskData}
      isLoading={tableLoading}
      noDataViewCondition={taskData?.length < 1 ? "No data available" : null}
      colValue={10}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px]  shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-40">
            Task No
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-40">
            Title
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-40">
            Project
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-28">
            Start Date{" "}
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-28">
            End Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-40">
            Status
          </Th>
          <Th className="dark:text-gray-300 ">Assign</Th>
          <Th className="dark:text-gray-300">Priority</Th>
          <Th className="dark:text-gray-300">View</Th>
          <Th className="dark:text-gray-300">Duplicate</Th>
          <Th className="dark:text-gray-300">Action</Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {taskData?.map((data: ITask, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td className="">{data?.task_no}</Td>
              <Td className="">{data?.title}</Td>
              <Td className="">{data?.project?.title}</Td>
              <Td className="">{data?.start_date}</Td>
              <Td className="">{data?.end_date}</Td>
              <Td>
                <div className={`${taskStatusStyle(data.status)} text-center`}>
                  {data?.status}
                </div>
              </Td>

              <Td className=" ">
                <div className="flex flex-col w-40 text-center gap-1">
                  {data?.assign_employee?.map((emp: any, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {emp.name}
                    </span>
                  ))}
                </div>
              </Td>

              {/* <Td className="">{data?.priority}</Td>
               */}
              <Td>
                <span
                  className={`px-3 py-1 rounded-lg text-xs uppercase ${priorityStyle(
                    data?.priority
                  )}`}
                >
                  {data?.priority}
                </span>
              </Td>

              <Td>
                {hasPermission(permissionList, "task_view") && (
                  <Link
                    className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer"
                    href={`/admin/task-manager/task/view/${data?._id}`}
                  >
                    View
                  </Link>
                )}
              </Td>
              <Td>
                {hasPermission(permissionList, "task_view") && (
                  <div
                    className="bg-green-500 px-4 py-1 rounded-lg text-white text-center w-24 cursor-pointer"
                    onClick={() => handleDuplicateClick(data)}
                  >
                    Duplicate
                  </div>
                )}
              </Td>
              <Td className="">
                {hasPermission(permissionList, "task_edit", "task_delete") && (
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
                        className="absolute top-8 -left-20 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                      >
                        {hasPermission(permissionList, "task_edit") && (
                          <>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
                            </button>

                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleUpdateNote(data)}
                            >
                              Add Notes
                            </button>
                          </>
                        )}

                        {hasPermission(permissionList, "task_delete") && (
                          <button
                            onClick={() => handleRemove(data._id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
