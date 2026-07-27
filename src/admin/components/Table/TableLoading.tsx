import React from "react";

const TableLoading = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 dark:bg-black/30">
      <div className="table-loading-dots">
        <div className="table-loading-dot animate-bounce"></div>
        <div className="table-loading-dot animate-bounce-200"></div>
        <div className="table-loading-dot animate-bounce-400"></div>
      </div>
    </div>
  );
};

export default TableLoading;
