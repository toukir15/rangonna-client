import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import SmartWatch from "@/@components/pages/Shop/SmartWatch/SmartWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Smart Watches in Bangladesh",
  description:
    "Buy Original Smart Watches Best prices in Bangladesh at Naviforce Bangladesh. Smart Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <SmartWatch />
    </Suspense>
  );
}
