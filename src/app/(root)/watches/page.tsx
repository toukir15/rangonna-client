import { Suspense } from "react";
import { Metadata } from "next";
import AllWatches from "@/@components/pages/Shop/All/AllWatches";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";

export const metadata: Metadata = {
  title: "Naviforce Watches in Bangladesh – Luxury Timepieces for Men & Women",
  description:
    "Discover premium Naviforce watches in Bangladesh. Explore stylish, affordable, and original Naviforce watches for men and women. Fast delivery and official warranty.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <AllWatches />
    </Suspense>
  );
}
