"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@admin/components/pages/Header/Header";
import { isAdminPublicRoute } from "@admin/utils/adminPath";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const isAuthPage = isAdminPublicRoute(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen dark:bg-black bg-gray-100">{children}</div>
    );
  }

  return (
    <div className="dark:bg-black bg-gray-100">
      <Header />
      <div className="h-[calc(100vh-60px)] flex-1 overflow-auto">{children}</div>
    </div>
  );
}
