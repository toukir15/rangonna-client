"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  registerTableRefresh,
  unregisterTableRefresh,
} from "./tableRefresh";

export default function useTableRefreshRegister(refreshFn?: () => void) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !refreshFn) return;

    registerTableRefresh(pathname, refreshFn);

    return () => {
      unregisterTableRefresh(pathname, refreshFn);
    };
  }, [pathname, refreshFn]);
}
