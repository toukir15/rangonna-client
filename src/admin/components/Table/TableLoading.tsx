import React from "react";

const TableLoading = () => {
  return (
    <div className="flex w-full flex-col gap-3 px-4 py-6">
      <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--bg-elevated)]" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded-lg bg-[var(--bg-hover)]"
          style={{ opacity: 1 - i * 0.08 }}
        />
      ))}
      <p className="sr-only">Loading table data</p>
    </div>
  );
};

export default TableLoading;
