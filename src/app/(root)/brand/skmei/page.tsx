import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import SkmeiBrand from "@/@components/pages/Brand/Skmei/Skmei";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Skmei Watches in Bangladesh",
  description:
    "Buy Original Skmei Watches Best prices in Bangladesh at Naviforce Bangladesh. Skmei Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <SkmeiBrand />
    </Suspense>
  );
}
