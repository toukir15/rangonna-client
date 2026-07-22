import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import LeatherStrap from "@/@components/pages/Collection/LeatherStrap/LeatherStrap";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Leather Strap Watches in Bangladesh",
  description:
    "Buy Original Leather Strap Watches Best prices in Bangladesh at Naviforce Bangladesh. Leather Strap Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <LeatherStrap />
    </Suspense>
  );
}
