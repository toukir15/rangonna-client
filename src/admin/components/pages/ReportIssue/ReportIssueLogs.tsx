import React from "react";
import Image from "next/image";
import noData from "@admin/assets/images/noDataFound.png";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { IReportIssueLogEntry } from "@admin/@interfaces/reportIssue/reportIssue.interface";

interface OrderLogsProps {
  logsData: IReportIssueLogEntry[];
}
const ReportIssueLogs: React.FC<OrderLogsProps> = ({ logsData }) => {
  return (
    <>
      {logsData?.length > 0 ? (
        <div className="md:max-h-36 max-h-72 overflow-y-scroll mt-2 scrollbar-hide">
          {logsData?.map((log: IReportIssueLogEntry, index: number) => (
            <div key={index} className="mb-4 mt-4 my-10 ">
              <div className="flex items-center">
                <div className="flex flex-col items-center relative">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  {index !== history?.length - 1 && (
                    <div className="w-px h-11 bg-green-500 absolute top-full"></div>
                  )}
                </div>
                <div className="md:flex items-center justify-between ml-2 w-full">
                  <p className="text-gray-800 dark:text-gray-300 text-sm">
                    <strong>
                      {log?.user?.name} {log?.text && `has ${log.text}`}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 ">
                    {formatTimeAgo(log?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center  dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-10">
          <Image src={noData} alt={"no data found"} className="h-auto w-20" />
          <p className="text-sm font-medium text-center text-gray-500 mt-2">
            No Logs Available
          </p>
        </div>
      )}
    </>
  );
};

export default ReportIssueLogs;
