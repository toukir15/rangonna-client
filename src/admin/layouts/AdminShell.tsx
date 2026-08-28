"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@admin/components/pages/Header/Header";
import { isAdminPublicRoute } from "@admin/utils/adminPath";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const isAuthPage = isAdminPublicRoute(pathname);

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="admin-shell flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="min-h-0 flex-1 overflow-hidden bg-app-main pt-[60px]">
        {children}
      </div>
    </div>
  );
}
