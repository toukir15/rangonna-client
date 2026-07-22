import React from "react";
import Image from "next/image";
import noData from "@admin/assets/images/noDataFound.png";
import { trimString } from "@admin/utils";
import timeSince from "@admin/utils/hook.utils";

interface OrderLog {
  _id: string;
  user_id: string;
  user_name: string;
  log_message: string;
  order_id: string;
  reason?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface OrderLogsProps {
  logsData?: OrderLog[];
}

const OrderLogs: React.FC<OrderLogsProps> = ({ logsData = [] }) => {
  return (
    <>
      <h2 className="text-xl font-semibold dark:text-gray-400">Logs</h2>
      {logsData.length > 0 ? (
        <div className="max-h-44 overflow-y-scroll mt-2 scrollbar-hide">
          {logsData.map((log, index) => (
            <div key={log._id} className="mb-4 mt-4 my-10">
              <div className="flex items-center">
                <div className="flex flex-col items-center relative">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  {index !== logsData.length - 1 && (
                    <div className="w-px h-11 bg-green-500 absolute top-full"></div>
                  )}
                </div>
                <div className="2xl:flex items-center justify-between ml-2 w-full">
                  <p className="text-gray-800 dark:text-gray-400 text-sm">
                    <strong>
                      {log.log_message}
                      {log.reason && ` Reason: ${log.reason}`} by{" "}
                      {trimString(log.user_name, 12)}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {timeSince(new Date(log.createdAt))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <Image src={noData} alt="no data found" className="h-auto w-14" />
          <p className="text-sm font-medium text-center text-gray-500 mt-2">
            No Logs Available
          </p>
        </div>
      )}
    </>
  );
};

export default OrderLogs;
