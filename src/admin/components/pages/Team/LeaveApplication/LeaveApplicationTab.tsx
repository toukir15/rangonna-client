"use client";
import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import OrdersStatusSkeleton from "@admin/components/Skeleton/Orders/AllOrders/OrdersStatusSkeleton";
import SelectComponent from "@admin/components/core/Select/Select";

interface StatusItem {
  status: string;
  name: string;
  count?: number;
}

interface OrdersTabProps {
  filter: string;
  searchQuery?: string;
  handleFilterChange: (status: string) => void;
  isCount?: boolean;
  debouncedSearch?: (query: string) => void;
  allStatuses?: StatusItem[];
  IsSearch?: boolean;
}

const DEFAULT_STATUSES: StatusItem[] = [
  { status: "all", name: "All" },
  { status: "pending", name: "Pending" },
  { status: "approved", name: "Approved" },
  { status: "rejected", name: "Rejected" },
];

const LeaveApplicationTab: React.FC<OrdersTabProps> = ({
  filter,
  searchQuery,
  handleFilterChange,
  isCount = false,
  debouncedSearch = () => {},
  IsSearch = false,
  allStatuses = DEFAULT_STATUSES,
}) => {
  const options = allStatuses.map((item) => ({
    label: isCount && item.count ? `${item.name} (${item.count})` : item.name,
    value: item.status,
  }));

  return (
    <div className="md:dark:bg-gray-800 md:bg-white rounded-lg shadow-sm md:mt-2 md:mb-2">
      <div className="md:flex justify-between items-center">
        {/* ===== Left Side (Tabs / Select) ===== */}
        <div className="flex items-center w-full md:w-auto">
          {/* ✅ Mobile: Select dropdown */}
          <div className="block md:hidden w-full md:px-3 md:py-2">
            {allStatuses.length ? (
              <SelectComponent
                options={options}
                value={options.find((opt) => opt.value === filter)}
                onChange={(opt: any) => handleFilterChange(opt?.value)}
                placeholder="Select Order Status"
                className="w-full"
              />
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>

          {/* ✅ Desktop: Tab buttons */}
          <div className="hidden md:block rounded-md">
            {allStatuses.length ? (
              <div className="tabs flex  md:items-center md:justify-center gap-0.5 md:px-2 md:py-2">
                {allStatuses.map((item, index) => (
                  <span
                    key={index}
                    className={`md:mr-[2px] mr-[1px] text-lg hover:bg-blue-300 dark:hover:bg-black hover:text-white mb-0.5 md:py-0.5 md:px-2 rounded cursor-pointer transition-colors duration-200 text-gray-600 
                      ${
                        filter === item.status
                          ? "bg-white dark:bg-gray-600 dark:text-white border-b-4 dark:border-gray-400 border-blue-500 text-gray-900 md:p-2"
                          : "hover:text-black dark:text-gray-400"
                      }`}
                    onClick={() => handleFilterChange(item.status)}
                  >
                    <span
                      className={`2xl:text-base lg:text-sm  text-xs text-nowrap ${
                        filter === item.status ? "text-blue-500" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                    {isCount && typeof item.count === "number" && (
                      <small className="text-green-500 ml-1">
                        ({item.count})
                      </small>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>
        </div>

        {/* ===== Right Side (Search) ===== */}
        {IsSearch && (
          <div className="flex items-center space-x-2 relative md:w-auto w-full  md:px-0">
            <div className="relative w-full md:mt-0 mt-3">
              <input
                type="text"
                className="px-2 py-1.5 pr-10 w-full border dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                placeholder="Quick Search"
                defaultValue={searchQuery}
                onChange={(e) => debouncedSearch(e.target.value)}
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

export default LeaveApplicationTab;
