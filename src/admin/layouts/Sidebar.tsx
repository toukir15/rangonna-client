"use client";

import React, { useMemo, useRef } from "react";
import { SidebarItemProps } from "@admin/@interfaces/common.interface";
import Icon from "@admin/components/core/Icon/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getSidebarMainKey,
} from "@admin/utils/routePermission";

const cleanPath = (path?: string) =>
  (path ?? "").split("?")[0].split("#")[0];

const isPathActive = (pathname: string, href?: string) => {
  const target = cleanPath(href);
  if (!target) return false;
  const current = cleanPath(pathname);
  return current === target || current.startsWith(`${target}/`);
};

const Sidebar = ({
  item,
  activeSubMenu,
  setActiveItem,
  setActiveSubMenu,
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const lastTouchAtRef = useRef(0);
  const isCollapsed = isSidebarOpen;

  const itemMainKey = useMemo(() => getSidebarMainKey(item), [item]);

  const isMainActive = useMemo(() => {
    const seg = cleanPath(pathname).split("/").filter(Boolean);
    const offset = seg[0] === "admin" ? 1 : 0;
    const mainPath = seg[offset] ?? "";

    if (mainPath && itemMainKey && mainPath.replace(/-/g, "") === itemMainKey) {
      return true;
    }

    if (item?.submenu?.length) {
      return item.submenu.some((subLink: { href?: string }) =>
        isPathActive(pathname, subLink.href),
      );
    }

    return isPathActive(pathname, item?.href);
  }, [pathname, item, itemMainKey]);

  const hasActiveSubRoute = useMemo(
    () =>
      item?.submenu?.some((subLink: { href?: string }) =>
        isPathActive(pathname, subLink.href),
      ) ?? false,
    [pathname, item?.submenu],
  );

  const isSubMenuOpen = activeSubMenu === item?.label || hasActiveSubRoute;
  const hasSubmenu = Boolean(item?.submenu?.length);

  const handleToggleSubMenu = (label?: string) => {
    if (!label) return;
    setActiveSubMenu((prev) => (prev === label ? null : label));
    setActiveItem(label);
  };

  const handleTogglePress = (label?: string) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280 && isCollapsed) {
      setIsSidebarOpen(false);
      handleToggleSubMenu(label);
      return;
    }

    const now = Date.now();
    if (now - lastTouchAtRef.current < 400) return;
    lastTouchAtRef.current = now;
    handleToggleSubMenu(label);
  };

  const handleTouchEnd = (
    e: React.TouchEvent<HTMLButtonElement>,
    label?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    lastTouchAtRef.current = Date.now();
    if (typeof window !== "undefined" && window.innerWidth >= 1280 && isCollapsed) {
      setIsSidebarOpen(false);
    }
    handleToggleSubMenu(label);
  };

  const itemClassName = (() => {
    const base =
      "group relative flex w-full min-h-[40px] items-center rounded-lg text-left transition-colors duration-150 select-none";

    if (isCollapsed) {
      return `${base} justify-between gap-2 px-3 py-2 xl:justify-center xl:px-2 xl:py-2`;
    }

    return `${base} justify-between gap-2 px-3 py-2`;
  })();

  const stateClassName = isMainActive
    ? "bg-green-600 text-white shadow-sm"
    : hasSubmenu && isSubMenuOpen
      ? "bg-green-50 text-green-800 ring-1 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-500/30"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-100";

  const itemContent = (
    <>
      <div
        className={`flex items-center pointer-events-none select-none min-w-0 ${
          isCollapsed ? "xl:justify-center" : ""
        }`}
      >
        <Icon
          name={item?.icon}
          variant="outlined"
          size={20}
          className={isMainActive ? "text-white" : "text-current"}
        />
        <span
          className={`ml-2.5 truncate text-[13px] font-medium leading-none ${
            isCollapsed ? "xl:hidden" : ""
          }`}
        >
          {item?.label}
        </span>
      </div>

      {hasSubmenu ? (
        <Icon
          name={isSubMenuOpen ? "expand_less" : "expand_more"}
          variant="outlined"
          size={18}
          className={`pointer-events-none shrink-0 opacity-70 ${
            isCollapsed ? "xl:hidden" : ""
          }`}
        />
      ) : null}
    </>
  );

  return (
    <div className="w-full">
      {hasSubmenu ? (
        <button
          type="button"
          aria-expanded={isSubMenuOpen}
          title={isCollapsed ? item?.label : undefined}
          onTouchEnd={(e) => handleTouchEnd(e, item?.label)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTogglePress(item?.label);
          }}
          className={`${itemClassName} ${stateClassName} touch-manipulation appearance-none border-0 [-webkit-tap-highlight-color:transparent]`}
        >
          {isMainActive && (
            <span
              className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/90 ${
                isCollapsed ? "xl:hidden" : ""
              }`}
            />
          )}
          {itemContent}
        </button>
      ) : (
        <Link
          href={item?.href || "#"}
          title={isCollapsed ? item?.label : undefined}
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className={`${itemClassName} ${stateClassName}`}>
            {isMainActive && (
              <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/90 ${
                  isCollapsed ? "xl:hidden" : ""
                }`}
              />
            )}
            {itemContent}
          </div>
        </Link>
      )}

      {item?.submenu && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out pl-3 ${
            isCollapsed ? "xl:hidden" : ""
          } ${
            isSubMenuOpen
              ? "mt-0.5 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="relative space-y-0.5 border-l border-green-200/80 py-1 pl-2 dark:border-green-500/20">
              {item.submenu.map((subLink: any, index: number) => {
                const isActive = isPathActive(pathname, subLink?.href);

                return (
                  <Link
                    href={subLink?.href}
                    key={subLink?.href ?? index}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div
                      className={`flex min-h-[34px] items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150 touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                        isActive
                          ? "bg-green-100 font-medium text-green-700 dark:bg-green-900/35 dark:text-green-300"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon name={subLink?.icon} variant="outlined" size={17} />
                      <span className="truncate leading-snug">{subLink?.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Sidebar);
