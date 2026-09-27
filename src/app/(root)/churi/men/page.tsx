import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import MenWatches from "@/@components/pages/Shop/Men/MenWatches";

export const metadata: Metadata = {
  title: "Men's Churi & Bangles in Bangladesh",
  description:
    "Shop men's churi and bangle styles at Rangonaa, made for daily wear and gifting in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <MenWatches />
    </Suspense>
  );
}
