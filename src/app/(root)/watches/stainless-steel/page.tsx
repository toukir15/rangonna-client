import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import StainlessSteel from "@/@components/pages/Collection/StainlessSteel/StainlessSteel";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Stainless Steel Watches in Bangladesh",
  description:
    "Buy Original Stainless Steel Watches Best prices in Bangladesh at Naviforce Bangladesh. Stainless Steel Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <StainlessSteel />
    </Suspense>
  );
}
