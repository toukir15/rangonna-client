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
      "admin-sidebar-nav-item group relative flex w-full min-h-[40px] items-center text-left select-none";

    if (isCollapsed) {
      return `${base} justify-between gap-2 px-3 py-2 xl:justify-center xl:px-2 xl:py-2`;
    }

    return `${base} justify-between gap-2 px-3 py-2`;
  })();

  const stateClassName = isMainActive
    ? "is-active"
    : hasSubmenu && isSubMenuOpen
      ? "is-open"
      : "";

  const itemContent = (
    <>
      <div
        className={`flex items-center pointer-events-none select-none min-w-0 ${
          isCollapsed ? "xl:justify-center" : ""
        }`}
      >
        <span className="admin-sidebar-icon-wrap">
          <Icon
            name={item?.icon}
            variant="outlined"
            size={15}
            className="text-current"
          />
        </span>
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
          size={16}
          className={`pointer-events-none shrink-0 text-app-muted ${
            isCollapsed ? "xl:hidden" : ""
          }`}
        />
      ) : isMainActive ? (
        <span className={`nav-link-dot shrink-0 ${isCollapsed ? "xl:hidden" : ""}`} />
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
          className={`${itemClassName} ${stateClassName} touch-manipulation appearance-none border-0 bg-transparent [-webkit-tap-highlight-color:transparent]`}
        >
          {itemContent}
        </button>
      ) : (
        <Link
          href={item?.href || "#"}
          title={isCollapsed ? item?.label : undefined}
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className={`${itemClassName} ${stateClassName}`}>
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
            <div className="relative space-y-0.5 border-l border-[var(--border)] py-1 pl-2">
              {item.submenu.map((subLink: any, index: number) => {
                const isActive = isPathActive(pathname, subLink?.href);

                return (
                  <Link
                    href={subLink?.href}
                    key={subLink?.href ?? index}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div
                      className={`admin-sidebar-sublink flex min-h-[34px] items-center gap-2 px-2.5 py-1.5 text-[13px] touch-manipulation [-webkit-tap-highlight-color:transparent] ${
                        isActive ? "is-active" : ""
                      }`}
                    >
                      <span className="admin-sidebar-icon-wrap">
                        <Icon name={subLink?.icon} variant="outlined" size={14} />
                      </span>
                      <span className="truncate leading-snug">{subLink?.label}</span>
                      {isActive ? <span className="nav-link-dot ml-auto" /> : null}
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
