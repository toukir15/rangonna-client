import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import NaviforceBrand from "@/@components/pages/Brand/Naviforce/Naviforce";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Naviforce Watches in Bangladesh",
  description:
    "Buy Original Naviforce Watches Best prices in Bangladesh at Naviforce Bangladesh. Naviforce Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <NaviforceBrand />
    </Suspense>
  );
}
