"use client";

import { useEffect } from "react";
import { initColorTheme } from "@admin/lib/color-theme-store";

/** Applies persisted Soft Ivory / picked color theme on admin boot. */
export default function ColorThemeBootstrap() {
  useEffect(() => {
    initColorTheme();
  }, []);
  return null;
}
