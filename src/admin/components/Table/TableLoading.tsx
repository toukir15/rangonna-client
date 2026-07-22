import React from "react";

const TableLoading = () => {
  return (
    // <div className="table-loading-container w-full top-0 ">
    //   <div className="table-loading-dots">
    //     <div className="table-loading-dot animate-bounce"></div>
    //     <div className="table-loading-dot animate-bounce-200"></div>
    //     <div className="table-loading-dot animate-bounce-400"></div>
    //   </div>
    // </div>
    // max-h-[800px]
    <div className="absolute inset-0 flex items-center justify-center bg-black dark:bg-white dark:bg-opacity-5 bg-opacity-15 z-10 top-12 min-h-[700px] ">
      <div className="table-loading-dots">
        <div className="table-loading-dot animate-bounce"></div>
        <div className="table-loading-dot animate-bounce-200"></div>
        <div className="table-loading-dot animate-bounce-400"></div>
      </div>
    </div>
  );
};

export default TableLoading;
