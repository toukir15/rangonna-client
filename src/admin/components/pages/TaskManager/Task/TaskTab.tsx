"use client";
import React, { useMemo } from "react";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";

type StatusItem = {
  name: string;
  status: string;
  count?: number;
  value?: number;
};

interface TaskTabProps {
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
  { name: "Pending", status: "pending" },
  { name: "In progress", status: "in-progress" },
  { name: "Cancel", status: "cancel" },
  { name: "On Hold", status: "on-hold" },
  { name: "In Review", status: "in-review" },
  { name: "Complete", status: "complete" },
];

const TaskTab: React.FC<TaskTabProps> = ({
  filter,
  searchQuery,
  handleFilterChange,
  isCount = false,
  debouncedSearch,
  IsSearch = false,
  allStatuses = DEFAULT_STATUSES,
}) => {
  const mappedStatuses = useMemo(
    () =>
      allStatuses.map((s) => ({
        status: s.status,
        name: s.name,
        value: s.value ?? s.count,
      })),
    [allStatuses],
  );

  return (
    <OrdersTab
      filter={filter}
      searchQuery={searchQuery}
      handleFilterChange={handleFilterChange}
      isCount={isCount}
      debouncedSearch={debouncedSearch}
      IsSearch={IsSearch}
      allStatuses={mappedStatuses}
    />
  );
};

export default TaskTab;
