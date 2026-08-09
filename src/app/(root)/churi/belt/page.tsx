import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import WatchBelt from "@/@components/pages/Accessories/WatchBelt/WatchBelt";

export const metadata: Metadata = {
  title: "Branded Watch Belt in Bangladesh",
  description:
    "Buy Original Watch Belt Best prices in Bangladesh at Naviforce Bangladesh. Watch Belt Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <WatchBelt />
    </Suspense>
  );
}
