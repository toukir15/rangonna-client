"use client";

import Icon from "../core/Icon/Icon";
import { useTableRefresh } from "./useTableRefresh";

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
      className={`data-table-refresh ${className ?? ""}`}
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
