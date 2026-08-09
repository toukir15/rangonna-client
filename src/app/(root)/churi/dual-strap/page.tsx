import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import DualStrap from "@/@components/pages/Collection/DualStrap/DualStrap";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Dual Strap Watches in Bangladesh",
  description:
    "Buy Original Dual Strap Watches Best prices in Bangladesh at Naviforce Bangladesh. Dual Strap Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <DualStrap />
    </Suspense>
  );
}
