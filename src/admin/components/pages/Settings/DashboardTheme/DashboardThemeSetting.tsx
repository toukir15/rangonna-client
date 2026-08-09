"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import {
  DASHBOARD_THEMES,
  DEFAULT_BRAND_COLORS,
  brandColorsMatch,
  findDashboardThemeByColors,
  normalizeBrandColors,
  normalizeHex,
  type BrandColors,
} from "@admin/lib/dashboard-themes";
import {
  applyDashboardBrandColorsToDocument,
  getDashboardBrandColors,
  resetDashboardBrandColors,
  setDashboardBrandColors,
  subscribeDashboardTheme,
} from "@admin/lib/dashboard-theme-store";
import { ToastService } from "@admin/utils/toastr.service";

const COLOR_FIELDS: {
  key: keyof BrandColors;
  label: string;
  hint: string;
}[] = [
  {
    key: "primary",
    label: "Primary Color",
    hint: "Buttons, links, active menu, accents",
  },
  {
    key: "secondary",
    label: "Secondary Color",
    hint: "Gradients, logo, sidebar highlights",
  },
  {
    key: "accent",
    label: "Accent Color",
    hint: "Badges, highlights, decorative elements",
  },
];

export default function DashboardThemeSetting() {
  const savedColors = useSyncExternalStore(
    subscribeDashboardTheme,
    getDashboardBrandColors,
    getDashboardBrandColors,
  );

  const [draft, setDraft] = useState<BrandColors>(savedColors);
  const [hexInputs, setHexInputs] = useState<BrandColors>(savedColors);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    const colors = normalizeBrandColors(savedColors);
    setDraft(colors);
    setHexInputs(colors);
    setHydrated(true);
  }, [savedColors]);

  // CashFlow-style live preview: paint draft onto admin chrome while editing
  useLayoutEffect(() => {
    if (!hydrated) return;
    applyDashboardBrandColorsToDocument(draft, true);
  }, [draft, hydrated]);

  const hasChanges = useMemo(
    () => !brandColorsMatch(draft, savedColors),
    [draft, savedColors],
  );

  const selectedPreset = useMemo(
    () => findDashboardThemeByColors(draft),
    [draft],
  );

  const updateColor = useCallback((key: keyof BrandColors, value: string) => {
    const normalized = normalizeHex(value);
    if (!normalized) return;
    setDraft((prev) => ({ ...prev, [key]: normalized }));
    setHexInputs((prev) => ({ ...prev, [key]: normalized }));
  }, []);

  const handleHexChange = (key: keyof BrandColors, value: string) => {
    setHexInputs((prev) => ({ ...prev, [key]: value }));
    if (normalizeHex(value)) {
      updateColor(key, value);
    }
  };

  const handleHexBlur = (key: keyof BrandColors) => {
    const normalized = normalizeHex(hexInputs[key]);
    if (normalized) {
      updateColor(key, normalized);
      return;
    }
    setHexInputs((prev) => ({ ...prev, [key]: draft[key] }));
  };

  const applyPreset = (colors: BrandColors) => {
    const normalized = normalizeBrandColors(colors);
    setDraft(normalized);
    setHexInputs(normalized);
  };

  const handleSave = () => {
    setDashboardBrandColors(draft);
    applyDashboardBrandColorsToDocument(draft, true);
    ToastService.success({
      title: "Theme saved",
      message: "Dashboard color preferences have been applied",
    });
  };

  const handleReset = () => {
    resetDashboardBrandColors();
    setDraft(DEFAULT_BRAND_COLORS);
    setHexInputs(DEFAULT_BRAND_COLORS);
    applyDashboardBrandColorsToDocument(DEFAULT_BRAND_COLORS, true);
    ToastService.success({
      title: "Theme reset",
      message: "Default colors have been restored",
    });
  };

  if (!hydrated) {
    return (
      <div className="form-section-card animate-pulse min-h-[320px]" />
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <section className="form-section-card">
          <div className="form-section-header">
            <div className="form-section-icon emerald">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-app">Brand Colors</h3>
              <p className="text-sm text-app-secondary mt-0.5">
                Pick colors or enter hex codes (#10b981)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLOR_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="theme-color-field">
                <label className="form-label mb-0">{label}</label>
                <div className="theme-color-input-row">
                  <label
                    className="theme-color-swatch"
                    title={`Pick ${label}`}
                    style={{ background: draft[key] }}
                  >
                    <input
                      type="color"
                      value={draft[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                    />
                  </label>
                  <input
                    type="text"
                    className="input-app font-mono text-sm uppercase"
                    value={hexInputs[key]}
                    onChange={(e) => handleHexChange(key, e.target.value)}
                    onBlur={() => handleHexBlur(key)}
                    placeholder="#000000"
                    spellCheck={false}
                  />
                </div>
                <p className="form-hint">{hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section-card">
          <div className="form-section-header">
            <div className="form-section-icon amber">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-app">Color Presets</h3>
              <p className="text-sm text-app-secondary mt-0.5">
                Quick themes — customize further after selecting
              </p>
            </div>
          </div>

          <div className="theme-preset-grid">
            {DASHBOARD_THEMES.map((theme) => {
              const active = selectedPreset?.id === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    applyPreset({
                      primary: theme.primary,
                      secondary: theme.secondary,
                      accent: theme.accent,
                    })
                  }
                  className={`theme-preset-btn ${active ? "is-selected" : ""}`}
                  style={
                    active
                      ? {
                          borderColor: theme.primary,
                          background: theme.soft,
                          boxShadow: `0 0 0 3px ${theme.glow}`,
                        }
                      : undefined
                  }
                >
                  <div className="theme-preset-swatches">
                    <span
                      className="theme-preset-swatch"
                      style={{ background: theme.primary }}
                    />
                    <span
                      className="theme-preset-swatch"
                      style={{ background: theme.secondary }}
                    />
                    <span
                      className="theme-preset-swatch"
                      style={{ background: theme.accent }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-app">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="form-preview-panel">
          <h3 className="text-sm font-bold text-app mb-4">Live Preview</h3>
          <div className="theme-preview-card flex min-h-[220px]">
            <div className="theme-preview-sidebar w-28 shrink-0 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${draft.primary}, ${draft.secondary})`,
                  }}
                >
                  <Sparkles size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-app">Rangonaa</span>
              </div>
              <div
                className="rounded-lg px-2 py-1.5 text-[10px] font-medium"
                style={{
                  background: `color-mix(in srgb, ${draft.primary} 15%, transparent)`,
                  color: draft.primary,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${draft.primary} 20%, transparent)`,
                }}
              >
                Active
              </div>
              <div className="rounded-lg px-2 py-1.5 text-[10px] text-app-secondary">
                Menu item
              </div>
            </div>
            <div className="theme-preview-main space-y-3">
              <span
                className="inline-flex text-[9px] font-semibold uppercase tracking-wide py-0.5 px-2 rounded-md"
                style={{
                  background: `color-mix(in srgb, ${draft.secondary} 18%, transparent)`,
                  color: draft.secondary,
                }}
              >
                Badge
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${draft.primary}, ${draft.secondary})`,
                }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="btn-secondary text-xs"
              >
                Secondary
              </button>
              <p className="text-xs">
                <span className="font-semibold" style={{ color: draft.primary }}>
                  Primary link
                </span>
                {" · "}
                <span
                  className="font-semibold"
                  style={{ color: draft.secondary }}
                >
                  Secondary
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className="form-sticky-footer !relative !mt-0">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save size={16} />
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
}
