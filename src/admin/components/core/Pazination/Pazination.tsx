"use client";

import Icon from "../Icon/Icon";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

interface PaginationProps {
  ordersPerPage: number;
  handleOrdersPerPageChange: (newOrdersPerPage: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalData?: number;
  setSelectedOrders?: (orders: unknown[]) => void;
  className?: string;
  isShowText?: boolean;
  onRefresh?: () => void;
  showRefresh?: boolean;
  isLoading?: boolean;
}

type PageItem = number | "ellipsis";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500];

const navButtonClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white text-gray-600 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-green-500/30 dark:hover:bg-green-950/40 dark:hover:text-green-300";

const pageButtonClass =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-transparent px-2 text-sm font-medium text-gray-600 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:border-green-500/30 dark:hover:bg-green-950/40 dark:hover:text-green-300";

const activePageButtonClass =
  "border-green-600 bg-green-600 text-white shadow-sm hover:border-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:bg-green-600 dark:hover:border-green-500 dark:hover:bg-green-600 dark:hover:text-white";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];

  if (currentPage > 3) items.push("ellipsis");

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    items.push(page);
  }

  if (currentPage < totalPages - 2) items.push("ellipsis");

  items.push(totalPages);

  return items;
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
  onRefresh,
  showRefresh = true,
  isLoading = false,
}) => {
  const hasPages = totalPages > 0;
  const pageItems = hasPages ? getPageItems(currentPage, totalPages) : [];

  const getItemRange = () => {
    if (!totalData) return null;

    const start = (currentPage - 1) * ordersPerPage + 1;
    const end = Math.min(currentPage * ordersPerPage, totalData);

    return `Showing ${start}–${end} of ${totalData.toLocaleString()}`;
  };

  const handlePageChange = (page: number) => {
    if (!hasPages || page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    setSelectedOrders?.([]);
  };

  const handlePageSizeChange = (value: number) => {
    handleOrdersPerPageChange(value);
    setSelectedOrders?.([]);
  };

  if (!hasPages) {
    return (
      <div
        className={`admin-pagination mt-4 flex flex-col gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-900/40 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="whitespace-nowrap">Rows per page</span>
            <select
              value={ordersPerPage}
              onChange={(event) =>
                handlePageSizeChange(Number(event.target.value))
              }
              className="admin-pagination-select h-8 cursor-pointer rounded-lg border border-black/10 bg-white px-2.5 text-sm font-medium text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <TableRefreshButton
            onRefresh={onRefresh}
            showRefresh={showRefresh}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`admin-pagination mt-4 flex flex-col gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-gray-900/40 lg:flex-row lg:items-center lg:justify-between ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="whitespace-nowrap">Rows per page</span>
          <select
            value={ordersPerPage}
            onChange={(event) =>
              handlePageSizeChange(Number(event.target.value))
            }
            className="admin-pagination-select h-8 cursor-pointer rounded-lg border border-black/10 bg-white px-2.5 text-sm font-medium text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {isShowText && totalData ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getItemRange()}
          </p>
        ) : null}

        <TableRefreshButton
          onRefresh={onRefresh}
          showRefresh={showRefresh}
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={navButtonClass}
          >
            <Icon name="chevron_left" variant="outlined" size={18} />
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-8 w-6 items-center justify-center text-sm text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-label={`Go to page ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  onClick={() => handlePageChange(item)}
                  className={`${pageButtonClass} ${
                    item === currentPage ? activePageButtonClass : ""
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={navButtonClass}
          >
            <Icon name="chevron_right" variant="outlined" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
