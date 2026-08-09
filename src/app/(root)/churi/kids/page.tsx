import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import KidsWatch from "@/@components/pages/Shop/Kids/KidsWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Branded Kids Watches in Bangladesh",
  description:
    "Buy Original Kids Watches Best prices in Bangladesh at Naviforce Bangladesh. Kids Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <KidsWatch />
    </Suspense>
  );
}
