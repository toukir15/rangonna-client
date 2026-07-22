import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { formateDateWithMonth } from "@admin/utils";
import { LeaveApplicationContext } from "@/app/admin/team/leave-application/page";
import Link from "next/link";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { getStatusStyle } from "@admin/utils/system.utils";

const LeaveApplicationTable: React.FC = () => {
  const { leaveApplicationData, tableLoading } = useContext(
    LeaveApplicationContext
  );

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

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
      data={leaveApplicationData}
      isLoading={tableLoading}
      noDataViewCondition={
        leaveApplicationData?.length < 1 ? "No data available" : null
      }
      colValue={8}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-40 min-w-40">
            Name
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Subject
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Leave Day
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Start Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            End Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Status
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Application Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {leaveApplicationData?.map((leaveApplication: any, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{leaveApplication?.user?.name}</Td>
              <Td className="text-base font-bold">
                {leaveApplication?.leave_title}
              </Td>
              <Td className="">{leaveApplication?.total_days}</Td>
              <Td className="">
                {formateDateWithMonth(leaveApplication?.start_date)}
              </Td>
              <Td className="">
                {formateDateWithMonth(leaveApplication?.end_date)}
              </Td>
              <Td>
                <div
                  className={`${getStatusStyle(
                    leaveApplication?.status
                  )}  w-28 text-center`}
                >
                  {leaveApplication?.status}
                </div>
              </Td>
              <Td className="">{formatTimeAgo(leaveApplication?.createdAt)}</Td>

              <Td className="">
                <Link
                  href={`/team/leave-application/view/${leaveApplication?._id}`}
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

export default LeaveApplicationTable;
