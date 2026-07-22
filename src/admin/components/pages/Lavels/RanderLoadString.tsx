import React from "react";
import { ORDER_STATUS_LABELS } from "../Activity/UserLogs/UserLogViewModal";
import OrderStatusLabel from "./OrderStatusLavels";

export const renderLogMessage = (message: string) => {
  if (!message) return null;

  const parts = message.split(/(".*?")/g);

  return parts.map((part, index) => {
    const cleanValue = part.replace(/"/g, "");

    // যদি এই অংশটা status হয়
    if (ORDER_STATUS_LABELS[cleanValue]) {
      return (
        <React.Fragment key={index}>
          <OrderStatusLabel value={cleanValue} />
        </React.Fragment>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};
