"use client";

import type { ReactNode } from "react";
import AdminBrandLogo from "@admin/components/core/Brand/AdminBrandLogo";

interface AuthSplitLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const features = [
  {
    icon: "shopping_cart",
    title: "Order Management",
    description: "Track, assign, and fulfill orders in one place.",
  },
  {
    icon: "inventory_2",
    title: "Inventory Control",
    description: "Real-time stock, warehouse, and product sync.",
  },
  {
    icon: "insights",
    title: "Smart Analytics",
    description: "Dashboards and reports to grow your business.",
  },
];

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — branding panel */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#c9a227] via-[#a4841f] to-[#0a0a0a] px-12 py-14 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#e8d48b]/20 blur-3xl"
        />

        <div className="relative z-10">
          <AdminBrandLogo size="lg" variant="dark" />
        </div>

        <div className="relative z-10 my-10 max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              Manage your e-commerce business with ease
            </h2>
            <p className="mt-4 text-base leading-relaxed text-green-100/90">
              Rangonaa Admin gives you full control over orders, inventory,
              team, and reports — all from a single dashboard.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <span className="material-icons text-[20px]">
                    {feature.icon}
                  </span>
                </span>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-sm text-green-100/80">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-green-200/70">
          &copy; {new Date().getFullYear()} Rangonaa. All rights reserved.
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex min-h-screen flex-1 flex-col bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 lg:hidden text-center">
              <AdminBrandLogo size="xl" variant="green" />
            </div>

            <div className="rounded-2xl border border-gray-200/80 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="mb-7">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
