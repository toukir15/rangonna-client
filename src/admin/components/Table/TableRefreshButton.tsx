"use client";

import Icon from "../core/Icon/Icon";
import { useTableRefresh } from "./useTableRefresh";

const refreshButtonClass =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:pointer-events-none disabled:opacity-45 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-green-500/30 dark:hover:bg-green-950/40 dark:hover:text-green-300";

type TableRefreshButtonProps = {
  onRefresh?: () => void;
  showRefresh?: boolean;
  isLoading?: boolean;
  className?: string;
  showLabel?: boolean;
};

const TableRefreshButton: React.FC<TableRefreshButtonProps> = ({
  onRefresh,
  showRefresh = true,
  isLoading = false,
  className,
  showLabel = true,
}) => {
  const { canRefresh, isBusy, handleRefresh } = useTableRefresh({
    onRefresh,
    showRefresh,
    isLoading,
  });

  if (!canRefresh) return null;

  return (
    <button
      type="button"
      aria-label="Refresh table"
      title="Refresh"
      onClick={handleRefresh}
      disabled={isBusy}
      className={`${refreshButtonClass} ${className ?? ""}`}
    >
      <Icon
        name="refresh"
        variant="outlined"
        size={18}
        className={isBusy ? "animate-spin" : ""}
      />
      {showLabel ? <span className="hidden sm:inline">Refresh</span> : null}
    </button>
  );
};

export default TableRefreshButton;
