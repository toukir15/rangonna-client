"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import OrdersStatusSkeleton from "@admin/components/Skeleton/Orders/AllOrders/OrdersStatusSkeleton";
import SelectComponent from "@admin/components/core/Select/Select";
import { getStatusFilterTone } from "@admin/utils/system.utils";

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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const searchAreaRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [allStatuses, isCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>(
      ".orders-status-pill.is-active",
    );
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [filter, allStatuses]);

  const scrollByAmount = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.45), behavior: "smooth" });
  };

  const renderPill = (item: StatusItem) => {
    const active = filter === item.status;
    const tone = getStatusFilterTone(item.status);
    const count = item.value ?? 0;
    const hasItems = isCount && count > 0;

    return (
      <button
        key={item.status}
        type="button"
        className={[
          "orders-status-pill",
          tone,
          active ? "is-active" : "",
          hasItems && !active ? "has-items" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => handleFilterChange(item.status)}
      >
        <span className="orders-status-pill-label">{item.name}</span>
        {isCount && (
          <span className="orders-status-pill-count">{count}</span>
        )}
      </button>
    );
  };

  return (
    <div className="orders-status-tabs">
      <div className="block md:hidden w-full">
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

      <div className="hidden md:block">
        {allStatuses.length ? (
          <div
            className={[
              "orders-status-track",
              canScrollLeft ? "has-left-fade" : "",
              canScrollRight ? "has-right-fade" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {canScrollLeft && (
              <button
                type="button"
                className="orders-status-scroll-btn is-left"
                aria-label="Scroll statuses left"
                onClick={() => scrollByAmount(-1)}
              >
                <Icon name="chevron_left" size={18} />
              </button>
            )}

            <div ref={scrollRef} className="orders-status-scroll">
              {allStatuses.map((item) => renderPill(item))}
            </div>

            {canScrollRight && (
              <button
                type="button"
                className="orders-status-scroll-btn is-right"
                aria-label="Scroll statuses right"
                onClick={() => scrollByAmount(1)}
              >
                <Icon name="chevron_right" size={18} />
              </button>
            )}
          </div>
        ) : (
          <OrdersStatusSkeleton />
        )}
      </div>

      {IsSearch && (
        <div
          ref={searchAreaRef}
          className="flex items-center relative md:w-auto w-full flex-shrink-0 mt-3"
        >
          <label className="data-table-search md:!max-w-[16rem] w-full">
            <Icon name="search" variant="outlined" size={18} />
            <input
              type="search"
              placeholder="Quick Search"
              defaultValue={searchQuery}
              onChange={(e) => debouncedSearch(e.target.value)}
              aria-label="Quick Search"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
