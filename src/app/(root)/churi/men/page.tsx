import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import MenWatches from "@/@components/pages/Shop/Men/MenWatches";

export const metadata: Metadata = {
  title: "Branded Men Watches in Bangladesh",
  description:
    "Buy Original Men Watches Best prices in Bangladesh at Naviforce Bangladesh. Men Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MenWatches />
    </Suspense>
  );
}
