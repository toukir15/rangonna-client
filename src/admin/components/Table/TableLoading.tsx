import React from "react";

const TableLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <span className="page-loader-spin" />
      <p className="text-sm text-[var(--text-muted)]">Loading</p>
    </div>
  );
};

export default TableLoading;
