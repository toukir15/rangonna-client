"use client";
import React, { useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Sidebar from "./Sidebar";
import { sideBarItems } from "@admin/components/pages/Utilities/data";
import {
  filterSidebarByPermissions,
  getSidebarMainKey,
} from "@admin/utils/routePermission";
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

const norm = (v?: string) =>
  (v ?? "")
    .toLowerCase()
    .trim()
    .replace(/^\//, "")
    .replace(/-/g, "")
    .replace(/\s+/g, "");

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

  const filteredSideBarItems = useMemo(
    () => filterSidebarByPermissions(permissionList || [], sideBarItems),
    [permissionList],
  );

  useEffect(() => {
    if (!filteredSideBarItems.length) return;

    const seg = (pathname ?? "").split("?")[0].split("/").filter(Boolean);
    const offset = seg[0] === "admin" ? 1 : 0;
    const currentMain = norm(seg[offset]);

    const matchingItem = filteredSideBarItems.find((item: any) => {
      const itemKey = getSidebarMainKey(item);
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
          className={`admin-sidebar fixed top-[60px] left-0 bottom-0 z-[60] w-[min(18rem,88vw)] shadow-2xl transition-transform duration-300 ease-in-out [-webkit-overflow-scrolling:touch] touch-manipulation pointer-events-auto ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          <div className="relative z-10 flex h-full flex-col overflow-hidden">
            <div className="admin-sidebar-brand">
              <span className="admin-sidebar-brand-icon">
                <span className="material-icons-outlined text-[18px]">storefront</span>
              </span>
              <div className="min-w-0">
                <p className="admin-sidebar-brand-title truncate">Rangonaa</p>
                <p className="admin-sidebar-brand-sub">Management</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 scrollbar-hide [-webkit-overflow-scrolling:touch]">
              {sidebarContent}
            </div>
          </div>
        </aside>
        <button
          type="button"
          aria-label="Close menu"
          className={`fixed top-[60px] bottom-0 left-[min(18rem,88vw)] right-0 z-50 touch-manipulation transition-opacity duration-300 ease-in-out [-webkit-tap-highlight-color:transparent] ${
            isSidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "var(--overlay)" }}
          onClick={handleCloseSidebar}
          tabIndex={isSidebarOpen ? 0 : -1}
        />
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`admin-sidebar relative hidden xl:flex shrink-0 flex-col transition-[width] duration-200 ${
          isSidebarOpen ? "w-[68px]" : "w-64"
        }`}
      >
        {!isSidebarOpen && (
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-icon">
              <span className="material-icons-outlined text-[18px]">storefront</span>
            </span>
            <div className="min-w-0">
              <p className="admin-sidebar-brand-title truncate">Rangonaa</p>
              <p className="admin-sidebar-brand-sub">Management</p>
            </div>
          </div>
        )}
        {isSidebarOpen && (
          <div className="flex justify-center px-2 py-4">
            <span className="admin-sidebar-brand-icon">
              <span className="material-icons-outlined text-[18px]">storefront</span>
            </span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 scrollbar-hide">
          <div className="space-y-0.5">{sidebarContent}</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col overflow-hidden bg-app-main">
        {isRouteAllowed && noScrollContent && (
          <div className="sticky top-0 z-20 bg-app-main/80 backdrop-blur-sm">
            {noScrollContent}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className={`min-h-full ${className ?? ""}`}>{mainContent}</div>
        </div>
      </div>
    </div>
  );
}
