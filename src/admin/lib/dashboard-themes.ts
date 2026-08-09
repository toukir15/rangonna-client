export type DashboardThemeId = string;

export type BrandColors = {
  primary: string;
  secondary: string;
  accent: string;
};

export type DashboardTheme = {
  id: DashboardThemeId;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  primaryHover: string;
  soft: string;
  glow: string;
  swatches: [string, string, string];
};

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#10b981",
  secondary: "#14b8a6",
  accent: "#f59e0b",
};

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

export const normalizeHex = (value: string): string | null => {
  const trimmed = value.trim();
  const match = trimmed.match(HEX_RE);
  if (!match) return null;
  return `#${match[1].toLowerCase()}`;
};

export const normalizeBrandColors = (colors: BrandColors): BrandColors => ({
  primary: normalizeHex(colors.primary) ?? DEFAULT_BRAND_COLORS.primary,
  secondary: normalizeHex(colors.secondary) ?? DEFAULT_BRAND_COLORS.secondary,
  accent: normalizeHex(colors.accent) ?? DEFAULT_BRAND_COLORS.accent,
});

export const brandColorsMatch = (a: BrandColors, b: BrandColors) => {
  const left = normalizeBrandColors(a);
  const right = normalizeBrandColors(b);
  return (
    left.primary === right.primary &&
    left.secondary === right.secondary &&
    left.accent === right.accent
  );
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 16, g: 185, b: 129 };
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
};

const darkenHex = (hex: string, amount = 0.12) => {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 - amount;
  const nr = Math.round(r * f);
  const ng = Math.round(g * f);
  const nb = Math.round(b * f);
  return `#${((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, "0")}`;
};

const hexAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeTheme = (name: string, colors: BrandColors): DashboardTheme => ({
  id: slugify(name),
  name,
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  primaryHover: darkenHex(colors.primary, 0.12),
  soft: hexAlpha(colors.primary, 0.15),
  glow: hexAlpha(colors.primary, 0.35),
  swatches: [colors.primary, colors.secondary, colors.accent],
});

/** Same presets as CashFlow Appearance → Color Presets */
const CASHFLOW_PRESETS: { name: string; colors: BrandColors }[] = [
  {
    name: "Emerald",
    colors: { primary: "#10b981", secondary: "#14b8a6", accent: "#f59e0b" },
  },
  {
    name: "Forest",
    colors: { primary: "#16a34a", secondary: "#15803d", accent: "#ca8a04" },
  },
  {
    name: "Mint",
    colors: { primary: "#2dd4bf", secondary: "#14b8a6", accent: "#22d3ee" },
  },
  {
    name: "Teal",
    colors: { primary: "#0d9488", secondary: "#0891b2", accent: "#fbbf24" },
  },
  {
    name: "Ocean",
    colors: { primary: "#0ea5e9", secondary: "#0284c7", accent: "#f59e0b" },
  },
  {
    name: "Sky",
    colors: { primary: "#38bdf8", secondary: "#0ea5e9", accent: "#818cf8" },
  },
  {
    name: "Indigo",
    colors: { primary: "#6366f1", secondary: "#4f46e5", accent: "#22d3ee" },
  },
  {
    name: "Royal",
    colors: { primary: "#8b5cf6", secondary: "#7c3aed", accent: "#f472b6" },
  },
  {
    name: "Violet",
    colors: { primary: "#a855f7", secondary: "#9333ea", accent: "#f9a8d4" },
  },
  {
    name: "Plum",
    colors: { primary: "#c026d3", secondary: "#a21caf", accent: "#fbbf24" },
  },
  {
    name: "Rose",
    colors: { primary: "#f43f5e", secondary: "#e11d48", accent: "#fb7185" },
  },
  {
    name: "Cherry",
    colors: { primary: "#e11d48", secondary: "#be123c", accent: "#fda4af" },
  },
  {
    name: "Sunset",
    colors: { primary: "#f97316", secondary: "#ea580c", accent: "#eab308" },
  },
  {
    name: "Coral",
    colors: { primary: "#fb7185", secondary: "#f43f5e", accent: "#fdba74" },
  },
  {
    name: "Amber",
    colors: { primary: "#f59e0b", secondary: "#d97706", accent: "#ef4444" },
  },
  {
    name: "Gold",
    colors: { primary: "#eab308", secondary: "#ca8a04", accent: "#f97316" },
  },
  {
    name: "Lime",
    colors: { primary: "#84cc16", secondary: "#65a30d", accent: "#06b6d4" },
  },
  {
    name: "Cyan",
    colors: { primary: "#06b6d4", secondary: "#0891b2", accent: "#a78bfa" },
  },
  {
    name: "Midnight",
    colors: { primary: "#1e40af", secondary: "#1e3a8a", accent: "#38bdf8" },
  },
  {
    name: "Navy",
    colors: { primary: "#1d4ed8", secondary: "#2563eb", accent: "#fbbf24" },
  },
  {
    name: "Slate",
    colors: { primary: "#64748b", secondary: "#475569", accent: "#0ea5e9" },
  },
  {
    name: "Graphite",
    colors: { primary: "#52525b", secondary: "#3f3f46", accent: "#14b8a6" },
  },
  {
    name: "Charcoal",
    colors: { primary: "#374151", secondary: "#1f2937", accent: "#10b981" },
  },
  {
    name: "Coffee",
    colors: { primary: "#92400e", secondary: "#78350f", accent: "#d97706" },
  },
  {
    name: "Wine",
    colors: { primary: "#9f1239", secondary: "#881337", accent: "#fbbf24" },
  },
  {
    name: "Lavender",
    colors: { primary: "#818cf8", secondary: "#6366f1", accent: "#c084fc" },
  },
  {
    name: "Arctic",
    colors: { primary: "#67e8f9", secondary: "#22d3ee", accent: "#6366f1" },
  },
  {
    name: "Mango",
    colors: { primary: "#fbbf24", secondary: "#f59e0b", accent: "#ef4444" },
  },
  {
    name: "Grape",
    colors: { primary: "#7e22ce", secondary: "#6b21a8", accent: "#ec4899" },
  },
  {
    name: "Corporate",
    colors: { primary: "#2563eb", secondary: "#1d4ed8", accent: "#0ea5e9" },
  },
];

const CLASSIC_THEME = makeTheme("Classic", {
  primary: "#7f1d1d",
  secondary: "#b54a4a",
  accent: "#f59e0b",
});

export const DASHBOARD_THEMES: DashboardTheme[] = [
  ...CASHFLOW_PRESETS.map((preset) => makeTheme(preset.name, preset.colors)),
  CLASSIC_THEME,
];

export const DEFAULT_DASHBOARD_THEME: DashboardThemeId = "emerald";

/** Migrate older localStorage ids */
const LEGACY_THEME_MAP: Record<string, DashboardThemeId> = {
  cashflow: "emerald",
};

export function getDashboardTheme(id: string): DashboardTheme {
  const resolved = LEGACY_THEME_MAP[id] ?? id;
  return (
    DASHBOARD_THEMES.find((t) => t.id === resolved) ??
    DASHBOARD_THEMES.find((t) => t.id === DEFAULT_DASHBOARD_THEME)!
  );
}

export function findDashboardThemeByColors(
  colors: BrandColors,
): DashboardTheme | undefined {
  const normalized = normalizeBrandColors(colors);
  return DASHBOARD_THEMES.find((theme) =>
    brandColorsMatch(
      {
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
      },
      normalized,
    ),
  );
}

export function resolveDashboardTheme(colors: BrandColors): DashboardTheme {
  const matched = findDashboardThemeByColors(colors);
  if (matched) return matched;
  return makeTheme("Custom", normalizeBrandColors(colors));
}
