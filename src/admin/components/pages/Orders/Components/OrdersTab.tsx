"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import Icon from "@admin/components/core/Icon/Icon";
import OrdersStatusSkeleton from "@admin/components/Skeleton/Orders/AllOrders/OrdersStatusSkeleton";
import SelectComponent from "@admin/components/core/Select/Select";

interface StatusItem {
  status: string;
  name: string;
  value?: number;
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
  { status: "waiting-payment", name: "To be Paid" },
  { status: "recall", name: "Recall" },
  { status: "approved", name: "Approved" },
  { status: "printed", name: "Printed" },
  { status: "ready-for-box", name: "R-D" },
  { status: "in-transit", name: "Transit" },
  { status: "follow-up", name: "Follow Up" },
  { status: "delivery", name: "Delivery" },
  { status: "partial-delivery", name: "PD" },
  { status: "cancel", name: "Cancelled" },
  { status: "refunded", name: "Refunded" },
  { status: "return", name: "Return" },
  { status: "exchange", name: "Exchange" },
  { status: "damaged", name: "Damaged" },
];

const OrdersTab: React.FC<OrdersTabProps> = ({
  filter,
  searchQuery,
  handleFilterChange,
  isCount = false,
  debouncedSearch = () => {},
  IsSearch = false,
  allStatuses = DEFAULT_STATUSES,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(allStatuses.length);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const leftAreaRef = useRef<HTMLDivElement | null>(null);
  const searchAreaRef = useRef<HTMLDivElement | null>(null);
  const moreBtnMeasureRef = useRef<HTMLSpanElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const itemMeasureRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const options = useMemo(
    () =>
      allStatuses.map((item) => ({
        label:
          isCount && item.value !== undefined
            ? `${item.name} (${item.value})`
            : item.name,
        value: item.status,
      })),
    [allStatuses, isCount],
  );

  const getLabel = (item: StatusItem) => item.name;

  const calculateVisibleItems = () => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) {
      setVisibleCount(allStatuses.length);
      return;
    }

    const wrapperWidth = wrapperRef.current?.offsetWidth || 0;
    const searchWidth =
      IsSearch && searchAreaRef.current
        ? searchAreaRef.current.offsetWidth + 16
        : 0;

    const availableWidth = wrapperWidth - searchWidth;
    if (!availableWidth) {
      setVisibleCount(allStatuses.length);
      return;
    }

    const itemWidths = allStatuses.map((_, index) => {
      return (itemMeasureRefs.current[index]?.offsetWidth || 0) + 4;
    });

    const moreBtnWidth = (moreBtnMeasureRef.current?.offsetWidth || 44) + 8;

    let used = 0;
    let countWithoutMore = 0;

    for (let i = 0; i < itemWidths.length; i++) {
      if (used + itemWidths[i] <= availableWidth) {
        used += itemWidths[i];
        countWithoutMore++;
      } else {
        break;
      }
    }

    if (countWithoutMore >= allStatuses.length) {
      setVisibleCount(allStatuses.length);
      return;
    }

    used = 0;
    let countWithMore = 0;

    for (let i = 0; i < itemWidths.length; i++) {
      if (used + itemWidths[i] + moreBtnWidth <= availableWidth) {
        used += itemWidths[i];
        countWithMore++;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(0, countWithMore));
  };

  useLayoutEffect(() => {
    calculateVisibleItems();
  }, [allStatuses, isCount, IsSearch, filter]);

  useEffect(() => {
    const handleResize = () => calculateVisibleItems();

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleItems();
    });

    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    if (searchAreaRef.current) resizeObserver.observe(searchAreaRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [allStatuses, isCount, IsSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!allStatuses.find((item) => item.status === filter)) return;

    const activeIndex = allStatuses.findIndex((item) => item.status === filter);
    if (activeIndex >= visibleCount) {
      setIsMoreOpen(false);
    }
  }, [filter, allStatuses, visibleCount]);

  const visibleStatuses = allStatuses.slice(0, visibleCount);
  const hiddenStatuses = allStatuses.slice(visibleCount);

  const renderTabItem = (
    item: StatusItem,
    index?: number,
    isMeasure = false,
  ) => (
    <span
      key={item.status}
      ref={
        isMeasure && typeof index === "number"
          ? (el) => {
              itemMeasureRefs.current[index] = el;
            }
          : undefined
      }
      className={`text-lg hover:bg-blue-300 dark:hover:bg-black hover:text-white mb-0.5 md:py-0.5 md:px-1.5 rounded cursor-pointer transition-colors duration-200 text-gray-600
        ${
          filter === item.status
            ? "bg-white dark:bg-gray-600 dark:text-white border-b-4 dark:border-gray-400 border-blue-500 text-gray-900 md:p-2"
            : "hover:text-black dark:text-gray-400"
        }`}
      onClick={!isMeasure ? () => handleFilterChange(item.status) : undefined}
    >
      <span
        className={`2xl:text-base lg:text-sm text-xs text-nowrap ${
          filter === item.status ? "text-blue-500" : ""
        }`}
      >
        {getLabel(item)}
      </span>
      {isCount && (
        <small className="text-green-500 ml-0.5">({item.value ?? 0})</small>
      )}
    </span>
  );

  return (
    <div className="md:dark:bg-gray-800 md:bg-white rounded-lg shadow-sm md:mt-2 md:mb-2">
      <div
        ref={wrapperRef}
        className="md:flex justify-between items-center gap-3"
      >
        {/* Left Side */}
        <div
          ref={leftAreaRef}
          className="flex items-center w-full md:w-auto min-w-0"
        >
          {/* Mobile Select */}
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

          {/* Desktop Tabs */}
          <div className="hidden md:block rounded-md w-full relative">
            {allStatuses.length ? (
              <div className="flex items-center gap-1 w-full min-w-0">
                <div className="flex items-center gap-0.5 min-w-0 overflow-hidden p-2.5">
                  {visibleStatuses.map((item) => renderTabItem(item))}
                </div>

                {hiddenStatuses.length > 0 && (
                  <div className="relative flex-shrink-0" ref={dropdownRef}>
                    <div className="relative">
                      <button
                        onClick={() => setIsMoreOpen((prev) => !prev)}
                        className="flex items-center justify-center h-7 w-14 rounded-lg 
               bg-gray-100 dark:bg-gray-700 
               hover:bg-blue-500 hover:text-white 
               dark:hover:bg-blue-600
               text-gray-600 dark:text-gray-300
               transition-all duration-200 shadow-sm"
                      >
                        <Icon name="more_horiz" variant="outlined" size={28} />
                      </button>
                    </div>

                    {isMoreOpen && (
                      <div className="absolute right-0 mt-2 min-w-[180px] max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50 p-1">
                        {hiddenStatuses.map((item) => (
                          <button
                            key={item.status}
                            type="button"
                            onClick={() => {
                              handleFilterChange(item.status);
                              setIsMoreOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                              filter === item.status
                                ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span>{item.name}</span>
                            {isCount && (
                              <small className="text-green-500 ml-1">
                                ({item.value ?? 0})
                              </small>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>
        </div>

        {/* Right Side Search */}
        {IsSearch && (
          <div
            ref={searchAreaRef}
            className="flex items-center space-x-2 relative md:w-auto w-full md:px-0 flex-shrink-0"
          >
            <div className="relative w-full md:mt-0 mt-3 md:min-w-[220px]">
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

      {/* Hidden Measurement Area */}
      <div className="hidden md:block absolute opacity-0 pointer-events-none -z-10">
        <div className="flex items-center gap-0.5">
          {allStatuses.map((item, index) => renderTabItem(item, index, true))}
          <span
            ref={moreBtnMeasureRef}
            className="md:px-2 md:py-1.5 rounded-md border border-gray-200"
          >
            ...
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
