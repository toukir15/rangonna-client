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
      <h2 className="ov-panel__title">Logs</h2>
      {logsData.length > 0 ? (
        <div className="ov-timeline scrollbar-hide">
          {logsData.map((log, index) => (
            <div key={log._id} className="ov-timeline__item">
              <div className="ov-timeline__rail">
                <div className="ov-timeline__dot" />
                {index !== logsData.length - 1 && (
                  <div className="ov-timeline__line" />
                )}
              </div>
              <div className="ov-timeline__body 2xl:flex items-start justify-between gap-2">
                <p className="ov-timeline__text">
                  <strong>
                    {log.log_message}
                    {log.reason && ` Reason: ${log.reason}`} by{" "}
                    {trimString(log.user_name, 12)}
                  </strong>
                </p>
                <p className="ov-timeline__meta text-nowrap">
                  {timeSince(new Date(log.createdAt))}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ov-empty">
          <Image src={noData} alt="no data found" className="h-auto w-14" />
          <p>No Logs Available</p>
        </div>
      )}
    </>
  );
};

export default OrderLogs;
