import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "@admin/globals.css";
import "material-icons/iconfont/material-icons.css";
import { ToastComponent } from "@admin/components/core/ToastComponent/ToastComponent";
import { GlobalProvider } from "@admin/context/GlobalContext";
import InternetWrapper from "@admin/context/InternetWrapper";
import GlobalNoticeOpener from "@admin/context/GlobalNoticeOpener";
import AdminShell from "@admin/layouts/AdminShell";
import ColorThemeBootstrap from "@admin/components/pages/Header/ColorThemeBootstrap";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin Panel - Rangonaa",
  description: "E-commerce admin panel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={inter.className}>
      <InternetWrapper>
        <GlobalProvider>
          <ColorThemeBootstrap />
          <ToastComponent />
          <AdminShell>
            <GlobalNoticeOpener />
            {children}
          </AdminShell>
        </GlobalProvider>
      </InternetWrapper>
    </div>
  );
}
