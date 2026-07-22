import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { formateDateWithMonth } from "@admin/utils";
import { MyLeaveContext } from "@/app/admin/team/my-leave/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { getStatusStyle } from "@admin/utils/system.utils";
import { useReactToPrint } from "react-to-print";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import {
  LeavePrintContent,
  type LeaveApplicationRow,
} from "@admin/components/pages/Team/MyLeave/LeavePrintContent";

const MyLeaveTable: React.FC = () => {
  const { leaveData, tableLoading } = useContext(MyLeaveContext);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [rowToPrint, setRowToPrint] = useState<LeaveApplicationRow | null>(
    null,
  );
  const rowToPrintRef = useRef<LeaveApplicationRow | null>(null);
  rowToPrintRef.current = rowToPrint;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: () =>
      rowToPrintRef.current?.leave_title
        ? `Leave — ${rowToPrintRef.current.leave_title}`
        : "Leave Application",
    pageStyle: `
      @page { size: A4; margin: 14mm; }
      @media print {
        html, body {
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        #leave-application-print-root {
          position: static !important;
          inset: auto !important;
          left: auto !important;
          top: auto !important;
          transform: none !important;
          width: 100% !important;
          max-width: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          overflow: visible !important;
          z-index: auto !important;
        }
      }
    `,
    onAfterPrint: () => setRowToPrint(null),
  });

  const handlePrintRef = useRef(handlePrint);
  handlePrintRef.current = handlePrint;

  useEffect(() => {
    if (!rowToPrint) return;
    const timer = window.setTimeout(() => {
      void handlePrintRef.current();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [rowToPrint]);

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

  const totalLeaveDays = leaveData?.reduce(
    (sum: number, leaveApplication: LeaveApplicationRow) =>
      sum + Number(leaveApplication?.total_days || 0),
    0,
  );
  return (
    <>
      <div
        id="leave-application-print-root"
        ref={printRef}
        className="fixed left-[-10000px] top-0 z-[-1] w-full max-w-3xl print:static print:left-0 print:top-0 print:z-auto"
        aria-hidden={!rowToPrint}
      >
        {rowToPrint ? <LeavePrintContent row={rowToPrint} /> : null}
      </div>
      <TableWrapper
        isSwitchOn={true}
        className="min-h-[600px]"
        data={leaveData}
        isLoading={tableLoading}
        noDataViewCondition={leaveData?.length < 1 ? "No data available" : null}
        colValue={9}
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
              Leave Day <span className="text-red-600">({totalLeaveDays})</span>
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              Start Date
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              End Date
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              Reason
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              Status
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              Application Date
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-24 lg:min-w-20 min-w-24 print:hidden">
              Print
            </Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {leaveData?.map(
            (leaveApplication: LeaveApplicationRow, index: number) => {
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
                  <Td>{leaveApplication?.rejection_reason}</Td>
                  <Td>
                    <div
                      className={`${getStatusStyle(
                        leaveApplication?.status,
                      )}  w-28 text-center`}
                    >
                      {leaveApplication?.status}
                    </div>
                  </Td>
                  <Td className="">
                    {formatTimeAgo(leaveApplication?.createdAt as string)}
                  </Td>
                  <Td className="print:hidden">
                    <Button
                      type="button"
                      onClick={() => setRowToPrint(leaveApplication)}
                      className="!py-1 !px-2 !min-w-0 bg-blue-100 !text-blue-700 inline-flex items-center gap-1"
                      aria-label="Print this leave application"
                    >
                      <Icon name="print" variant="outlined" />
                      <span className="text-xs">Print</span>
                    </Button>
                  </Td>
                </Tr>
              );
            },
          )}
        </Tbody>
      </TableWrapper>
    </>
  );
};

export default MyLeaveTable;
