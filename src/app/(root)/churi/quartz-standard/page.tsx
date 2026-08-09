import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import QuartzStandard from "@/@components/pages/Collection/QuartzStandard/QuartzStandard";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Men Watches in Bangladesh",
  description:
    "Buy Original Quartz Standard Watches Best prices in Bangladesh at Naviforce Bangladesh. Quartz Standard Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <QuartzStandard />
    </Suspense>
  );
}
