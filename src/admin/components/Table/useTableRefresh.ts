"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  hasTableRefresh,
  TABLE_REFRESH_REGISTER_EVENT,
  triggerTableRefresh,
} from "./tableRefresh";

type UseTableRefreshOptions = {
  onRefresh?: () => void;
  showRefresh?: boolean;
  isLoading?: boolean;
};

export function useTableRefresh({
  onRefresh,
  showRefresh = true,
  isLoading = false,
}: UseTableRefreshOptions = {}) {
  const pathname = usePathname();
  const [canRefresh, setCanRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isLoading || isRefreshing) return;

    const refreshHandler =
      onRefresh ??
      (pathname ? () => triggerTableRefresh(pathname) : undefined);

    if (!refreshHandler) return;

    setIsRefreshing(true);
    try {
      await Promise.resolve(refreshHandler());
    } finally {
      window.setTimeout(() => setIsRefreshing(false), 350);
    }
  }, [isLoading, isRefreshing, onRefresh, pathname]);

  useEffect(() => {
    if (!showRefresh) {
      setCanRefresh(false);
      return;
    }

    if (onRefresh) {
      setCanRefresh(true);
      return;
    }

    if (!pathname) {
      setCanRefresh(false);
      return;
    }

    const syncRefreshAvailability = () => {
      setCanRefresh(hasTableRefresh(pathname));
    };

    syncRefreshAvailability();
    window.addEventListener(TABLE_REFRESH_REGISTER_EVENT, syncRefreshAvailability);

    return () => {
      window.removeEventListener(
        TABLE_REFRESH_REGISTER_EVENT,
        syncRefreshAvailability,
      );
    };
  }, [onRefresh, pathname, showRefresh]);

  return {
    canRefresh: showRefresh && canRefresh,
    isRefreshing,
    isBusy: isLoading || isRefreshing,
    handleRefresh,
  };
}
