import React from "react";
import Icon from "@admin/components/core/Icon/Icon";

export type SortDirection = "asc" | "desc";

export interface SortItem {
  field: string;
  direction: SortDirection;
}

interface SortIconsProps {
  field: string;
  sortOrders: SortItem[];
}

const SortIcons: React.FC<SortIconsProps> = ({ field, sortOrders }) => {
  const current = sortOrders.find((s) => s.field === field);

  return (
    <div className="mt-2 flex flex-col items-center">
      <div className="h-1.5">
        <Icon
          name="arrow_drop_up"
          className={
            current?.direction === "asc" ? "text-black" : "text-gray-400"
          }
        />
      </div>

      <div>
        <Icon
          name="arrow_drop_down"
          className={
            current?.direction === "desc" ? "text-black" : "text-gray-400"
          }
        />
      </div>
    </div>
  );
};

export default SortIcons;
