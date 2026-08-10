"use client";
import React from "react";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";

type StatusItem = {
  name: string;
  status: string;
  count?: number;
  value?: number;
};

interface RefundTabProps {
  filter: string;
  searchQuery?: string;
  handleFilterChange: (status: string) => void;
  isCount?: boolean;
  debouncedSearch?: (q: string) => void;
  allStatuses?: StatusItem[];
  IsSearch?: boolean;
  className?: string;
}

const DEFAULT_STATUSES: StatusItem[] = [
  { status: "all", name: "All Status" },
  { status: "pending", name: "Pending" },
  { status: "processing", name: "Processing" },
  { status: "completed", name: "Completed" },
  { status: "rejected", name: "Rejected" },
];

const RefundTab: React.FC<RefundTabProps> = ({
  filter,
  searchQuery,
  handleFilterChange,
  isCount = false,
  debouncedSearch,
  IsSearch = false,
  allStatuses = DEFAULT_STATUSES,
}) => (
  <OrdersTab
    filter={filter}
    searchQuery={searchQuery}
    handleFilterChange={handleFilterChange}
    isCount={isCount}
    debouncedSearch={debouncedSearch}
    IsSearch={IsSearch}
    allStatuses={allStatuses.map((s) => ({
      status: s.status,
      name: s.name,
      value: s.value ?? s.count,
    }))}
  />
);

export default RefundTab;
