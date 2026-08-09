import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import LeatherStrap from "@/@components/pages/Collection/LeatherStrap/LeatherStrap";
import PremiumSegment from "@/@components/pages/Collection/PremiumSegment/PremiumSegment";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Premium Watches in Bangladesh",
  description:
    "Buy Original Premium Watches Best prices in Bangladesh at Naviforce Bangladesh. Premium Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <PremiumSegment />
    </Suspense>
  );
}
