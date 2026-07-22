import Icon from "@admin/components/core/Icon/Icon";
import React from "react";

interface PaginationWithOrdersPerPageProps {
  ordersPerPage: number;
  handleOrdersPerPageChange: (value: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

const Pagination: React.FC<PaginationWithOrdersPerPageProps> = ({
  ordersPerPage,
  handleOrdersPerPageChange,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div className="md:flex items-center justify-between mt-4">
      <div>
        <select
          id="ordersPerPage"
          className="border p-2 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          value={ordersPerPage}
          onChange={(e) => handleOrdersPerPageChange(Number(e.target.value))}
        >
          {[20, 30, 50, 100, 150, 500, 1000, 5000].map((value, index) => (
            <option key={index} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="pagination flex justify-between items-center md:mt-0 mt-3">
        <button
          className="bg-blue-400 text-white px-2 rounded-lg"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          // disabled={currentPage === 1}
        >
          <Icon name={"chevron_left"} variant="outlined" className="mt-1" />
        </button>
        <span className="px-5">Showing Page {currentPage}</span>
        <button
          className="bg-blue-400 text-white px-2 rounded-lg"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1))}
          // disabled={currentPage === totalPages}
        >
          <Icon name={"chevron_right"} variant="outlined" className="mt-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
