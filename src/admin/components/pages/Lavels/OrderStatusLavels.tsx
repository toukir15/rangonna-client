// components/OrderStatusLabel.tsx

import React from "react";
import { ORDER_STATUS_LABELS } from "../Activity/UserLogs/UserLogViewModal";

interface Props {
  value: string;
  className?: string;
}

const OrderStatusLabel: React.FC<Props> = ({ value, className = "" }) => {
  const label = ORDER_STATUS_LABELS[value] || value;

  return <span className={`font-medium text ${className}`}>{label}</span>;
};

export default OrderStatusLabel;
