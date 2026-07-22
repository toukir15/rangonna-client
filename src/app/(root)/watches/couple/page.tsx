import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import CoupleWatches from "@/@components/pages/Shop/Couple/CoupleWatches";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Couple Watches in Bangladesh",
  description:
    "Buy Original Couple Watches Best prices in Bangladesh at Naviforce Bangladesh. Couple Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <CoupleWatches />
    </Suspense>
  );
}
