"use client";

import React, { useMemo, useRef } from "react";
import { SidebarItemProps } from "@admin/@interfaces/common.interface";
import Icon from "@admin/components/core/Icon/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

const norm = (v?: string) =>
  (v ?? "").toLowerCase().trim().replace(/-/g, "").replace(/\s+/g, "");

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

  const { mainPath, subPath } = useMemo(() => {
    const seg = (pathname ?? "").split("/").filter(Boolean);
    const offset = seg[0] === "admin" ? 1 : 0;
    return { mainPath: norm(seg[offset]), subPath: norm(seg[offset + 1]) };
  }, [pathname]);

  const itemMainKey = useMemo(() => {
    const seg = (item?.href ?? "").split("/").filter(Boolean);
    return norm(seg[0]) || norm(item?.label);
  }, [item?.href, item?.label]);

  const isMainActive = mainPath === itemMainKey;
  const isSubMenuOpen = activeSubMenu === item?.label;
  const hasSubmenu = Boolean(item?.submenu?.length);

  const handleToggleSubMenu = (label?: string) => {
    if (!label) return;
    setActiveSubMenu((prev) => (prev === label ? null : label));
    setActiveItem(label);
  };

  const handleTogglePress = (label?: string) => {
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
    handleToggleSubMenu(label);
  };

  const itemClassName = (() => {
    const base =
      "relative z-10 flex items-center justify-between space-x-2 py-1.5 px-3 rounded-lg transition-all duration-150 ease-in-out cursor-pointer w-full min-h-[44px] text-left select-none";

    if (isMainActive) {
      return `${base} bg-green-600 text-white shadow-sm`;
    }

    if (hasSubmenu && isSubMenuOpen) {
      return `${base} border border-green-400 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:border-green-500`;
    }

    return `${base} text-gray-700 dark:text-gray-300 hover:bg-green-100 hover:text-gray-800 dark:hover:bg-green-900/30`;
  })();

  const itemContent = (
    <>
      <div className="flex items-center pointer-events-none select-none">
        <Icon name={item?.icon} variant="outlined" />
        <p className="text-[15px] font-medium ml-1.5 text-nowrap">{item?.label}</p>
      </div>

      {hasSubmenu ? (
        <Icon
          name={isSubMenuOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          variant="outlined"
          className="pointer-events-none select-none"
        />
      ) : null}
    </>
  );

  return (
    <div className="w-full -mb-1">
      {hasSubmenu ? (
        <button
          type="button"
          aria-expanded={isSubMenuOpen}
          onTouchEnd={(e) => handleTouchEnd(e, item?.label)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTogglePress(item?.label);
          }}
          className={`${itemClassName} touch-manipulation appearance-none border-0 [-webkit-tap-highlight-color:transparent] ${
            isMainActive || isSubMenuOpen
              ? "border-solid"
              : "bg-transparent dark:bg-transparent"
          }`}
        >
          {itemContent}
        </button>
      ) : (
        <Link href={item?.href || "#"} onClick={() => setIsSidebarOpen(false)}>
          <div className={itemClassName}>{itemContent}</div>
        </Link>
      )}

      {item?.submenu && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
            isSidebarOpen ? "pl-2" : "pl-4"
          } ${
            isSubMenuOpen
              ? "mt-0.5 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-0 pb-1">
              {item.submenu.map((subLink: any, index: number) => {
                const seg = (subLink?.href ?? "").split("/").filter(Boolean);
                const subKey = norm(seg[1]) || norm(subLink?.label);
                const isActive = isMainActive && subPath === subKey;

                return (
                  <Link
                    href={subLink?.href}
                    key={subLink?.href ?? index}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div
                      className={`flex items-center space-x-1.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 touch-manipulation min-h-[36px] [-webkit-tap-highlight-color:transparent] ${
                        isActive
                          ? "bg-green-100 text-green-600 font-medium dark:bg-green-900/40 dark:text-green-400"
                          : "text-gray-500 hover:bg-green-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon name={subLink?.icon} variant="outlined" />
                      <p className="w-full leading-snug">{subLink?.label}</p>
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
