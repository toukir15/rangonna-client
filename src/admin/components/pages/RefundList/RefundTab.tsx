"use client";
import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import OrdersStatusSkeleton from "@admin/components/Skeleton/Orders/AllOrders/OrdersStatusSkeleton";
import Select from "@admin/components/core/Select/Select";

type StatusItem = {
  name: string;
  status: string;
  count?: number;
};

interface ReportIssueTabProps {
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
  {
    status: "all",
    name: "All Status",
  },
  {
    status: "pending",
    name: "Pending",
  },
  {
    status: "processing",
    name: "Processing",
  },
  {
    status: "completed",
    name: "Completed",
  },
  {
    status: "rejected",
    name: "Rejected",
  }
];

const RefundTab: React.FC<ReportIssueTabProps> = ({
  filter,
  searchQuery,
  handleFilterChange,
  isCount = false,
  debouncedSearch,
  IsSearch = true,
  allStatuses = DEFAULT_STATUSES,
  className = "",
}) => {
  const safeDebouncedSearch = debouncedSearch ?? (() => { });
  const hasStatuses = Array.isArray(allStatuses) && allStatuses.length > 0;

  // Convert statuses to Select options
  const selectOptions = allStatuses.map((s) => ({
    label: `${s.name}${isCount && s.count ? ` (${s.count})` : ""}`,
    value: s.status,
  }));

  return (
    <div
      className={`dark:bg-gray-800 bg-white rounded-lg shadow-sm lg:mt-2 lg:mb-2 ${className}`}
    >
      <div className="md:flex justify-between items-center">
        <div className="flex items-center w-full lg:w-auto">
          {/* ✅ Mobile: Select Dropdown */}
          <div className="block lg:hidden w-full lg:px-4 lg:py-2">
            {hasStatuses ? (
              <Select
                options={selectOptions}
                value={selectOptions.find((opt) => opt.value === filter)}
                onChange={(opt: any) => handleFilterChange(opt?.value)}
                placeholder="Select Status"
              />
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>

          {/* ✅ Desktop: Tab Buttons */}
          <div className="hidden lg:block rounded-md">
            {hasStatuses ? (
              <div className="tabs flex flex-wrap items-center gap-0.5 px-4 py-2">
                {allStatuses.map((item) => (
                  <button
                    key={item.status}
                    type="button"
                    className={`mr-0.5 text-lg hover:bg-blue-300 dark:hover:bg-black hover:text-white mb-0.5 py-0.5 px-3 rounded cursor-pointer transition-colors duration-200 text-gray-600 
                      ${filter === item.status
                        ? "bg-white dark:bg-gray-600 dark:text-white border-b-4 dark:border-gray-400 border-blue-500 text-gray-900 p-2"
                        : "hover:text-black dark:text-gray-400"
                      }`}
                    onClick={() => handleFilterChange(item.status)}
                  >
                    <span
                      className={`2xl:text-lg text-sm ${filter === item.status ? "text-blue-500" : ""
                        }`}
                    >
                      {item.name}
                    </span>
                    {isCount && typeof item.count === "number" && (
                      <small className="text-green-500 ml-1">
                        ({item.count})
                      </small>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>
        </div>

        {IsSearch && (
          <div className="flex items-center space-x-2 relative md:w-auto w-full px-4 md:px-0">
            <div className="relative w-full md:mt-0 mt-4">
              <input
                type="text"
                className="px-2 py-1.5 pr-10 w-full border dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                placeholder="Quick Search"
                defaultValue={searchQuery}
                onChange={(e) => safeDebouncedSearch(e.target.value)}
              />
              <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 mt-1">
                <Icon name="search" variant="outlined" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundTab;
