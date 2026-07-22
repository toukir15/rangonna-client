"use client";

import React from "react";

const SidebarSkeleton = ({ rows = 8 }: { rows?: number }) => {
  return (
    <div className="space-y-2 px-1 py-1 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[44px]"
        >
          <div className="size-6 shrink-0 rounded-md bg-gray-200 dark:bg-gray-700" />
          <div
            className="h-4 rounded-md bg-gray-200 dark:bg-gray-700"
            style={{ width: `${58 + (index % 3) * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
};

export default SidebarSkeleton;
