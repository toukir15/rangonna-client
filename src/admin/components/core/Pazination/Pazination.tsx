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
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] border border-[var(--border)] bg-[var(--bg-surface)] text-app transition-colors hover:bg-[var(--bg-hover)] disabled:pointer-events-none disabled:opacity-50";

const pageButtonClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-[0.625rem] border border-transparent px-2 text-sm font-semibold text-app-secondary transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-hover)] hover:text-app";

const activePageButtonClass =
  "!border-transparent !bg-[var(--color-primary)] !text-white shadow-sm hover:!bg-[var(--color-primary-hover)] hover:!text-white";

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
        className={`admin-pagination data-table-card glass-card data-table-footer !mt-4 !flex-col !rounded-2xl sm:!flex-row ${className ?? ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-[0.8125rem] text-app-muted">
            <span className="whitespace-nowrap">Rows per page</span>
            <select
              value={ordersPerPage}
              onChange={(event) =>
                handlePageSizeChange(Number(event.target.value))
              }
              className="admin-pagination-select h-9 cursor-pointer rounded-[0.625rem] border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-sm font-medium text-app outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
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
      className={`admin-pagination data-table-card glass-card data-table-footer !mt-4 !flex-col !rounded-2xl lg:!flex-row ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 text-[0.8125rem] text-app-muted">
          <span className="whitespace-nowrap">Rows per page</span>
          <select
            value={ordersPerPage}
            onChange={(event) =>
              handlePageSizeChange(Number(event.target.value))
            }
            className="admin-pagination-select h-9 cursor-pointer rounded-[0.625rem] border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-sm font-medium text-app outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {isShowText && totalData ? (
          <p className="text-[0.8125rem] text-app-muted">
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
        <p className="text-[0.8125rem] text-app-muted whitespace-nowrap">
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
