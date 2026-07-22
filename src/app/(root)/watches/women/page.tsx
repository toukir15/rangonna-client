import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import WomenWatches from "@/@components/pages/Shop/Women/WomenWatches";

export const metadata: Metadata = {
  title: "Branded Women Watches in Bangladesh",
  description:
    "Buy Original Women Watches Best prices in Bangladesh at Naviforce Bangladesh. Women Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <WomenWatches />
    </Suspense>
  );
}
