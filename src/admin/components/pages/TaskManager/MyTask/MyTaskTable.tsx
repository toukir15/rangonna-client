"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";

import { priorityStyle, taskStatusStyle } from "@admin/utils/system.utils";
import { ITask } from "@admin/@interfaces/taskManager/task/task.interface";
// import { useRouter } from "next/navigation";

import Link from "next/link";
import { MyTaskContext } from "@/app/admin/task-manager/my-task/page";

const MyTaskTable: React.FC = () => {
  // const router = useRouter();
  const { taskData, tableLoading } = useContext(MyTaskContext);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  // const togglePopup = (index: number) => {
  //   setPopupIndex(popupIndex === index ? null : index);
  // };

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
          {/* <Th className="dark:text-gray-300">Action</Th> */}
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

              {/* <Td className="">{data?.priority}</Td> */}
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
                <Link
                  href={`/admin/task-manager/my-task/view/${data?._id}`}
                  className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer"
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
