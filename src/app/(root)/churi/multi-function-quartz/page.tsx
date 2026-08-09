import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import MultiFunctionQuartz from "@/@components/pages/Collection/MultiFunctionQuartz/MultiFunctionQuartz";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Multi Function Quartz Watches in Bangladesh",
  description:
    "Buy Original Multi Function Quartz Watches Best prices in Bangladesh at Naviforce Bangladesh. Multi Function Quartz Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MultiFunctionQuartz />
    </Suspense>
  );
}
