import BlogNavbar from "@/@components/pages/Blog/BlogHeader/BlogHeader";
import StorefrontProviders from "@/@components/pages/StorefrontProviders";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StorefrontProviders>
      <div className="min-h-screen  font-nunito text-white">
      <main className="!w-[100%] font-nunito">
        <div className="sticky top-0 z-50">
          <BlogNavbar />
        </div>
        <div className="h-full bg-primary-lighter text-slate-900 2xl:p-0">{children}</div>
      </main>
    </div>
    </StorefrontProviders>
  );
}
