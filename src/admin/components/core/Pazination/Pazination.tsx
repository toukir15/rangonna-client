"use client";
interface PaginationProps {
  ordersPerPage: number;
  handleOrdersPerPageChange: (newOrdersPerPage: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalData?: number;
  setSelectedOrders?: (orders: any[]) => void;
  className?: string;
  isShowText?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  ordersPerPage,
  handleOrdersPerPageChange,
  currentPage,
  setCurrentPage,
  totalPages,
  totalData,
  setSelectedOrders,
  className,
  isShowText = true,
}) => {
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getItemRange = () => {
    if (!totalData) return null;

    const start = (currentPage - 1) * ordersPerPage + 1;
    const end = Math.min(currentPage * ordersPerPage, totalData);

    return `Showing ${start}-${end} of ${totalData}`;
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    if (setSelectedOrders) {
      setSelectedOrders([]);
    }
  };

  return (
    <div className={`flex justify-between items-center mt-4 ${className}`}>
      <div className="flex items-center">
        <select
          value={ordersPerPage}
          onChange={(e) => handleOrdersPerPageChange(Number(e.target.value))}
          className="border rounded p-1 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-800 cursor-pointer"
        >
          {[10, 20, 50, 100, 500].map((size) => (
            <option
              key={size}
              value={size}
              className="dark:bg-gray-800 hover:cursor-pointer"
            >
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center text-xs md:text-sm lg:text-base">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`p-2 ${currentPage === 1
            ? "text-gray-400 dark:text-gray-300"
            : "text-blue-500"
            }`}
        >
          Previous
        </button>
        {
          isShowText ? <div
            className={`md:mx-4 sm:mx-1 dark:text-gray-400  flex items-center ${totalData && "lg:gap-10 md:gap-4 gap-2"
              }`}
          >
            <p>{totalData ? getItemRange() : null}</p>
            <p >
              Page {currentPage} of {totalPages}
            </p>
          </div> : <span className="text-gray-400">--</span>
        }

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className={`p-2 ${currentPage === totalPages ? "text-gray-400" : "text-blue-500"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
