"use client";
import React, { useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthFooter from "./AuthFooter";
import Sidebar from "./Sidebar";
import { sideBarItems } from "@admin/components/pages/Utilities/data";
import { labelPermissionMap } from "@admin/@acl/Acl";
import GlobalLoading from "@admin/components/pages/GlobalLoading/GlobalLoading";
import NoPermissionView from "@admin/components/pages/NoPermission/NoPermissionView";
import SidebarSkeleton from "@admin/components/Skeleton/SidebarSkeleton";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

interface NoScrollLayoutProps {
  children: ReactNode;
}

export function NoScrollLayout({ children }: NoScrollLayoutProps) {
  return <div>{children}</div>;
}

// ✅ normalize helper
const norm = (v?: string) =>
  (v ?? "")
    .toLowerCase()
    .trim()
    .replace(/^\//, "")
    .replace(/-/g, "")
    .replace(/\s+/g, "");

// ✅ get route from item (supports href OR path)
const getRoute = (obj: any) => obj?.href || obj?.path || "";

// ✅ mainKey = first segment (orders/dashboard)
const getMainKey = (item: any) => {
  const seg = getRoute(item).split("/").filter(Boolean);
  return norm(seg[0]) || norm(item?.label);
};

// ✅ subKey = second segment (incompleate/allorder etc)
const getSubKey = (sub: any) => {
  const seg = getRoute(sub).split("/").filter(Boolean);
  return norm(seg[1]) || norm(sub?.label);
};

const hasPermission = (
  permissions: string[],
  mainKey: string,
  subKey?: string,
) => {
  const key = subKey ? `${mainKey}/${subKey}` : mainKey; // ex: "orders/incompleate"
  const required = labelPermissionMap[key];

  // strict mode: map এ key না থাকলে hide
  if (!required || required.length === 0) return false;

  return required.some((p) => permissions.includes(p));
};

export default function AuthLayout({ children, className }: AuthLayoutProps) {
  const pathname = usePathname();

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>("");

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    loadingUser,
    permissionsReady,
    permissionList,
    isRouteAllowed,
    isLoggingOut,
  } = useGlobalContext();

  useEffect(() => {
    const savedActiveSubMenu = localStorage.getItem("activeSubMenu");
    if (savedActiveSubMenu) setActiveSubMenu(JSON.parse(savedActiveSubMenu));
  }, []);

  useEffect(() => {
    if (activeSubMenu !== null) {
      localStorage.setItem("activeSubMenu", JSON.stringify(activeSubMenu));
    }
  }, [activeSubMenu]);

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeItem");
    if (savedActiveItem) setActiveItem(savedActiveItem);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);

  const noScrollContent = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === NoScrollLayout,
  );

  const scrollableContent = React.Children.toArray(children).filter(
    (child) => !React.isValidElement(child) || child.type !== NoScrollLayout,
  );

  // ✅ Filter sidebar by permissions (works for /orders/incompleate)
  const filteredSideBarItems = useMemo(() => {
    const perms = permissionList || [];
    if (perms.length === 0) return [];

    return sideBarItems
      .map((item: any) => {
        const mainKey = getMainKey(item);

        const filteredSubmenu = (item?.submenu ?? []).filter((sub: any) => {
          const subKey = getSubKey(sub);
          return hasPermission(perms, mainKey, subKey);
        });

        // main visible if main key allowed OR any submenu allowed
        const mainVisible =
          hasPermission(perms, mainKey) || filteredSubmenu.length > 0;
        if (!mainVisible) return null;

        return { ...item, submenu: filteredSubmenu };
      })
      .filter(Boolean);
  }, [permissionList]);

  useEffect(() => {
    if (!filteredSideBarItems.length) return;

    const seg = (pathname ?? "").split("/").filter(Boolean);
    const currentMain = norm(seg[0]);

    const matchingItem = filteredSideBarItems.find((item: any) => {
      const itemKey = getMainKey(item);
      return itemKey === currentMain && (item?.submenu?.length ?? 0) > 0;
    });

    if (matchingItem?.label) {
      setActiveSubMenu((prev) =>
        prev === matchingItem.label ? prev : matchingItem.label ?? null,
      );
    }
  }, [pathname, filteredSideBarItems]);

  // শুধু প্রথম login/bootstrap-এ loading — page change-এ নয়
  const isBootstrapLoading =
    isLoggingOut || (!permissionsReady && loadingUser);

  const sidebarContent = isBootstrapLoading ? (
    <SidebarSkeleton />
  ) : (
    filteredSideBarItems?.map((item: any, index: number) => (
      <Sidebar
        key={item?.label ?? index}
        item={item}
        activeSubMenu={activeSubMenu}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        setActiveSubMenu={setActiveSubMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    ))
  );

  const mainContent = isBootstrapLoading ? (
    <GlobalLoading />
  ) : isRouteAllowed ? (
    scrollableContent
  ) : (
    <NoPermissionView />
  );

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Mobile Sidebar */}
      <div
        className={`xl:hidden fixed inset-x-0 bottom-0 top-[60px] z-40 ${
          isSidebarOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <aside
          className={`fixed top-[60px] left-0 bottom-0 z-[60] w-64 bg-white dark:bg-black text-black dark:text-white shadow-xl transition-transform duration-300 ease-in-out [-webkit-overflow-scrolling:touch] touch-manipulation pointer-events-auto ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          <div className="relative z-10 h-full overflow-y-auto overscroll-contain px-2 py-3 scrollbar-hide [-webkit-overflow-scrolling:touch]">
            {sidebarContent}
          </div>
        </aside>
        <button
          type="button"
          aria-label="Close menu"
          className={`fixed top-[60px] bottom-0 left-64 right-0 z-50 bg-black/40 touch-manipulation transition-opacity duration-300 ease-in-out [-webkit-tap-highlight-color:transparent] ${
            isSidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={handleCloseSidebar}
          tabIndex={isSidebarOpen ? 0 : -1}
        />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`relative xl:block hidden ${
          isSidebarOpen ? "w-[65px] overflow-x-hidden" : "w-64"
        } bg-white dark:bg-black border-r dark:border-r-gray-700 text-black dark:text-gray-300 flex flex-col p-2 transition-all duration-200`}
      >
        <div className="overflow-y-scroll h-full scrollbar-hide">
          {sidebarContent}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {isRouteAllowed && noScrollContent && (
          <div className="sticky top-0 z-20 bg-gray-100 dark:bg-black">
            {noScrollContent}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div
            className={`min-h-full flex flex-col justify-between ${
              className ?? ""
            }`}
          >
            <div className="flex-1">{mainContent}</div>
            <div className="mt-4">
              <AuthFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
