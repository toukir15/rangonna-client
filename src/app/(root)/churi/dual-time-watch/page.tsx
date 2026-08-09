import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import DualTimeWatch from "@/@components/pages/Collection/DualTimeWatch/DualTimeWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Dual Time Watches in Bangladesh",
  description:
    "Buy Original Dual Time Watches Best prices in Bangladesh at Naviforce Bangladesh. Dual Time Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <DualTimeWatch />
    </Suspense>
  );
}
