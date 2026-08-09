import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";

import QuartzChronograph from "@/@components/pages/Collection/QuartzChronograph/QuartzChronograph";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Quartz Chronograph Watches in Bangladesh",
  description:
    "Buy Original Quartz Chronograph Watches Best prices in Bangladesh at Naviforce Bangladesh. Quartz Chronograph Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <QuartzChronograph />
    </Suspense>
  );
}
