import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import SiliconStrap from "@/@components/pages/Collection/SiliconStrap/SiliconStrap";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Silicon Strap Watches in Bangladesh",
  description:
    "Buy Original Silicon Strap Watches Best prices in Bangladesh at Naviforce Bangladesh. Silicon Strap Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <SiliconStrap />
    </Suspense>
  );
}
