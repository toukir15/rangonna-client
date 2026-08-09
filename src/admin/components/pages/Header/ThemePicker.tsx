"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Palette } from "lucide-react";
import { COLOR_THEMES, type ColorTheme } from "@admin/lib/color-themes";
import {
  getColorThemeId,
  setColorThemeId,
  subscribeColorTheme,
} from "@admin/lib/color-theme-store";
import { useGlobalContext } from "@admin/context/GlobalContext";

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
    <span className="flex shrink-0 overflow-hidden rounded border border-black/10 dark:border-white/15">
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
  const { isDarkMode, toggleDarkMode } = useGlobalContext();
  const activeTheme =
    COLOR_THEMES.find((t) => t.id === themeId) ?? COLOR_THEMES[0];

  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.28em]"
        style={{ color: activeTheme.primary }}
      >
        Advanced · Appearance
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            if (isDarkMode) toggleDarkMode();
          }}
          className={`flex h-9 items-center justify-center gap-2 rounded-lg border text-[11px] uppercase tracking-[0.14em] transition ${
            !isDarkMode
              ? "border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200"
              : "border-black/10 text-gray-500 hover:border-green-300 dark:border-white/10 dark:text-gray-400"
          }`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isDarkMode) toggleDarkMode();
          }}
          className={`flex h-9 items-center justify-center gap-2 rounded-lg border text-[11px] uppercase tracking-[0.14em] transition ${
            isDarkMode
              ? "border-green-600 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200"
              : "border-black/10 text-gray-500 hover:border-green-300 dark:border-white/10 dark:text-gray-400"
          }`}
        >
          Dark
        </button>
      </div>

      <div
        className="mt-4 rounded-lg border border-green-200/60 p-3 dark:border-green-500/20"
        style={{ backgroundColor: activeTheme.ivory }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.22em]"
          style={{ color: activeTheme.muted }}
        >
          Live preview
        </p>
        <p
          className="mt-1 font-display text-base"
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
              className={`flex w-full items-start gap-3 rounded-lg border px-2.5 py-2.5 text-left transition ${
                active
                  ? "border-green-600 bg-green-50 dark:bg-green-950/40"
                  : "border-transparent hover:border-green-200 hover:bg-gray-50 dark:hover:border-green-500/30 dark:hover:bg-gray-800/60"
              }`}
            >
              <ThemeSwatches theme={t} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="block text-sm text-gray-900 dark:text-white">
                    {t.name}
                  </span>
                  {active && (
                    <Check
                      className="h-4 w-4 shrink-0 text-green-600"
                      strokeWidth={1.5}
                    />
                  )}
                </span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                  {t.description}
                </span>
                <span className="mt-1.5 flex gap-1">
                  <span
                    className="h-1.5 flex-1 rounded-sm"
                    style={{ backgroundColor: t.primary }}
                    title="Primary"
                  />
                  <span
                    className="h-1.5 flex-1 rounded-sm"
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
};

export default function ThemePicker({ className = "" }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ColorThemeBootstrap already applies the persisted Soft Ivory theme.
    // Do not re-init here — it races DashboardThemeBootstrap on dashboard routes.
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Color theme"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/5 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 ${className}`}
      >
        <Palette className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <div ref={panelRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Color theme"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/5 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-700 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-300 ${
          open ? "border-green-300 text-green-700 dark:border-green-500/40 dark:text-green-300" : ""
        }`}
      >
        <Palette className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 z-[70] mt-2 w-[19rem] rounded-xl border border-black/10 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-gray-900">
          <ThemePanel onSelect={close} />
        </div>
      )}
    </div>
  );
}
