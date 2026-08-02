"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Palette } from "lucide-react";
import { COLOR_THEMES, type ColorTheme } from "@admin/lib/color-themes";
import {
  getColorThemeId,
  initColorTheme,
  setColorThemeId,
  subscribeColorTheme,
} from "@admin/lib/color-theme-store";

function ThemePreviewButtons({ theme }: { theme: ColorTheme }) {
  return (
    <div className="mt-2 flex gap-1.5">
      <span
        className="flex h-6 flex-1 items-center justify-center text-[9px] font-medium uppercase tracking-wider text-white"
        style={{ backgroundColor: theme.primary }}
      >
        Primary
      </span>
      <span
        className="flex h-6 flex-1 items-center justify-center text-[9px] font-medium uppercase tracking-wider text-white"
        style={{ backgroundColor: theme.secondary }}
      >
        Secondary
      </span>
    </div>
  );
}

function ThemeSwatches({ theme }: { theme: ColorTheme }) {
  return (
    <span className="flex shrink-0 overflow-hidden border border-black/10">
      {theme.swatches.map((color) => (
        <span
          key={color}
          className="h-9 w-3.5 first:w-5"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ThemePanel({ onSelect }: { onSelect?: () => void }) {
  const themeId = useSyncExternalStore(
    subscribeColorTheme,
    getColorThemeId,
    getColorThemeId,
  );
  const activeTheme =
    COLOR_THEMES.find((t) => t.id === themeId) ?? COLOR_THEMES[0];

  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: activeTheme.primary }}
      >
        Appearance
      </p>

      <div
        className="mt-3 border border-black/10 p-3"
        style={{ backgroundColor: activeTheme.ivory }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.22em]"
          style={{ color: activeTheme.muted }}
        >
          Live preview
        </p>
        <p
          className="mt-1 text-base font-medium"
          style={{ color: activeTheme.ink }}
        >
          Rangonaa
        </p>
        <ThemePreviewButtons theme={activeTheme} />
      </div>

      <p
        className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: activeTheme.primary }}
      >
        Color themes · try & pick
      </p>
      <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-0.5">
        {COLOR_THEMES.map((t) => {
          const active = themeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setColorThemeId(t.id);
                onSelect?.();
              }}
              className={`flex w-full items-start gap-3 border px-2.5 py-2.5 text-left transition ${
                active
                  ? "border-[var(--brand-primary)] bg-[color-mix(in_oklab,var(--brand-primary)_10%,transparent)]"
                  : "border-transparent hover:border-[color-mix(in_oklab,var(--brand-primary)_35%,transparent)] hover:bg-[color-mix(in_oklab,var(--brand-primary)_6%,transparent)]"
              }`}
            >
              <ThemeSwatches theme={t} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="block text-sm text-[var(--brand-secondary)]">
                    {t.name}
                  </span>
                  {active && (
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                      strokeWidth={1.5}
                    />
                  )}
                </span>
                <span className="block text-[11px] text-[var(--brand-primary-muted)]">
                  {t.description}
                </span>
                <span className="mt-1.5 flex gap-1">
                  <span
                    className="h-1.5 flex-1"
                    style={{ backgroundColor: t.primary }}
                    title="Primary"
                  />
                  <span
                    className="h-1.5 flex-1"
                    style={{ backgroundColor: t.secondary }}
                    title="Secondary"
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ThemePickerProps = {
  className?: string;
  /** Render the panel inline (e.g. mobile menu) instead of a dropdown */
  inline?: boolean;
};

export default function ThemePicker({
  className = "",
  inline = false,
}: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initColorTheme();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || inline) return;
    const onPointer = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, inline]);

  const close = useCallback(() => setOpen(false), []);

  if (!mounted) {
    if (inline) return <div className={`min-h-40 ${className}`} />;
    return (
      <button
        type="button"
        aria-label="Color theme"
        className={`rongonaa-theme-btn ${className}`}
      >
        <Palette className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
      </button>
    );
  }

  if (inline) {
    return (
      <div className={className}>
        <ThemePanel />
      </div>
    );
  }

  return (
    <div ref={panelRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Color theme"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`rongonaa-theme-btn ${open ? "is-open" : ""}`}
      >
        <Palette className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 z-[70] mt-2 w-[19rem] border border-[color-mix(in_oklab,var(--brand-primary)_30%,transparent)] bg-[var(--brand-ivory)] p-4 shadow-[0_12px_40px_rgba(10,10,10,0.14)]">
          <ThemePanel onSelect={close} />
        </div>
      )}
    </div>
  );
}
