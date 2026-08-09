"use client";

import {
  DEFAULT_BRAND_COLORS,
  DEFAULT_DASHBOARD_THEME,
  getDashboardTheme,
  normalizeBrandColors,
  resolveDashboardTheme,
  type BrandColors,
  type DashboardThemeId,
} from "@admin/lib/dashboard-themes";

const STORAGE_KEY = "rangonaa-dashboard-theme";
const COLORS_STORAGE_KEY = "rangonaa-dashboard-theme-colors";

type Listener = () => void;

let themeId: DashboardThemeId = DEFAULT_DASHBOARD_THEME;
let brandColors: BrandColors = DEFAULT_BRAND_COLORS;
let initialized = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 16, g: 185, b: 129 };
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function tint(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function shade(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function readStoredBrandColors(): BrandColors {
  if (typeof window === "undefined") return DEFAULT_BRAND_COLORS;
  try {
    const rawColors = localStorage.getItem(COLORS_STORAGE_KEY);
    if (rawColors) {
      const parsed = JSON.parse(rawColors) as Partial<BrandColors>;
      return normalizeBrandColors({
        primary: parsed.primary ?? DEFAULT_BRAND_COLORS.primary,
        secondary: parsed.secondary ?? DEFAULT_BRAND_COLORS.secondary,
        accent: parsed.accent ?? DEFAULT_BRAND_COLORS.accent,
      });
    }

    const rawId = localStorage.getItem(STORAGE_KEY);
    if (rawId) {
      const theme = getDashboardTheme(rawId);
      return {
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_BRAND_COLORS;
}

/** Stable string for useSyncExternalStore snapshots (avoids object-identity bugs). */
export function getDashboardThemeSignature(): string {
  const colors = getDashboardBrandColors();
  const id = resolveDashboardTheme(colors).id;
  return `${id}|${colors.primary}|${colors.secondary}|${colors.accent}`;
}

/** Re-read persisted colors (used when entering dashboard routes). */
export function loadDashboardBrandColorsFromStorage(): BrandColors {
  const colors = readStoredBrandColors();
  brandColors = colors;
  themeId = resolveDashboardTheme(colors).id;
  initialized = true;
  return colors;
}

function persist(colors: BrandColors, id: DashboardThemeId) {
  try {
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colors));
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** True when dashboard color tokens are currently applied on <html>. */
export function isDashboardThemeActiveOnDocument(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute("data-dashboard-theme");
}

/**
 * Apply / clear CashFlow-style dashboard brand tokens.
 * When enabled, overrides shared --color-primary / --accent / --brand-* used by dashboard chrome.
 */
export function applyDashboardBrandColorsToDocument(
  colors: BrandColors,
  enabled: boolean,
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const theme = resolveDashboardTheme(colors);

  if (!enabled) {
    root.removeAttribute("data-dashboard-theme");
    [
      "--dashboard-primary",
      "--dashboard-primary-hover",
      "--dashboard-secondary",
      "--dashboard-accent",
      "--dashboard-soft",
      "--dashboard-glow",
    ].forEach((prop) => root.style.removeProperty(prop));
    return;
  }

  const { r, g, b } = hexToRgb(theme.primary);
  const glow = `${r}, ${g}, ${b}`;
  const primaryDark = theme.primaryHover;
  const primaryLight = tint(theme.primary, 0.35);

  root.setAttribute("data-dashboard-theme", theme.id);

  root.style.setProperty("--dashboard-primary", theme.primary);
  root.style.setProperty("--dashboard-primary-hover", theme.primaryHover);
  root.style.setProperty("--dashboard-secondary", theme.secondary);
  root.style.setProperty("--dashboard-accent", theme.accent);
  root.style.setProperty("--dashboard-soft", theme.soft);
  root.style.setProperty("--dashboard-glow", theme.glow);

  // CashFlow brand tokens
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-hover", theme.primaryHover);
  root.style.setProperty("--color-primary-dark", primaryDark);
  root.style.setProperty("--color-primary-light", primaryLight);
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-primary-soft", theme.soft);
  root.style.setProperty("--color-primary-glow", theme.glow);
  root.style.setProperty(
    "--color-secondary-soft",
    `rgba(${hexToRgb(theme.secondary).r}, ${hexToRgb(theme.secondary).g}, ${hexToRgb(theme.secondary).b}, 0.15)`,
  );
  root.style.setProperty("--accent", theme.primary);
  root.style.setProperty("--accent-soft", theme.soft);
  root.style.setProperty("--accent-glow", theme.glow);
  root.style.setProperty("--gold", theme.accent);
  root.style.setProperty("--grid-color", `rgba(${glow}, 0.06)`);
  root.style.setProperty("--brand-panel-bg", shade(theme.primary, 0.55));

  // Scrollbar + brand helpers used across admin chrome
  root.style.setProperty("--brand-scrollbar-thumb", theme.primary);
  root.style.setProperty("--brand-scrollbar-thumb-hover", theme.primaryHover);
  root.style.setProperty("--brand-primary", theme.primary);
  root.style.setProperty("--brand-primary-dark", primaryDark);
  root.style.setProperty("--brand-primary-light", primaryLight);

  // Rangonaa admin brand helpers (sidebar active, borders, etc.)
  root.style.setProperty("--brand-text", primaryDark);
  root.style.setProperty("--brand-text-bright", tint(theme.primary, 0.25));
  root.style.setProperty(
    "--brand-border-soft",
    `color-mix(in srgb, ${theme.primary} 22%, transparent)`,
  );
  root.style.setProperty(
    "--brand-border-medium",
    `color-mix(in srgb, ${theme.primary} 35%, transparent)`,
  );
  root.style.setProperty(
    "--brand-bg-soft",
    `color-mix(in srgb, ${theme.primary} 10%, transparent)`,
  );
  root.style.setProperty(
    "--brand-bg-softer",
    `color-mix(in srgb, ${theme.primary} 8%, transparent)`,
  );
  root.style.setProperty(
    "--brand-bg-medium",
    `color-mix(in srgb, ${theme.primary} 18%, transparent)`,
  );

  const greenScale: Record<string, string> = {
    "50": tint(theme.primary, 0.92),
    "100": tint(theme.primary, 0.85),
    "200": tint(theme.primary, 0.72),
    "300": tint(theme.primary, 0.45),
    "400": primaryLight,
    "500": theme.primary,
    "600": theme.primary,
    "700": primaryDark,
    "800": shade(primaryDark, 0.15),
    "900": shade(primaryDark, 0.35),
    "950": shade(primaryDark, 0.55),
  };
  Object.entries(greenScale).forEach(([step, color]) => {
    root.style.setProperty(`--color-green-${step}`, color);
    root.style.setProperty(`--color-emerald-${step}`, color);
  });
}

/** @deprecated Prefer applyDashboardBrandColorsToDocument */
export function applyDashboardThemeToDocument(
  id: DashboardThemeId,
  enabled: boolean,
) {
  const theme = getDashboardTheme(id);
  applyDashboardBrandColorsToDocument(
    {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
    },
    enabled,
  );
}

export function getDashboardThemeId(): DashboardThemeId {
  if (!initialized && typeof window !== "undefined") {
    brandColors = readStoredBrandColors();
    themeId = resolveDashboardTheme(brandColors).id;
    initialized = true;
  }
  return themeId;
}

export function getDashboardBrandColors(): BrandColors {
  if (!initialized && typeof window !== "undefined") {
    brandColors = readStoredBrandColors();
    themeId = resolveDashboardTheme(brandColors).id;
    initialized = true;
  }
  return brandColors;
}

export function setDashboardBrandColors(colors: BrandColors) {
  const next = normalizeBrandColors(colors);
  const resolved = resolveDashboardTheme(next);
  brandColors = next;
  themeId = resolved.id;
  initialized = true;
  persist(next, resolved.id);

  // Apply across admin immediately (Appearance owns admin brand colors)
  if (typeof window !== "undefined") {
    const path = window.location.pathname || "";
    if (path.startsWith("/admin")) {
      applyDashboardBrandColorsToDocument(next, true);
    }
  }

  emit();
}

export function resetDashboardBrandColors() {
  setDashboardBrandColors(DEFAULT_BRAND_COLORS);
}

export function setDashboardThemeId(id: DashboardThemeId) {
  const theme = getDashboardTheme(id);
  setDashboardBrandColors({
    primary: theme.primary,
    secondary: theme.secondary,
    accent: theme.accent,
  });
}

export function subscribeDashboardTheme(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initDashboardTheme() {
  brandColors = readStoredBrandColors();
  themeId = resolveDashboardTheme(brandColors).id;
  initialized = true;
  emit();
  return themeId;
}
