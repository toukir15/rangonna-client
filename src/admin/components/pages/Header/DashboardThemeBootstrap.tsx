"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  applyDashboardBrandColorsToDocument,
  getDashboardThemeSignature,
  initDashboardTheme,
  loadDashboardBrandColorsFromStorage,
  subscribeDashboardTheme,
} from "@admin/lib/dashboard-theme-store";

let bootstrapped = false;

/**
 * Appearance brand colors drive the entire admin chrome.
 * Soft Ivory ThemePicker must not restore fixed burgundy on other routes.
 */
export default function DashboardThemeBootstrap() {
  const pathname = usePathname() || "";
  const themeSignature = useSyncExternalStore(
    subscribeDashboardTheme,
    getDashboardThemeSignature,
    getDashboardThemeSignature,
  );

  useEffect(() => {
    if (!bootstrapped) {
      initDashboardTheme();
      bootstrapped = true;
    }
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/admin")) return;

    const apply = () => {
      const colors = loadDashboardBrandColorsFromStorage();
      applyDashboardBrandColorsToDocument(colors, true);
    };

    apply();
    const frame = window.requestAnimationFrame(apply);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, themeSignature]);

  return null;
}
