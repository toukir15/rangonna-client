"use client";
import React from "react";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";

type StatusItem = {
  name: string;
  status: string;
  count?: number;
  value?: number;
};

interface ReturnTabProps {
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
  { name: "All", status: "all" },
  { name: "Partial", status: "partial-delivery" },
  { name: "Return", status: "return" },
  { name: "Exchange", status: "exchange" },
  { name: "Issue", status: "issue" },
  { name: "Close", status: "close" },
];

const ReturnTab: React.FC<ReturnTabProps> = ({
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

export default ReturnTab;
