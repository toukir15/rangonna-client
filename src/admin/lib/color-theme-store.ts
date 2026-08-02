"use client";

import {
  DEFAULT_COLOR_THEME,
  getColorTheme,
  type ColorThemeId,
} from "@admin/lib/color-themes";

const STORAGE_KEY = "rangonaa-client-color-theme";

type Listener = () => void;

let themeId: ColorThemeId = DEFAULT_COLOR_THEME;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function readStoredThemeId(): ColorThemeId {
  if (typeof window === "undefined") return DEFAULT_COLOR_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLOR_THEME;
    return getColorTheme(raw).id;
  } catch {
    return DEFAULT_COLOR_THEME;
  }
}

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
        .split("")
        .map((c) => c + c)
        .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return "201, 162, 39";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/** Mix primary toward white for soft admin green-* shades */
function tint(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
        .split("")
        .map((c) => c + c)
        .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function shade(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
        .split("")
        .map((c) => c + c)
        .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function applyThemeToDocument(id: ColorThemeId) {
  if (typeof document === "undefined") return;
  const theme = getColorTheme(id);
  const root = document.documentElement;

  root.setAttribute("data-color-theme", theme.id);

  // Brand tokens used across storefront + admin CSS
  root.style.setProperty("--brand-primary", theme.primary);
  root.style.setProperty("--brand-primary-dark", theme.primaryDark);
  root.style.setProperty("--brand-primary-light", theme.primaryLight);
  root.style.setProperty("--brand-primary-lighter", theme.ivory);
  root.style.setProperty("--brand-primary-border", tint(theme.primary, 0.72));
  root.style.setProperty("--brand-primary-muted", theme.muted);
  root.style.setProperty("--brand-primary-accent", theme.secondary);

  root.style.setProperty("--brand-ivory", theme.ivory);
  root.style.setProperty("--brand-pearl", theme.pearl);

  root.style.setProperty("--brand-gold", theme.primary);
  root.style.setProperty("--brand-gold-light", theme.primaryLight);
  root.style.setProperty("--brand-gold-dark", theme.primaryDark);

  root.style.setProperty("--brand-rose", theme.secondary);
  root.style.setProperty("--brand-rose-light", theme.secondaryLight);

  root.style.setProperty("--brand-cart", theme.primary);
  root.style.setProperty("--brand-cart-light", theme.primaryLight);
  root.style.setProperty("--brand-cart-dark", theme.primaryDark);

  root.style.setProperty("--brand-header-bg", theme.ivory);
  root.style.setProperty("--brand-secondary", theme.ink);
  root.style.setProperty("--brand-accent", theme.primary);

  root.style.setProperty("--background", theme.ivory);
  root.style.setProperty("--foreground", theme.ink);

  root.style.setProperty("--brand-neutral-border", tint(theme.primary, 0.82));
  root.style.setProperty("--brand-neutral-bg", theme.ivory);
  root.style.setProperty("--brand-scrollbar-track", theme.pearl);
  root.style.setProperty("--brand-scrollbar-thumb", theme.primary);
  root.style.setProperty("--brand-scrollbar-thumb-hover", theme.primaryDark);

  const glow = theme.glow || hexToRgbTriplet(theme.primary);
  root.style.setProperty("--theme-glow", glow);
  root.style.setProperty("--theme-primary-rgb", glow);
  root.style.setProperty(
    "--shadow-cta",
    `0 8px 28px rgba(${glow}, 0.38)`,
  );
  root.style.setProperty(
    "--shadow-cta-hover",
    `0 14px 36px rgba(${glow}, 0.48)`,
  );
  root.style.setProperty(
    "--shadow-cart",
    `0 6px 22px rgba(${glow}, 0.35)`,
  );
  root.style.setProperty(
    "--shadow-cart-hover",
    `0 10px 30px rgba(${glow}, 0.45)`,
  );

  // Tailwind brand + admin green/emerald aliases
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-dark", theme.primaryDark);
  root.style.setProperty("--color-primary-light", theme.primaryLight);
  root.style.setProperty("--color-primary-lighter", theme.ivory);
  root.style.setProperty("--color-primary-500", theme.primary);
  root.style.setProperty("--color-accent", theme.primary);
  root.style.setProperty("--color-gold", theme.primary);
  root.style.setProperty("--color-gold-light", theme.primaryLight);
  root.style.setProperty("--color-gold-dark", theme.primaryDark);
  root.style.setProperty("--color-header", theme.ivory);
  root.style.setProperty("--color-cream", theme.ivory);
  root.style.setProperty("--color-ivory", theme.ivory);
  root.style.setProperty("--color-pearl", theme.pearl);
  root.style.setProperty("--color-secondary", theme.ink);

  const greenScale: Record<string, string> = {
    "50": theme.ivory,
    "100": theme.pearl,
    "200": tint(theme.primary, 0.72),
    "300": tint(theme.primary, 0.45),
    "400": theme.primaryLight,
    "500": theme.primary,
    "600": theme.primary,
    "700": theme.primaryDark,
    "800": shade(theme.primaryDark, 0.15),
    "900": shade(theme.primaryDark, 0.35),
    "950": shade(theme.primaryDark, 0.55),
  };

  Object.entries(greenScale).forEach(([step, color]) => {
    root.style.setProperty(`--color-green-${step}`, color);
    root.style.setProperty(`--color-emerald-${step}`, color);
  });
}

export function getColorThemeId(): ColorThemeId {
  return themeId;
}

export function setColorThemeId(id: ColorThemeId) {
  const next = getColorTheme(id).id;
  themeId = next;
  applyThemeToDocument(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  emit();
}

export function subscribeColorTheme(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initColorTheme() {
  themeId = readStoredThemeId();
  applyThemeToDocument(themeId);
  return themeId;
}
